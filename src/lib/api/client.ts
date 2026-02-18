import { ApiError } from '@/src/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiClientError extends Error {
  statusCode: number;
  error?: string;

  constructor(message: string, statusCode: number, error?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const error: ApiError = await response.json();
      throw new ApiClientError(
        error.message || 'Error en la petición',
        response.status,
        error.error
      );
    }
    throw new ApiClientError(
      `Error ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  if (isJson) {
    return response.json();
  }

  return {} as T;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;

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
