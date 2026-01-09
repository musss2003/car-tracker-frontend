# Enhanced Error Handling System

## Overview

This document describes the centralized error handling system implemented across the application for consistent, secure, and user-friendly error management.

## Architecture

### Core Components

#### 1. Error Handler (`src/shared/utils/errorHandler.ts`)

Central error handling utilities with:

- **ServiceError Class**: Custom error class with code and context
- **Error Sanitization**: Removes sensitive data from error messages
- **HTTP Error Messages**: User-friendly messages for common HTTP status codes
- **Fetch Wrapper**: `fetchWithErrorHandling()` for automatic error handling

#### 2. API Service (`src/shared/utils/apiService.ts`)

Unified API client with:

- **Consistent Interface**: Single entry point for all API calls
- **Automatic Error Handling**: Built-in error handling for all requests
- **Type Safety**: Full TypeScript support
- **Convenience Methods**: `api.get()`, `api.post()`, `api.put()`, `api.patch()`, `api.delete()`

## Features

### 1. HTTP Status Code Mapping

Provides user-friendly messages for common scenarios:

| Status Code | Message                                                   |
| ----------- | --------------------------------------------------------- |
| 400         | Invalid {resource} data provided                          |
| 401         | Unauthorized. Please log in again                         |
| 403         | You do not have permission to {operation} this {resource} |
| 404         | {Resource} not found                                      |
| 409         | {Resource} already exists                                 |
| 422         | Invalid {resource} data. Please check your input          |
| 429         | Too many requests. Please try again later                 |
| 500         | Server error. Please try again later                      |
| 502/503     | Service temporarily unavailable                           |

### 2. Error Context

All errors include:

- **Operation**: What was being attempted (fetch, create, update, delete)
- **Resource**: What type of data (customer, contract, car, etc.)
- **Resource ID**: Specific identifier when applicable
- **Status Code**: HTTP status for debugging
- **Original Error**: Preserved for network/parsing errors

### 3. Security Features

- **Sensitive Data Sanitization**: Automatically removes tokens, passwords, API keys
- **Structured Logging**: Consistent error logging format
- **Development vs Production**: Different logging strategies
- **No Data Leakage**: Errors never expose sensitive information

## Usage

### Basic GET Request

```typescript
import { api } from '@/shared/utils/apiService';

export const getCustomer = async (id: string): Promise<Customer> => {
  return api.get<Customer>(
    `/api/customers/${encodePathParam(id)}`,
    'customer',
    id
  );
};
```

### POST Request with Data

```typescript
export const createContract = async (
  data: ContractFormData
): Promise<Contract> => {
  return api.post<Contract>('/api/contracts', data, 'contract');
};
```

### UPDATE Request

```typescript
export const updateCustomer = async (
  id: string,
  data: Partial<Customer>
): Promise<Customer> => {
  return api.put<Customer>(
    `/api/customers/${encodePathParam(id)}`,
    data,
    'customer',
    id
  );
};
```

### DELETE Request

```typescript
export const deleteContract = async (id: string): Promise<void> => {
  await api.delete<void>(
    `/api/contracts/${encodePathParam(id)}`,
    'contract',
    id
  );
};
```

### With Custom Error Handling

```typescript
export const getCustomerContracts = async (
  customerId: string
): Promise<Contract[]> => {
  try {
    return await api.get<Contract[]>(
      `/api/customers/${encodePathParam(customerId)}/contracts`,
      'customer contracts',
      customerId
    );
  } catch (error) {
    if ((error as any).status === 404) {
      // Handle not found - maybe return empty array
      return [];
    }
    throw error; // Re-throw for other errors
  }
};
```

### Using fetchWithErrorHandling Directly

For more complex scenarios:

```typescript
import { fetchWithErrorHandling } from '@/shared/utils/errorHandler';
import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';

export const complexRequest = async (id: string): Promise<Data> => {
  return fetchWithErrorHandling<Data>(
    `${API_URL}/complex/${id}`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'X-Custom-Header': 'value',
      },
      body: JSON.stringify({ customData: 'value' }),
    },
    {
      operation: 'process',
      resource: 'complex-data',
      resourceId: id,
    }
  );
};
```

## Error Object Structure

### HTTP Errors

```typescript
{
  message: string;           // User-friendly message
  status: number;            // HTTP status code
  resourceId?: string;       // Resource identifier
  context: {                 // Operation context
    operation: string;       // 'fetch', 'create', 'update', 'delete'
    resource: string;        // 'customer', 'contract', etc.
    resourceId?: string;
  }
}
```

### Network Errors

```typescript
{
  message: string;           // "Unable to {operation} {resource}..."
  originalError: unknown;    // Original error object
  resourceId?: string;
}
```

## Best Practices

### 1. Always Use encodePathParam

```typescript
// ✅ GOOD
`/api/customers/${encodePathParam(customerId)}/contracts` // ❌ BAD
`/api/customers/${customerId}/contracts`;
```

### 2. Provide Meaningful Resource Names

```typescript
// ✅ GOOD
api.get<Contract[]>('/api/contracts', 'contracts');

// ❌ BAD
api.get<Contract[]>('/api/contracts', 'data');
```

### 3. Include Resource IDs When Available

```typescript
// ✅ GOOD
api.get<Customer>(`/api/customers/${id}`, 'customer', id);

// ❌ BAD
api.get<Customer>(`/api/customers/${id}`, 'customer');
```

### 4. Let Errors Bubble Up

```typescript
// ✅ GOOD - Let caller handle errors
export const getCustomer = async (id: string): Promise<Customer> => {
  return api.get<Customer>(`/api/customers/${id}`, 'customer', id);
};

// ❌ BAD - Silent failure
export const getCustomer = async (id: string): Promise<Customer | null> => {
  try {
    return await api.get<Customer>(`/api/customers/${id}`, 'customer', id);
  } catch {
    return null; // Caller doesn't know what went wrong
  }
};
```

### 5. Handle Errors at Component Level

```typescript
// In React components
const fetchData = async () => {
  try {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load customers';
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

## Migration Guide

### Old Pattern

```typescript
export const getCustomer = async (customerId: string): Promise<Customer> => {
  try {
    const response = await fetch(`${API_URL}${customerId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};
```

### New Pattern

```typescript
import { api, encodePathParam } from '@/shared/utils/apiService';

export const getCustomer = async (customerId: string): Promise<Customer> => {
  return api.get<Customer>(
    `/api/customers/${encodePathParam(customerId)}`,
    'customer',
    customerId
  );
};
```

## Benefits

### For Users

- ✅ Clear, actionable error messages
- ✅ Consistent error experience across the app
- ✅ Better guidance on how to resolve issues
- ✅ No exposure to technical jargon

### For Developers

- ✅ Less boilerplate code
- ✅ Consistent error handling patterns
- ✅ Better debugging with structured errors
- ✅ Type safety with TypeScript
- ✅ Centralized error logic (easier to maintain)
- ✅ Security built-in (no sensitive data leaks)

### For DevOps

- ✅ Structured error logging
- ✅ Easy integration with monitoring tools (Sentry, etc.)
- ✅ Consistent error codes for tracking
- ✅ Environment-aware logging (dev vs prod)

## Future Enhancements

1. **Error Tracking Integration**

   - Automatic error reporting to Sentry/LogRocket
   - User session replay for critical errors
   - Error rate monitoring and alerts

2. **Retry Logic**

   - Automatic retry for transient failures
   - Exponential backoff
   - Circuit breaker pattern

3. **Offline Support**

   - Queue requests when offline
   - Sync when connection restored
   - Optimistic updates

4. **Performance Monitoring**
   - Request duration tracking
   - Slow query detection
   - API performance metrics

## Testing

### Unit Test Example

```typescript
import { api } from '@/shared/utils/apiService';
import { describe, it, expect, vi } from 'vitest';

describe('API Service', () => {
  it('should handle 404 errors correctly', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' }),
        text: () => Promise.resolve('{"message":"Not found"}'),
      } as Response)
    );

    await expect(
      api.get('/api/customers/invalid-id', 'customer', 'invalid-id')
    ).rejects.toThrow('Customer not found');
  });
});
```

## Support

For questions or issues with the error handling system:

1. Check this documentation
2. Review examples in existing service files
3. Check the error handler source code
4. Create an issue in the project repository

---

**Last Updated**: January 9, 2026
**Version**: 1.0.0
