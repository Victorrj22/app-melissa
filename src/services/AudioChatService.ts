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
const STREAM_CHUNK_SIZE = 256 * 2; // 256 frames * 2 bytes (Int16) = 512 bytes per chunk
const SAMPLE_RATE = 16000;
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
  private recordedPCMChunks: Uint8Array[] = [];
  private isRecordingAudio = false;

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
    this.recordedPCMChunks = [];
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
    this.recordedPCMChunks = [];
    this.isRecordingAudio = true;

    const stream = this.connection!.stream<unknown>('AskMelissaAudioFromMobile', this.subject);
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

    this.isRecordingAudio = false;
    await this.cleanupRecording();

    try {
      // Enviar os chunks de PCM gravados
      await this.streamPCMChunks(this.subject);
      console.log('[AudioChat] Envio do áudio concluído');
    } catch (err) {
      console.warn('[AudioChat] Falha ao enviar áudio gravado.', err);
      this.subject.error?.(err as Error);
    } finally {
      this.subject.complete();
      this.subject = null;
      this.awaitingResponse = false;
      this.recordedPCMChunks = [];
    }
  }

  private async cleanupRecording(): Promise<void> {
    if (this.recording) {
      try {
        const status = await this.recording.stopAndUnloadAsync();
        console.log('[AudioChat] Gravação finalizada, status:', status);
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

      console.log('[AudioChatService] Connecting to SignalR Hub:', hubUrl);

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();

      await connection.start();
      console.log('[AudioChatService] Connected successfully');
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
    
    // Usar preset HIGH_QUALITY que fornece boa qualidade
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    this.recording = recording;
    this.recordingUri = recording.getURI();
    
    console.log('[AudioChat] Gravação iniciada:', this.recordingUri);
  }

  private async streamPCMChunks(subject: Subject<string>): Promise<void> {
    if (!this.recordingUri) {
      throw new Error('Nenhum arquivo de áudio foi gravado.');
    }

    const info = await FileSystem.getInfoAsync(this.recordingUri);
    if (!info.exists || info.isDirectory) {
      throw new Error('Arquivo de audio inexistente.');
    }

    // Ler o arquivo de áudio (AAC/M4A)
    const base64Audio = await FileSystem.readAsStringAsync(this.recordingUri, { encoding: 'base64' });
    if (!base64Audio) {
      throw new Error('Falha ao ler audio gravado.');
    }

    // Converter para bytes brutos
    const audioBytes = Buffer.from(base64Audio, 'base64');
    console.log(`[AudioChat] Áudio gravado: ${audioBytes.byteLength} bytes (formato AAC)`);

    // O servidor espera chunks de áudio
    // Enviar o áudio comprimido em chunks pequenos

    // O servidor vai detectar o formato e decodificar se necessário
    for (let offset = 0; offset < audioBytes.byteLength; offset += STREAM_CHUNK_SIZE) {
      const end = Math.min(offset + STREAM_CHUNK_SIZE, audioBytes.byteLength);
      const chunk = audioBytes.slice(offset, end);
      
      // Converter para base64 para envio via SignalR
      const base64Chunk = chunk.toString('base64');
      subject.next(base64Chunk);
      
      // Pequeno delay para garantir processamento no servidor
      await new Promise(resolve => setTimeout(resolve, 2));
    }
    
    console.log('[AudioChat] Stream de áudio concluído');
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

    // Configurar modo de áudio para reprodução com qualidade
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: RESPONSE_FILE },
      { shouldPlay: false, volume: 1.0, rate: 1.0, progressUpdateIntervalMillis: 100 }
    );
    
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





