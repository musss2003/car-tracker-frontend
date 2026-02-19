/**
 * Centralized API Service with consistent error handling
 * Provides a unified interface for all API calls across the application
 */

import { getAuthHeaders } from './getAuthHeaders';
import { fetchWithErrorHandling } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;
  resourceName: string;
  operation: string;
  resourceId?: string;
  responseType?: 'json' | 'blob'; // Add responseType option
}

/**
 * Main API request function with automatic error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = true,
    resourceName,
    operation,
    resourceId,
    responseType = 'json',
  } = options;

  const url = `${BASE_URL}${endpoint}`;

  // Build headers, but remove Content-Type if body is FormData
  let mergedHeaders = {
    ...(includeAuth ? getAuthHeaders() : {}),
    ...headers,
  };

  let requestOptions: RequestInit = {
    method,
    headers: mergedHeaders,
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      // Remove Content-Type if present (browser will set it with boundary)
      if ('Content-Type' in mergedHeaders) {
        const { ['Content-Type']: _, ...rest } = mergedHeaders;
        requestOptions.headers = rest;
      }
      requestOptions.body = body;
    } else {
      requestOptions.headers = {
        ...mergedHeaders,
        'Content-Type': 'application/json',
      };
      requestOptions.body = JSON.stringify(body);
    }
  }

  return fetchWithErrorHandling<T>(url, requestOptions, {
    operation,
    resource: resourceName,
    resourceId,
    responseType,
  });
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(
    endpoint: string,
    resourceName: string,
    resourceId?: string
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'GET',
      resourceName,
      operation: 'fetch',
      resourceId,
    }),

  /**
   * POST request
   */
  post: <T>(
    endpoint: string,
    data: any,
    resourceName: string,
    resourceId?: string
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data,
      resourceName,
      operation: 'create',
      resourceId,
    }),

  /**
   * PUT request (full update)
   */
  put: <T>(
    endpoint: string,
    data: any,
    resourceName: string,
    resourceId?: string
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data,
      resourceName,
      operation: 'update',
      resourceId,
    }),

  /**
   * PATCH request (partial update)
   */
  patch: <T>(
    endpoint: string,
    data: any,
    resourceName: string,
    resourceId?: string
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data,
      resourceName,
      operation: 'update',
      resourceId,
    }),

  /**
   * DELETE request
   */
  delete: <T>(
    endpoint: string,
    resourceName: string,
    resourceId?: string
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
      resourceName,
      operation: 'delete',
      resourceId,
    }),
};

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return query ? `?${query}` : '';
}

/**
 * Safe URL parameter encoding
 */
export function encodePathParam(param: string | number): string {
  return encodeURIComponent(String(param));
}
