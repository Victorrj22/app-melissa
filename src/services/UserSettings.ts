import * as FileSystem from 'expo-file-system/legacy';

export type UserSettingsSnapshot = {
  server: string;
  email: string;
};

type SettingsListener = (snapshot: UserSettingsSnapshot) => void;

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?: (key: string) => void;
};

type NodeFileStorage = {
  read(): Promise<string | null>;
  write(content: string): Promise<void>;
};

type AsyncStorageModule = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem?: (key: string) => Promise<void>;
};

type AsyncStorageTarget = {
  read(): Promise<string | null>;
  write(content: string): Promise<void>;
  remove?(): Promise<void>;
};

const FIXED_SERVER_HOST = 'melissa.alluneed.com.br';
const SETTINGS_FILE_NAME = 'settings.txt';
const NODE_EXTERNAL_SETTINGS_PATH = 'C:\\dev\\settings.txt';
const SETTINGS_STORAGE_KEY = 'app-melissa::user-settings';
const UTF8_OPTIONS = { encoding: 'utf8' as const };
const DEFAULT_SNAPSHOT: UserSettingsSnapshot = {
  server: FIXED_SERVER_HOST,
  email: ''
};

const PORT_SUFFIX = '';
const URL_PREFIX = 'https://';

class UserSettingsStore {
  private snapshot: UserSettingsSnapshot = { ...DEFAULT_SNAPSHOT };
  private listeners = new Set<SettingsListener>();
  private initPromise: Promise<void> | null = null;
  private bundledDefaultsPromise: Promise<UserSettingsSnapshot> | null = null;
  private readonly filePath: string | null;
  private readonly webStorage: StorageLike | null;
  private readonly nodeStorage: NodeFileStorage | null;
  private readonly asyncStorage: AsyncStorageTarget | null;

  constructor() {
    this.filePath = resolveExpoFilePath();
    this.webStorage = resolveWebStorage();
    this.nodeStorage = resolveNodeFileStorage();
    this.asyncStorage = resolveAsyncStorage();
  }

  async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.loadFromFile();
    }
    return this.initPromise;
  }

  getSnapshot(): UserSettingsSnapshot {
    return { ...this.snapshot };
  }

  getServerHost(): string {
    return this.snapshot.server || FIXED_SERVER_HOST;
  }

  getBaseUrl(): string {
    const host = this.getServerHost();
    return buildBaseUrl(host);
  }

  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    const snapshot = this.getSnapshot();
    console.log('[UserSettings] Subscriber added. Current snapshot:', snapshot);
    listener(snapshot);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async setServerHost(host: string): Promise<UserSettingsSnapshot> {
    await this.init();
    const sanitized = sanitizeServerHost(host);
    if (sanitized === this.snapshot.server) {
      return this.getSnapshot();
    }
    this.snapshot = { ...this.snapshot, server: sanitized };
    await this.persist();
    this.notify();
    console.log('[UserSettings] setServerHost: Servidor atualizado para', sanitized);
    return this.getSnapshot();
  }

  async setEmail(email: string): Promise<UserSettingsSnapshot> {
    await this.init();
    const trimmed = email.trim();
    if (trimmed === this.snapshot.email) {
      return this.getSnapshot();
    }
    this.snapshot = { ...this.snapshot, email: trimmed };
    await this.persist();
    this.notify();
    return this.getSnapshot();
  }

  private async loadFromFile(): Promise<void> {
    try {
      if (!this.hasWritableTarget()) {
        throw new Error('Nao foi possivel resolver um diretorio para salvar as configuracoes.');
      }

      const loadedFromNode = await this.tryLoadFromNodeStorage();
      if (loadedFromNode) {
        return;
      }

      const loadedFromExpo = await this.tryLoadFromExpoFile();
      if (loadedFromExpo) {
        return;
      }

      const loadedFromAsync = await this.tryLoadFromAsyncStorage();
      if (loadedFromAsync) {
        return;
      }

      const loadedFromWeb = await this.tryLoadFromWebStorage();
      if (loadedFromWeb) {
        return;
      }

      const defaults = await this.loadBundledDefaults();
      this.snapshot = { ...defaults };
      const serialized = formatSettings(this.snapshot);
      await this.writeToTargets(serialized);
    } catch (err) {
      console.warn('[UserSettings] Falha ao carregar arquivo de configurações. Seguindo com valor Default', err);
      this.snapshot = { ...DEFAULT_SNAPSHOT };
      try {
        if (!this.hasWritableTarget()) {
          throw err;
        }
        await this.writeToTargets(formatSettings(this.snapshot));
      } catch (writeError) {
        console.warn('[UserSettings] Falha ao escrever as configurações padrão.', writeError);
      }
    } finally {
      this.notify();
    }
  }

  private async tryLoadFromNodeStorage(): Promise<boolean> {
    if (!this.nodeStorage) {
      return false;
    }
    try {
      const content = await this.nodeStorage.read();
      if (!content) {
        return false;
      }
      this.snapshot = parseSettings(content);
      await this.writeToTargets(formatSettings(this.snapshot), { node: true });
      return true;
    } catch (err) {
      console.warn('[UserSettings] Falha ao carregar configurações.', err);
      return false;
    }
  }

  private async tryLoadFromExpoFile(): Promise<boolean> {
    if (!this.filePath) {
      return false;
    }
    try {
      const info = await FileSystem.getInfoAsync(this.filePath);
      if (!info.exists || info.isDirectory) {
        return false;
      }
      const content = await FileSystem.readAsStringAsync(this.filePath, UTF8_OPTIONS);
      this.snapshot = parseSettings(content);
      await this.writeToTargets(formatSettings(this.snapshot), { expo: true });
      return true;
    } catch (err) {
      console.warn('[UserSettings] Falha ao carregar configurações externas.', err);
      return false;
    }
  }

  private async tryLoadFromAsyncStorage(): Promise<boolean> {
    if (!this.asyncStorage) {
      return false;
    }
    try {
      const stored = await this.asyncStorage.read();
      if (!stored) {
        return false;
      }
      this.snapshot = parseSettings(stored);
      await this.writeToTargets(formatSettings(this.snapshot), { async: true });
      return true;
    } catch (err) {
      console.warn('[UserSettings] Failed to load settings from async storage.', err);
      return false;
    }
  }

  private async tryLoadFromWebStorage(): Promise<boolean> {
    if (!this.webStorage) {
      return false;
    }
    try {
      const stored = this.webStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        return false;
      }
      this.snapshot = parseSettings(stored);
      await this.writeToTargets(formatSettings(this.snapshot), { web: true });
      return true;
    } catch (err) {
      console.warn('[UserSettings] Falha ao carregar configurações da Web.', err);
      return false;
    }
  }

  private async persist(): Promise<void> {
    if (!this.hasWritableTarget()) {
      throw new Error('Nao foi possivel resolver um diretorio para salvar as configuracoes.');
    }
    await this.writeToTargets(formatSettings(this.snapshot));
  }

  private async writeToTargets(
    serialized: string,
    skip?: Partial<Record<'node' | 'expo' | 'web' | 'async', boolean>>
  ): Promise<void> {
    const tasks: Promise<void>[] = [];

    if (this.nodeStorage && !skip?.node) {
      tasks.push(this.nodeStorage.write(serialized));
    }

    if (this.filePath && !skip?.expo) {
      tasks.push(
        FileSystem.writeAsStringAsync(this.filePath, serialized, UTF8_OPTIONS)
      );
    }

    if (this.asyncStorage && !skip?.async) {
      tasks.push(this.asyncStorage.write(serialized));
    }

    if (this.webStorage && !skip?.web) {
      tasks.push(
        Promise.resolve().then(() => {
          this.webStorage?.setItem(SETTINGS_STORAGE_KEY, serialized);
        })
      );
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  }

  private hasWritableTarget(): boolean {
    return Boolean(this.nodeStorage || this.filePath || this.webStorage || this.asyncStorage);
  }

  private notify(): void {
    const current = this.getSnapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.warn('[UserSettings] Listener threw an error.', err);
      }
    });
  }

  private async loadBundledDefaults(): Promise<UserSettingsSnapshot> {
    if (!this.bundledDefaultsPromise) {
      this.bundledDefaultsPromise = Promise.resolve({ ...DEFAULT_SNAPSHOT });
    }
    return this.bundledDefaultsPromise;
  }
}

function resolveExpoFilePath(): string | null {
  const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? null;
  if (!directory) {
    return null;
  }
  return directory.endsWith('/') ? `${directory}${SETTINGS_FILE_NAME}` : `${directory}/${SETTINGS_FILE_NAME}`;
}

function resolveWebStorage(): StorageLike | null {
  try {
    const globalAny = globalThis as Record<string, unknown>;
    const candidate = globalAny?.localStorage as StorageLike | undefined;
    if (candidate && typeof candidate.getItem === 'function' && typeof candidate.setItem === 'function') {
      return candidate;
    }
  } catch (err) {
    console.warn('[UserSettings] Falha ao acessar armazenamento Web', err);
  }
  return null;
}

function resolveNodeFileStorage(): NodeFileStorage | null {
  if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
    return null;
  }

  let requireFn: ((id: string) => unknown) | null = null;
  if (typeof (globalThis as Record<string, unknown>).require === 'function') {
    requireFn = (globalThis as Record<string, unknown>).require as (id: string) => unknown;
  } else if (typeof eval === 'function') {
    try {
      requireFn = eval('require') as (id: string) => unknown;
    } catch (err) {
      requireFn = null;
    }
  }

  if (!requireFn) {
    return null;
  }

  try {
    const fs = requireFn('fs') as typeof import('fs');
    const pathModule = requireFn('path') as typeof import('path');
    if (!fs?.promises || typeof pathModule?.resolve !== 'function') {
      return null;
    }

    const filePath = pathModule.resolve(NODE_EXTERNAL_SETTINGS_PATH || `${process.cwd()}/${SETTINGS_FILE_NAME}`);

    return {
      async read() {
        try {
          return await fs.promises.readFile(filePath, 'utf8');
        } catch (err: unknown) {
          if (isNodeNotFoundError(err)) {
            return null;
          }
          throw err;
        }
      },
      async write(content: string) {
        await fs.promises.mkdir(pathModule.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, content, 'utf8');
      }
    };
  } catch (err) {
    const shouldLog = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
    if (shouldLog) {
      console.warn('[UserSettings] Node file storage unavailable.', err);
    }
    return null;
  }
}

function resolveAsyncStorage(): AsyncStorageTarget | null {
  let moduleRef: AsyncStorageModule | undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const requiredModule = require('@react-native-async-storage/async-storage');
    moduleRef = (requiredModule?.default ?? requiredModule) as AsyncStorageModule | undefined;
  } catch (err) {
    const shouldLog = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
    if (shouldLog) {
      console.warn('[UserSettings] Async storage module unavailable.', err);
    }
    moduleRef = undefined;
  }

  if (!moduleRef || typeof moduleRef.getItem !== 'function' || typeof moduleRef.setItem !== 'function') {
    return null;
  }

  const shouldLog = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  const storage = moduleRef;

  return {
    async read() {
      try {
        return await storage.getItem(SETTINGS_STORAGE_KEY);
      } catch (err) {
        if (shouldLog) {
          console.warn('[UserSettings] Falha ao ler configurações de armazenamento assíncrono.', err);
        }
        return null;
      }
    },
    async write(content: string) {
      await storage.setItem(SETTINGS_STORAGE_KEY, content);
    },
    async remove() {
      if (typeof storage.removeItem === 'function') {
        await storage.removeItem(SETTINGS_STORAGE_KEY);
      }
    }
  };
}

function isNodeNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const code = (error as { code?: string }).code;
  return code === 'ENOENT' || code === 'EISDIR';
}

export function sanitizeServerHost(value: string): string {
  if (!value) return '';

  let host = value.trim();
  if (!host) return '';

  host = host.replace(/^https?:\/\//i, '');

  if (host.startsWith('[')) {
    const closingIndex = host.indexOf(']');
    if (closingIndex !== -1) {
      host = host.slice(1, closingIndex) + host.slice(closingIndex + 1);
    }
  }

  const slashIndex = host.indexOf('/');
  if (slashIndex !== -1) host = host.slice(0, slashIndex);

  const queryIndex = host.indexOf('?');
  if (queryIndex !== -1) host = host.slice(0, queryIndex);

  const hashIndex = host.indexOf('#');
  if (hashIndex !== -1) host = host.slice(0, hashIndex);

  if (!host.includes(']')) {
    const colonIndex = host.lastIndexOf(':');
    if (colonIndex !== -1) {
      const portCandidate = host.slice(colonIndex + 1);
      if (/^\d+$/.test(portCandidate)) {
        host = host.slice(0, colonIndex);
      }
    }
  }

  return host.trim();
}

export function buildBaseUrl(host?: string): string {
  const effectiveHost = host || userSettings.getServerHost();
  const url = `${URL_PREFIX}${effectiveHost}${PORT_SUFFIX}`;
  console.log('[UserSettings] buildBaseUrl:', { output: url });
  return url;
}

function parseSettings(content: string): UserSettingsSnapshot {
  const result: UserSettingsSnapshot = { ...DEFAULT_SNAPSHOT };
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    if (key === 'servidor' || key === 'server') {
      result.server = sanitizeServerHost(value) || result.server;
    } else if (key === 'email') {
      result.email = value;
    }
  }
  return result;
}

function formatSettings(snapshot: UserSettingsSnapshot): string {
  return `email: ${snapshot.email}\nservidor: ${snapshot.server}\n`;
}

const userSettings = new UserSettingsStore();
void userSettings.init().catch((err) => {
  console.warn('[UserSettings] Initial load failed.', err);
});

export default userSettings;








