/**
 * Centralized API Service with consistent error handling
 * Provides a unified interface for all API calls across the application
 */
import { getAuthHeaders } from './getAuthHeaders';
import { fetchWithErrorHandling } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type BodyType =
  | FormData
  | Blob
  | ArrayBuffer
  | ArrayBufferView
  | URLSearchParams
  | string
  | object;

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: BodyType;
  headers?: Record<string, string | null>; // null allows callers to strip a header
  includeAuth?: boolean;
  resourceName: string;
  operation: string;
  resourceId?: string;
  responseType?: 'json' | 'blob';
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Serializes the request body and returns the appropriate Content-Type.
 * Returns `null` for Content-Type when the browser must set it (FormData boundary).
 */
function prepareBody(body: BodyType): {
  serialized: BodyInit;
  contentType: string | null;
} {
  if (body instanceof FormData) {
    return { serialized: body, contentType: null };
  }
  if (body instanceof Blob) {
    return {
      serialized: body,
      contentType: body.type || 'application/octet-stream',
    };
  }
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return {
      serialized: body as BodyInit,
      contentType: 'application/octet-stream',
    };
  }
  if (body instanceof URLSearchParams) {
    return {
      serialized: body,
      contentType: 'application/x-www-form-urlencoded',
    };
  }
  if (typeof body === 'string') {
    return { serialized: body, contentType: 'text/plain' };
  }
  // Plain object / array → JSON
  return { serialized: JSON.stringify(body), contentType: 'application/json' };
}

/**
 * Merges headers with a clear priority chain:
 *   auth (lowest) → auto-detected content-type → caller overrides (highest)
 * A `null` value explicitly removes a header.
 */
function buildHeaders(
  auth: Record<string, string>,
  derived: Record<string, string | null>,
  overrides: Record<string, string | null>
): Record<string, string> {
  const merged: Record<string, string> = { ...auth };

  for (const [key, value] of Object.entries(derived)) {
    if (value === null) delete merged[key];
    else merged[key] = value;
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) delete merged[key];
    else merged[key] = value;
  }

  return merged;
}

// ─── Core request function ───────────────────────────────────────────────────

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
  const authHeaders = includeAuth ? getAuthHeaders() : {};

  let finalHeaders: Record<string, string>;
  let requestBody: BodyInit | undefined;

  if (body && method !== 'GET') {
    const { serialized, contentType } = prepareBody(body);
    // null contentType means FormData — actively remove any Content-Type that
    // may have come from auth headers so the browser can set the boundary
    const derivedContentHeader: Record<string, string | null> = {
      'Content-Type': contentType, // null is handled by buildHeaders
    };
    finalHeaders = buildHeaders(authHeaders, derivedContentHeader, headers);
    requestBody = serialized;
  } else {
    finalHeaders = buildHeaders(authHeaders, {}, headers);
  }

  return fetchWithErrorHandling<T>(
    url,
    {
      method,
      headers: finalHeaders,
      credentials: 'include',
      body: requestBody,
    },
    { operation, resource: resourceName, resourceId, responseType }
  );
}

// ─── Convenience methods ─────────────────────────────────────────────────────

export const api = {
  /** GET request */
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

  /** POST request */
  post: <T>(
    endpoint: string,
    data: BodyType,
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

  /** PUT request (full update) */
  put: <T>(
    endpoint: string,
    data: BodyType,
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

  /** PATCH request (partial update) */
  patch: <T>(
    endpoint: string,
    data: BodyType,
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

  /** DELETE request */
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

  /** POST with blob response (e.g. file download) */
  download: <T>(
    endpoint: string,
    resourceName: string,
    resourceId?: string
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'GET',
      resourceName,
      operation: 'download',
      resourceId,
      responseType: 'blob',
    }),
};

// ─── URL utilities ───────────────────────────────────────────────────────────

/**
 * Build a query string from a params object, skipping null/undefined values.
 * Example: buildQueryString({ page: 1, q: 'hello' }) → '?page=1&q=hello'
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');
  return query ? `?${query}` : '';
}

/**
 * Safely encode a single path segment.
 * Example: encodePathParam('hello world') → 'hello%20world'
 */
export function encodePathParam(param: string | number): string {
  return encodeURIComponent(String(param));
}
