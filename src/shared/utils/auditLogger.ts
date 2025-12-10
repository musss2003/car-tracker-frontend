/**
 * Client-side audit logging utility
 * Provides structured logging for critical system actions while protecting sensitive data
 */

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
}

export enum AuditResource {
  CAR = 'CAR',
  CAR_ISSUE = 'CAR_ISSUE',
  CAR_SERVICE = 'CAR_SERVICE',
  CAR_INSURANCE = 'CAR_INSURANCE',
  CAR_REGISTRATION = 'CAR_REGISTRATION',
  CONTRACT = 'CONTRACT',
  CUSTOMER = 'CUSTOMER',
  USER = 'USER',
}

export interface AuditLogEntry {
  timestamp: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  userId?: string;
  success: boolean;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sanitizes data by removing sensitive fields before logging
 */
function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'creditCard',
    'ssn',
    'passportNumber',
    'phoneNumber',
    'email',
  ];

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Logs audit trail for critical actions
 * In production, this should send to a backend audit service
 */
export function logAudit(
  action: AuditAction,
  resource: AuditResource,
  options: {
    resourceId?: string;
    success: boolean;
    errorCode?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    resource,
    resourceId: options.resourceId,
    userId: getCurrentUserId(),
    success: options.success,
    errorCode: options.errorCode,
    metadata: options.metadata
      ? (sanitizeData(options.metadata) as Record<string, unknown>)
      : undefined,
  };

  // In production, send to backend audit service
  if (import.meta.env.PROD) {
    // TODO: Send to backend audit endpoint
    // fetch('/api/audit-logs', { method: 'POST', body: JSON.stringify(entry) });
  } else {
    // Development: log to console with clear formatting
    const emoji = options.success ? '✅' : '❌';
    console.info(
      `${emoji} AUDIT [${action}] ${resource}${options.resourceId ? ` (${options.resourceId})` : ''}`,
      entry
    );
  }
}

/**
 * Gets current user ID from localStorage (set during login)
 */
function getCurrentUserId(): string | undefined {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
  } catch {
    // Ignore parsing errors
  }
  return undefined;
}
