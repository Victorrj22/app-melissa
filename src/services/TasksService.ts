import userSettings from './UserSettings';

export type AddNewTaskParams = { taskTitle: string; taskDescription?: string | null };
export type AddNewItemParams = { taskId: number; taskDescription: string };
export type CompleteItemParams = { taskItenId: number };
export type CancelItemParams = { taskItenId: number; taskId: number };
export type SendTaskByEmailParams = { email: string; taskId: number; taskName: string };
export type ArchiveTaskParams = { taskId: number };
export type UnarchiveTaskParams = { taskId: number };

export type TaskDto = {
  id: number;
  title: string;
  description: string;
  includedAt: string;
  isArchived?: boolean;
};

export type TaskItemDto = {
  id: number;
  taskId: number;
  description: string;
  includedAt: string;
  completedAt?: string | null;
  isCompleted: boolean;
  canceledAt?: string | null;
  isCanceled: boolean;
};

type RequestOptions = { timeoutMs?: number };

export class TasksService {
  private readonly baseUrlProvider: () => string;
  private defaultTimeoutMs: number;
  private addItemEndpoint?: string;

  constructor(baseUrlProvider: () => string, options?: { timeoutMs?: number }) {
    this.baseUrlProvider = baseUrlProvider;
    this.defaultTimeoutMs = options?.timeoutMs ?? 10000;
  }

  private async request<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
    init?: RequestInit,
    options?: RequestOptions
  ): Promise<T> {
    const baseUrl = (this.baseUrlProvider() || DEFAULT_BASE_URL).replace(/\/$/, '');
    const url = new URL(baseUrl + path);
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }

    const method = (init?.method || 'GET').toString().toUpperCase();
    // Bust cache for GET requests to avoid stale lists after archive/unarchive
    if (method === 'GET') {
      url.searchParams.set('_', Date.now().toString());
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? this.defaultTimeoutMs);

    try {
      const finalUrl = url.toString();
      console.log(`[TasksService] ${method}`, finalUrl);
      const res = await fetch(finalUrl, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers as any) },
        signal: controller.signal
      });

      const contentType = res.headers.get('content-type') || '';
      const bodyText = await res.text();
      let data: unknown = {};
      if (bodyText) {
        if (contentType.includes('application/json')) data = JSON.parse(bodyText);
        else data = bodyText;
      }

      if (!res.ok) {
        const message = (data as any)?.message || (data as any)?.error || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      return data as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Endpoints
  async AddNewTask(params: AddNewTaskParams): Promise<void> {
    await this.request('/melissa/AddNewTask', { taskTitle: params.taskTitle, taskDescription: params.taskDescription ?? undefined }, { method: 'POST' });
  }

  async AddNewItemTask(params: AddNewItemParams): Promise<void> {
    // If a working endpoint was discovered previously, try it first
    if (this.addItemEndpoint) {
      try {
        await this.request(this.addItemEndpoint, { taskId: params.taskId, taskDescription: params.taskDescription }, { method: 'POST' });
        return;
      } catch (e: any) {
        // If server changed and this route is gone, forget and re-discover
        if (typeof e?.message === 'string' && e.message.includes('HTTP 404')) {
          this.addItemEndpoint = undefined;
        } else {
          throw e;
        }
      }
    }

    // Discover the correct endpoint once and cache it
    const candidates = [
      '/melissa/AddNewItenTask',
      '/melissa/AddNewItemTask',
      '/melissa/AddNewTaskItem',
      '/melissa/AddNewItensTask'
    ];
    let lastErr: unknown;
    for (const path of candidates) {
      try {
        await this.request(path, { taskId: params.taskId, taskDescription: params.taskDescription }, { method: 'POST' });
        this.addItemEndpoint = path;
        return;
      } catch (e: any) {
        lastErr = e;
        if (typeof e?.message === 'string' && e.message.includes('HTTP 404')) {
          continue; // try next candidate silently
        }
        // For non-404 errors, rethrow immediately
        throw e;
      }
    }
    // If all variants failed with 404, throw the last error
    throw lastErr instanceof Error ? lastErr : new Error('Falha ao adicionar item da tarefa');
  }

  async GetAllTasks(): Promise<TaskDto[]> {
    return await this.request<TaskDto[]>('/melissa/GetAllTasks', undefined, { method: 'GET' });
  }

  async GetArchivedTasks(): Promise<TaskDto[]> {
    return await this.request<TaskDto[]>('/melissa/GetArchivedTasks', undefined, { method: 'GET' });
  }

  async GetAllItensTasks(taskId: number): Promise<TaskItemDto[]> {
    return await this.request<TaskItemDto[]>('/melissa/GetAllItensTasks', { taskId }, { method: 'GET' });
  }

  async CompleteItemTask(params: CompleteItemParams): Promise<void> {
    await this.request('/melissa/CompleteItemTask', { taskItenId: params.taskItenId }, { method: 'POST' });
  }

  async CancelTaskItemById(params: CancelItemParams): Promise<void> {
    await this.request('/melissa/CancelTaskItemById', { taskItenId: params.taskItenId, taskId: params.taskId }, { method: 'POST' });
  }

  async SendTaskByEmail(params: SendTaskByEmailParams): Promise<void> {
    await this.request('/melissa/SendTaskByEmail', { email: params.email, taskId: params.taskId, taskName: params.taskName }, { method: 'POST' });
  }

  async ArchiveTaskById(params: ArchiveTaskParams): Promise<void> {
    await this.request('/melissa/ArchiveTaskById', { taskId: params.taskId }, { method: 'POST' });
  }

  async UnarchiveTaskById(params: UnarchiveTaskParams): Promise<void> {
    await this.request('/melissa/UnarchiveTaskById', { taskId: params.taskId }, { method: 'POST' });
  }
}

const DEFAULT_BASE_URL = userSettings.getBaseUrl();

const resolveBaseUrl = (): string => {
  const fromEnv = (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, '');
  }
  return userSettings.getBaseUrl();
};

export const tasksService = new TasksService(resolveBaseUrl);
export default tasksService;


