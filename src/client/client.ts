import { parseCookies } from 'nookies';

export type ApiResponse<T> = {
  data: T;
  status: number;
  error?: string;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(isFormData: boolean): HeadersInit {
    const cookies = parseCookies();
    const token = cookies.token;

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    body?: any,
    isFile?: boolean
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: this.getHeaders(!!isFile),
    };

    if (body && !isFile) {
      options.body = JSON.stringify(body);
    } else if (body && isFile) {
      options.body = body;
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (response.ok) {
        return {
          data: result,
          status: response.status,
        };
      }

      const errorMessage =
        result.message || result.error || 'Erro desconhecido!';
      return {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        data: null as any,
        status: response.status,
        error: errorMessage,
      };
    } catch (error) {
      return {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        data: null as any,
        status: 500,
        error: (error as Error).message || 'Erro ao fazer requisição',
      };
    }
  }

  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET');
  }

  post<T>(
    endpoint: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    body: any,
    isFile?: boolean
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, isFile);
  }

  put<T>(
    endpoint: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    body: any,
    isFile?: boolean
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, isFile);
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE');
  }

  patch<T>(
    endpoint: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    body: any,
    isFile?: boolean
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', body, isFile);
  }
}

export default ApiClient;
