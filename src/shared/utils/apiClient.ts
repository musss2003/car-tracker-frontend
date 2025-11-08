/**
 * Enhanced API Client with automatic token refresh
 * Handles authentication and token management automatically
 */

import { getAuthHeaders } from './getAuthHeaders';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  /**
   * Make an authenticated API request with automatic token refresh
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Initial request with current access token
    let response = await this.makeRequest<T>(url, options);

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401) {

      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        response = await this.makeRequest<T>(url, options);
      }
    }

    return response;
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Always include cookies (refresh token)
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      let data: T;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      if (!response.ok) {
        throw {
          message: (data as any)?.message || `HTTP ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      return {
        data,
        status: response.status,
        ok: response.ok,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error; // Re-throw ApiError
      }

      throw {
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * Attempt to refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/session-check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      return false;
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get<T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
