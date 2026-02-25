const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Error class ────────────────────────────────────────────────────────────

export interface ApiClientErrorOptions {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  /** HTTP status code */
  status: number;
  /** Short error code from the backend (optional) */
  code?: string;
  /** Raw details/issues payload from the backend (optional) */
  details?: unknown;

  // Legacy alias kept for backwards compatibility
  get statusCode(): number {
    return this.status;
  }

  constructor(opts: ApiClientErrorOptions | string, statusCode?: number, errorCode?: string) {
    // Support legacy `new ApiClientError(message, status, code)` call-sites
    if (typeof opts === 'string') {
      super(opts);
      this.status    = statusCode ?? 0;
      this.code      = errorCode;
    } else {
      super(opts.message);
      this.status    = opts.status;
      this.code      = opts.code;
      this.details   = opts.details;
    }
    this.name = 'ApiClientError';
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Safely extract a human-readable message from any shape the backend may send.
 * Never throws, never calls .map() on anything.
 */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.length > 0) return body;

  if (body !== null && typeof body === 'object') {
    const obj = body as Record<string, unknown>;

    // { error: { message, … } }
    if (obj['error'] !== null && typeof obj['error'] === 'object') {
      const inner = obj['error'] as Record<string, unknown>;
      if (typeof inner['message'] === 'string' && inner['message'].length > 0) {
        return inner['message'];
      }
    }

    // { message: "…" }
    if (typeof obj['message'] === 'string' && obj['message'].length > 0) {
      return obj['message'];
    }

    // { error: "…" }  (string)
    if (typeof obj['error'] === 'string' && obj['error'].length > 0) {
      return obj['error'];
    }
  }

  return fallback;
}

/**
 * Safely extract optional fields (code, details) from the backend body.
 * Never throws.
 */
function extractErrorMeta(body: unknown): { code?: string; details?: unknown } {
  if (body === null || typeof body !== 'object') return {};

  const obj = body as Record<string, unknown>;

  // Prefer nested { error: { code, details } }
  const inner =
    obj['error'] !== null && typeof obj['error'] === 'object'
      ? (obj['error'] as Record<string, unknown>)
      : obj;

  return {
    code:    typeof inner['code']    === 'string' ? inner['code']    : undefined,
    details: inner['details'] !== undefined        ? inner['details'] : undefined,
  };
}

// ─── Core ────────────────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    const fallback = `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
    let body: unknown = undefined;

    // Try to parse the error body — never crash on malformed responses
    try {
      if (isJson) {
        body = await response.json();
      } else {
        const text = await response.text();
        body = text.trim() || undefined;
      }
    } catch {
      // Body could not be parsed — body stays undefined
    }

    const message = extractErrorMessage(body, fallback);
    const { code, details } = extractErrorMeta(body);

    throw new ApiClientError({ status: response.status, message, code, details });
  }

  if (isJson) {
    return response.json() as Promise<T>;
  }

  return {} as T;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Añadir /api como prefijo base si el endpoint no lo incluye ya
  const normalizedEndpoint = endpoint.startsWith('/api/')
    ? endpoint
    : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let url = `${API_URL}${normalizedEndpoint}`;

  // Add query params si existen
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include', // Importante para enviar cookies httpOnly
  };

  const response = await fetch(url, config);
  return handleResponse<T>(response);
}

// Métodos auxiliares
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
