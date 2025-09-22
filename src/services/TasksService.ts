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
  private baseUrl: string;
  private defaultTimeoutMs: number;

  constructor(baseUrl: string, options?: { timeoutMs?: number }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeoutMs = options?.timeoutMs ?? 10000;
  }

  private async request<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
    init?: RequestInit,
    options?: RequestOptions
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
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
      const res = await fetch(url.toString(), {
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
    await this.request('/melissa/AddNewItemTask', { taskId: params.taskId, taskDescription: params.taskDescription }, { method: 'POST' });
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

const DEFAULT_BASE_URL = (() => {
  const fromEnv = (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, '');
  const base = fromEnv || 'http://192.168.1.105:5179';
  return base;
})();

export const tasksService = new TasksService(DEFAULT_BASE_URL);
export default tasksService;



