# Secure Logging Practices

## Overview

This project implements secure logging practices to prevent the exposure of sensitive information (PII, PHI, authentication tokens, etc.) through error logs while maintaining sufficient debugging capabilities.

## Security Rationale

**Problem**: Logging raw error objects can unintentionally expose:

- Authentication tokens and session IDs
- User personal information (PII)
- Request/response headers containing sensitive data
- Internal system details that could aid attackers
- Stack traces revealing code structure

**Solution**: Use the centralized `logger` utility that sanitizes error information before logging.

## Usage

### Import the Logger

```typescript
import { logError, logWarning, logInfo } from '@/shared/utils/logger';
```

### Logging Errors

**❌ INSECURE - Don't do this:**

```typescript
try {
  await fetchUserData(userId);
} catch (error) {
  console.error('Failed to fetch user:', error); // Exposes full error object
}
```

**✅ SECURE - Do this instead:**

```typescript
try {
  await fetchUserData(userId);
} catch (error) {
  logError('Failed to fetch user', error); // Only logs sanitized message
}
```

### Examples

#### Basic Error Logging

```typescript
try {
  const data = await api.get('/api/users');
} catch (error) {
  logError('Failed to fetch users', error);
  toast.error('Unable to load users');
}
```

#### Logging with Context

```typescript
try {
  await updateContract(contractId, data);
} catch (error) {
  logError(`Failed to update contract ${contractId}`, error);
}
```

#### Warnings

```typescript
if (invalidData) {
  logWarning('Received invalid data format', 'Expected array, got object');
}
```

#### Info Messages (Use Sparingly)

```typescript
logInfo('User successfully logged in');
```

## What Gets Logged

The `logError` function:

- ✅ Logs the error **message** only
- ✅ Includes context provided by the developer
- ❌ **Does NOT** log the full error object
- ❌ **Does NOT** log stack traces
- ❌ **Does NOT** log request/response data

## Migration Guide

When you see a security alert about insecure logging:

1. Import the logger:

   ```typescript
   import { logError } from '@/shared/utils/logger';
   ```

2. Replace `console.error('message:', error)` with:

   ```typescript
   logError('message', error);
   ```

3. Replace `console.warn('message:', data)` with:
   ```typescript
   logWarning('message', data);
   ```

## Status Codes and Debugging

For HTTP status codes, you can log them explicitly without exposing sensitive details:

```typescript
try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    // This is safe - status codes don't expose sensitive data
    logError(`Request failed (Status: ${response.status})`);
    throw new Error('Request failed');
  }
} catch (error) {
  logError('Failed to fetch data', error);
}
```

## Production vs Development

The logger currently uses `console.error/warn/log` which is suitable for development. In production:

- Consider integrating with a proper logging service (e.g., Sentry, LogRocket)
- Logs should be sent to a secure backend logging system
- Client-side console logs may be disabled entirely

## Compliance

This logging approach helps meet compliance requirements for:

- **GDPR**: Prevents PII leakage in logs
- **HIPAA**: Protects PHI from exposure
- **PCI DSS**: Prevents cardholder data logging
- **SOC 2**: Demonstrates security controls

## Files Updated

The following files have been migrated to secure logging:

- ✅ `src/shared/utils/logger.ts` (utility created)
- ✅ `src/features/customers/components/CustomerContractsList.tsx`
- ✅ `src/shared/utils/checkAuth.tsx`
- ✅ `src/features/contracts/services/contractService.tsx`
- ✅ `src/features/auth/hooks/useAuth.tsx`

## Next Steps

Continue migrating all `console.error`, `console.warn` calls that log error objects throughout the codebase to use the secure logger utility.

## Questions?

Refer to the `logger.ts` file for implementation details or consult the security team for specific use cases.
