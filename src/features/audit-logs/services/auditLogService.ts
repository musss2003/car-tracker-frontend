import {
  api,
  buildQueryString,
  encodePathParam,
} from '@/shared/utils/apiService';
import {
  AuditLog,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStatistics,
} from '../types/auditLog.types';

/**
 * Get all audit logs with filters and pagination
 */
export const getAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<AuditLogResponse> => {
  const query = buildQueryString({
    userId: filters.userId,
    action: filters.action,
    resource: filters.resource,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    page: filters.page,
    limit: filters.limit,
  });

  return api.get<AuditLogResponse>(`/api/audit-logs${query}`, 'audit logs');
};

/**
 * Get audit log by ID
 */
export const getAuditLogById = async (id: string): Promise<AuditLog> => {
  return api.get<AuditLog>(
    `/api/audit-logs/${encodePathParam(id)}`,
    'audit log',
    id
  );
};

/**
 * Get user's recent activity
 */
export const getUserRecentActivity = async (
  userId: string,
  limit: number = 10
): Promise<AuditLog[]> => {
  const query = buildQueryString({ limit });
  return api.get<AuditLog[]>(
    `/api/audit-logs/user/${encodePathParam(userId)}/recent${query}`,
    'user activity',
    userId
  );
};

/**
 * Get audit log statistics
 */
export const getAuditStatistics = async (
  startDate?: string,
  endDate?: string
): Promise<AuditLogStatistics> => {
  const query = buildQueryString({ startDate, endDate });
  return api.get<AuditLogStatistics>(
    `/api/audit-logs/statistics${query}`,
    'audit statistics'
  );
};

/**
 * Export audit logs as CSV
 */
export const exportAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<void> => {
  const query = buildQueryString({
    userId: filters.userId,
    action: filters.action,
    resource: filters.resource,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    format: 'csv',
  });

  const response = await api.get<Blob>(
    `/api/audit-logs/export${query}`,
    'audit logs export'
  );

  // Handle blob download
  const blob =
    response instanceof Blob ? response : new Blob([JSON.stringify(response)]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Delete old audit logs (admin only)
 */
export const cleanupOldLogs = async (
  daysToKeep: number = 90
): Promise<number> => {
  const result = await api.delete<{ deletedCount: number }>(
    `/api/audit-logs/cleanup`,
    'old audit logs'
  );
  return result.deletedCount;
};
