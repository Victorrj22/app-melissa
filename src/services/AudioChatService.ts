import { Buffer } from 'buffer';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  Subject
} from '@microsoft/signalr';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { AppState, AppStateStatus } from 'react-native';
import userSettings from './UserSettings';

type Nullable<T> = T | null;

const RESPONSE_DIRECTORY = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? null;
const RESPONSE_FILE = RESPONSE_DIRECTORY ? `${RESPONSE_DIRECTORY}melissa-response.aac` : null;
const STREAM_CHUNK_SIZE = 16 * 1024;
const ensureBufferPolyfill = () => {
  if (typeof global.Buffer === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    (global as any).Buffer = Buffer;
  }
};

class AudioChatService {
  private connection: Nullable<HubConnection> = null;
  private connectionPromise: Promise<void> | null = null;
  private subject: Nullable<Subject<string>> = null;
  private recording: Nullable<Audio.Recording> = null;
  private recordingUri: string | null = null;
  private awaitingResponse = false;
  private currentAppState: AppStateStatus = AppState.currentState;

  constructor() {
    ensureBufferPolyfill();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextState: AppStateStatus) => {
    if (this.currentAppState.match(/active/) && nextState.match(/inactive|background/)) {
      void this.cancelStreaming();
    }
    this.currentAppState = nextState;
  };

  private async cancelStreaming(): Promise<void> {
    await this.cleanupRecording();
    if (this.subject) {
      this.subject.error?.(new Error('Transmissão cancelada.'));
      this.subject = null;
    }
    if (this.recordingUri) {
      await this.deleteFileSafe(this.recordingUri);
      this.recordingUri = null;
    }
    this.awaitingResponse = false;
  }

  async startStreaming(): Promise<void> {
    if (this.awaitingResponse) {
      throw new Error('Aguarde o fim da resposta anterior.');
    }
    if (this.recording) {
      return;
    }

    await this.ensureConnection();
    await this.prepareRecording();
    this.subject = new Subject<string>();
    this.awaitingResponse = true;

    const stream = this.connection!.stream<unknown>('AskMelissaAudio', this.subject);
    const receivedChunks: Uint8Array[] = [];

    stream.subscribe({
      next: (chunk) => {
        if (typeof chunk === 'string') {
          receivedChunks.push(Uint8Array.from(Buffer.from(chunk, 'base64')));
        } else if (chunk instanceof ArrayBuffer) {
          receivedChunks.push(new Uint8Array(chunk));
        } else if (Array.isArray(chunk)) {
          receivedChunks.push(Uint8Array.from(chunk));
        } else {
          console.warn('[AudioChat] Ignorando chunk de áudio em formato desconhecido.');
        }
      },
      complete: () => {
        void this.playResponse(receivedChunks).finally(() => {
          this.awaitingResponse = false;
        });
      },
      error: (err) => {
        console.warn('[AudioChat] Falha ao receber resposta de áudio.', err);
        this.awaitingResponse = false;
      }
    });
  }

  async stopStreaming(): Promise<void> {
    if (!this.subject) {
      return;
    }

    await this.cleanupRecording();

    if (!this.recordingUri) {
      this.subject.complete();
      this.subject = null;
      this.awaitingResponse = false;
      return;
    }

    try {
      await this.streamFileAsChunks(this.recordingUri, this.subject);
    } catch (err) {
      console.warn('[AudioChat] Falha ao enviar áudio gravado.', err);
      this.subject.error?.(err as Error);
    } finally {
      await this.deleteFileSafe(this.recordingUri);
      this.recordingUri = null;
      this.subject.complete();
      this.subject = null;
      this.awaitingResponse = false;
    }
  }

  private async cleanupRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (err) {
        console.warn('[AudioChat] Falha ao finalizar gravação.', err);
      }
      this.recording = null;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      await userSettings.init();
      const baseUrl = userSettings.getBaseUrl().replace(/\/$/, '');
      const hubUrl = `${baseUrl}/melissa`;

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();

      await connection.start();
      this.connection = connection;
    })();

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async prepareRecording(): Promise<void> {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      throw new Error('Permissão de microfone negada.');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    this.recording = recording;
    this.recordingUri = recording.getURI();
  }
  private async streamFileAsChunks(path: string, subject: Subject<string>): Promise<void> {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists || info.isDirectory) {
      throw new Error('Arquivo de audio inexistente.');
    }

    const base64 = await FileSystem.readAsStringAsync(path, { encoding: 'base64' });
    if (!base64) {
      throw new Error('Falha ao ler audio gravado.');
    }

    const bytes = Buffer.from(base64, 'base64');
    for (let offset = 0; offset < bytes.byteLength; offset += STREAM_CHUNK_SIZE) {
      const end = Math.min(offset + STREAM_CHUNK_SIZE, bytes.byteLength);
      const view = bytes.subarray(offset, end);
      const base64Chunk = Buffer.from(view).toString('base64');
      subject.next(base64Chunk);
    }
  }

  private async deleteFileSafe(path: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(path, { idempotent: true });
    } catch {}
  }

  private async playResponse(chunks: Uint8Array[]): Promise<void> {
    if (!chunks.length) {
      return;
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const base64 = Buffer.from(merged).toString('base64');
    if (!RESPONSE_FILE) {
      console.warn('[AudioChat] Diretório de cache indisponível, não é possível reproduzir áudio.');
      return;
    }

    await FileSystem.writeAsStringAsync(RESPONSE_FILE, base64, {
      encoding: 'base64'
    });

    const { sound } = await Audio.Sound.createAsync({ uri: RESPONSE_FILE });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) {
        return;
      }
      if (status.didJustFinish) {
        void sound.unloadAsync().catch((err) => {
          console.warn('[AudioChat] Falha ao liberar reprodução.', err);
        });
      }
    });
    await sound.playAsync();
  }
}

const audioChatService = new AudioChatService();

export default audioChatService;





