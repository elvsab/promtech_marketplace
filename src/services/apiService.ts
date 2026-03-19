// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (!this.baseUrl) {
      console.warn('VITE_API_BASE_URL is not set in environment variables');
    }
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Добавляет token как query параметр к URL
  private addTokenToUrl(url: string): string {
    const token = this.getAuthToken();
    if (!token) return url;
    
    // Если token начинается с "mock_token_", используем "fake-token" для API
    const apiToken = token.startsWith('mock_token_') ? 'fake-token' : token;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${encodeURIComponent(apiToken)}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    silent: boolean = false,
    useTokenInQuery: boolean = false,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    
    // Добавляем query параметры, если они есть
    if (queryParams) {
      // Если baseUrl пустой, создаем относительный URL
      const baseUrlForParsing = this.baseUrl || 'http://localhost';
      try {
        const urlObj = new URL(url, baseUrlForParsing);
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            urlObj.searchParams.append(key, String(value));
          }
        });
        // Если baseUrl был пустым, возвращаем только pathname + search
        if (!this.baseUrl) {
          url = urlObj.pathname + urlObj.search;
        } else {
          url = urlObj.toString();
        }
      } catch (e) {
        // Fallback: добавляем параметры вручную
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      }
    }
    
    // Если нужно передавать token в query параметре
    if (useTokenInQuery) {
      url = this.addTokenToUrl(url);
    }
    
        const defaultHeaders: HeadersInit = {
          'accept': 'application/json',
        };

        // Устанавливаем Content-Type только если он не был установлен в options.headers
        if (!options.headers || !(options.headers as HeadersInit)['Content-Type']) {
          defaultHeaders['Content-Type'] = 'application/json';
        }

        // Если не используем token в query, добавляем в заголовок
        if (!useTokenInQuery) {
          const token = this.getAuthToken();
          if (token && !token.startsWith('mock_token_')) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
          }
        }

        const config: RequestInit = {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
        };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        // Try to parse error response
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
          errorDetails = errorData;
          // Если есть детали ошибки валидации, добавляем их
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail.map((err: any) => 
              `${err.loc?.join('.')}: ${err.msg || err.type}`
            ).join(', ');
            if (validationErrors) {
              errorMessage = validationErrors;
            }
          }
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          details: errorDetails,
        };

        // Only log non-404 errors or if not silent
        if (!silent && response.status !== 404) {
          console.error(`API Error [${response.status}]:`, errorMessage, endpoint);
        }

        throw error;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof TypeError) {
        const networkError: ApiError = {
          message: `Network error: ${error.message}`,
        };
        if (!silent) {
          console.error('Network Error:', networkError.message);
        }
        throw networkError;
      }
      throw error;
    }
  }

  // GET request
  async get<T>(
    endpoint: string, 
    silent: boolean = false, 
    useTokenInQuery: boolean = false,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    }, silent, useTokenInQuery, queryParams);
  }

  // POST request
  async post<T>(
    endpoint: string, 
    data?: unknown, 
    silent: boolean = false, 
    useTokenInQuery: boolean = false,
    params?: Record<string, string | number | boolean>,
    contentType: 'json' | 'form-urlencoded' = 'json'
  ): Promise<T> {
    let body: string | undefined;
    const headers: HeadersInit = {};

    if (data) {
      if (contentType === 'form-urlencoded') {
        // Преобразуем объект в form-urlencoded формат
        const formData = new URLSearchParams();
        Object.entries(data as Record<string, any>).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        body = formData.toString();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers,
    }, silent, useTokenInQuery, params);
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown, silent: boolean = false, useTokenInQuery: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, silent, useTokenInQuery);
  }

  // DELETE request
  async delete<T>(endpoint: string, silent: boolean = false, useTokenInQuery: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    }, silent, useTokenInQuery);
  }
}

export const apiService = new ApiService();
