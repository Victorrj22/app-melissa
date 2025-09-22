export type RequestOptions = {
  timeoutMs?: number;
};

export class HolidaysService {
  private baseUrl: string;
  private defaultTimeoutMs: number;

  constructor(baseUrl: string, options?: { timeoutMs?: number }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeoutMs = options?.timeoutMs ?? 10000;
  }

  private async request<T>(
    path: string,
    query?: Record<string, string>,
    init?: RequestInit,
    options?: RequestOptions
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? this.defaultTimeoutMs);

    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain;q=0.9, */*;q=0.8'
    };

    try {
      const finalUrl = url.toString();
      console.log('[HolidaysService] GET', finalUrl);
      const res = await fetch(finalUrl, {
        ...init,
        headers: { ...headers, ...(init?.headers as any) },
        signal: controller.signal
      });

      const contentType = res.headers.get('content-type') || '';
      const bodyText = await res.text();
      let data: unknown = {};
      if (bodyText) {
        if (contentType.includes('application/json')) {
          data = JSON.parse(bodyText) as unknown;
        } else {
          data = bodyText as unknown;
        }
      }

      if (!res.ok) {
        const message =
          (data as any)?.message || (data as any)?.error || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      return data as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  async exportNationalHolidaysToTxt(): Promise<void> {
    await this.request<string | number>(
      '/melissa/ExportNationalHolidaysToTxt',
      undefined,
      { method: 'GET' }
    );
  }
}

const DEFAULT_BASE_URL = (() => {
  const fromEnv = (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, '');
  const base = fromEnv || 'http://192.168.1.105:5179';
  return base;
})();

export const holidaysService = new HolidaysService(DEFAULT_BASE_URL);
export default holidaysService;
