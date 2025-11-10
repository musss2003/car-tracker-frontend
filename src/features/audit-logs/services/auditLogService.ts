import apiClient from '@/shared/utils/apiClient';
import {
  AuditLog,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStatistics,
} from '../types/auditLog.types';

const BASE_URL = '/api/audit-logs';

/**
 * Get all audit logs with filters and pagination
 */
export const getAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<AuditLogResponse> => {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.resource) params.append('resource', filters.resource);
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await apiClient.get<AuditLogResponse>(
    `${BASE_URL}?${params.toString()}`
  );
  return response.data;
};

/**
 * Get audit log by ID
 */
export const getAuditLogById = async (id: string): Promise<AuditLog> => {
  const response = await apiClient.get<{ success: boolean; data: AuditLog }>(
    `${BASE_URL}/${id}`
  );
  return response.data.data;
};

/**
 * Get user's recent activity
 */
export const getUserRecentActivity = async (
  userId: string,
  limit: number = 10
): Promise<AuditLog[]> => {
  const response = await apiClient.get<{ success: boolean; data: AuditLog[] }>(
    `${BASE_URL}/user/${userId}/recent?limit=${limit}`
  );
  return response.data.data;
};

/**
 * Get audit log statistics
 */
export const getAuditStatistics = async (
  startDate?: string,
  endDate?: string
): Promise<AuditLogStatistics> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<{
    success: boolean;
    data: AuditLogStatistics;
  }>(`${BASE_URL}/statistics?${params.toString()}`);
  return response.data.data;
};

/**
 * Export audit logs as CSV
 */
export const exportAuditLogs = async (filters: AuditLogFilters = {}): Promise<void> => {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.resource) params.append('resource', filters.resource);
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('format', 'csv');

  // Direct fetch for blob download
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}${BASE_URL}/export?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export audit logs');
  }

  const blob = await response.blob();
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
export const cleanupOldLogs = async (daysToKeep: number = 90): Promise<number> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}${BASE_URL}/cleanup`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ daysToKeep }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to cleanup audit logs');
  }

  const data = await response.json();
  return data.data.deletedCount;
};
