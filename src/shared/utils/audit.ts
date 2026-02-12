/**
 * Audit logging utility for tracking critical user actions
 * Provides a standardized way to record security-relevant events
 */

export enum AuditAction {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  BOOKING_VIEWED = 'BOOKING_VIEWED',
  FILTER_APPLIED = 'FILTER_APPLIED',
}

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}

export interface AuditContext {
  action: AuditAction;
  outcome: AuditOutcome;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  timestamp?: string;
}

/**
 * Log an audit event for security and compliance tracking
 * Note: Client-side audit logs are supplementary to backend audit trails
 * The backend MUST implement comprehensive audit logging as the source of truth
 *
 * @param context - The audit event context
 */
export const logAudit = (context: AuditContext): void => {
  const auditEvent = {
    ...context,
    timestamp: context.timestamp || new Date().toISOString(),
    source: 'client',
    userAgent: navigator.userAgent,
  };

  // In production, this could send to a dedicated audit logging endpoint
  // For now, we use structured console logging
  console.info('[AUDIT]', JSON.stringify(auditEvent));

  // TODO: Consider sending to backend audit endpoint
  // await fetch('/api/audit', { method: 'POST', body: JSON.stringify(auditEvent) });
};

/**
 * Create a sanitized metadata object by removing sensitive fields
 * @param metadata - Raw metadata object
 * @returns Sanitized metadata safe for logging
 */
export const sanitizeAuditMetadata = (
  metadata: Record<string, unknown>
): Record<string, unknown> => {
  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'creditCard',
    'ssn',
    'email',
    'phoneNumber',
    'address',
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((sk) => lowerKey.includes(sk));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
