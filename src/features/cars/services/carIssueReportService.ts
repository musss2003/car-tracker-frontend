// src/features/cars/services/carCarIssueReportService.ts

import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import {
  logAudit,
  AuditAction,
  AuditResource,
} from '@/shared/utils/auditLogger';
import {
  handleServiceError,
  handleNetworkError,
  logError,
} from '@/shared/utils/errorHandler';
import {
  validateId,
  validateText,
  sanitizeObject,
} from '@/shared/utils/inputValidator';
import {
  CarIssueReport,
  CreateCarIssueReportPayload,
  UpdateCarIssueReportPayload,
} from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_PATH = `${API_URL}car-issue-report`;

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  // Safe JSON parsing to prevent exceptions from non-JSON responses
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    // If JSON parsing fails, throw normalized error
    throw new Error(
      `Invalid response format: ${res.statusText || 'Request failed'}`
    );
  }

  if (!res.ok) {
    const msg =
      data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  // Extract data from backend response format { success, data, message, timestamp }
  return (data?.data !== undefined ? data.data : data) as T;
}

export async function createCarIssueReport(
  payload: CreateCarIssueReportPayload
): Promise<CarIssueReport> {
  try {
    // Input validation
    validateId(payload.carId, 'carId');
    validateText(payload.description, {
      fieldName: 'description',
      minLength: 3,
      maxLength: 2000,
    });

    if (payload.reportedBy) {
      validateId(payload.reportedBy, 'reportedBy');
    }

    const sanitized = sanitizeObject(payload);

    const res = await fetch(`${BASE_PATH}/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });

    if (!res.ok) {
      await handleServiceError(res, {
        operation: 'create',
        resource: 'car issue report',
      });
    }

    const result = await handleResponse<CarIssueReport>(res);

    // Audit log successful creation
    logAudit(AuditAction.CREATE, AuditResource.CAR_ISSUE, {
      resourceId: result.id,
      success: true,
      metadata: { carId: payload.carId },
    });

    return result;
  } catch (error) {
    // Audit log failed creation
    logAudit(AuditAction.CREATE, AuditResource.CAR_ISSUE, {
      success: false,
      errorCode: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      metadata: { carId: payload.carId },
    });

    if (error instanceof Error) {
      logError(error, { operation: 'createCarIssueReport' });
    }
    throw error;
  }
}

export async function getAllCarIssueReports(): Promise<CarIssueReport[]> {
  const res = await fetch(`${BASE_PATH}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<CarIssueReport[]>(res);
}

export async function getCarIssueReportsForCar(
  carId: string
): Promise<CarIssueReport[]> {
  const res = await fetch(`${BASE_PATH}/car/${encodeURIComponent(carId)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<CarIssueReport[]>(res);
}

export async function getSingleCarIssueReport(
  id: string
): Promise<CarIssueReport> {
  const res = await fetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<CarIssueReport>(res);
}

export async function updateCarIssueReportStatus(
  id: string,
  payload: UpdateCarIssueReportPayload
): Promise<CarIssueReport> {
  try {
    // Input validation
    validateId(id, 'issue report id');

    const sanitized = sanitizeObject(payload);

    const res = await fetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });

    if (!res.ok) {
      await handleServiceError(res, {
        operation: 'update',
        resource: 'car issue report',
        resourceId: id,
      });
    }

    const result = await handleResponse<CarIssueReport>(res);

    // Audit log successful update
    logAudit(AuditAction.UPDATE, AuditResource.CAR_ISSUE, {
      resourceId: id,
      success: true,
      metadata: { status: payload.status },
    });

    return result;
  } catch (error) {
    // Audit log failed update
    logAudit(AuditAction.UPDATE, AuditResource.CAR_ISSUE, {
      resourceId: id,
      success: false,
      errorCode: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    });

    if (error instanceof Error) {
      logError(error, {
        operation: 'updateCarIssueReportStatus',
        resourceId: id,
      });
    }
    throw error;
  }
}

export async function deleteCarIssueReport(
  id: string
): Promise<{ success: boolean; id?: string }> {
  try {
    // Input validation
    validateId(id, 'issue report id');

    const res = await fetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      await handleServiceError(res, {
        operation: 'delete',
        resource: 'car issue report',
        resourceId: id,
      });
    }

    const result = await handleResponse<{ success: boolean; id?: string }>(res);

    // Audit log successful deletion
    logAudit(AuditAction.DELETE, AuditResource.CAR_ISSUE, {
      resourceId: id,
      success: true,
    });

    return result;
  } catch (error) {
    // Audit log failed deletion
    logAudit(AuditAction.DELETE, AuditResource.CAR_ISSUE, {
      resourceId: id,
      success: false,
      errorCode: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    });

    if (error instanceof Error) {
      logError(error, { operation: 'deleteCarIssueReport', resourceId: id });
    }
    throw error;
  }
}

export async function getNewIssueReports(): Promise<CarIssueReport[]> {
  const res = await fetch(`${BASE_PATH}/reports/new`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<CarIssueReport[]>(res);
}

export async function getNewIssueReportsByCar(
  carId: string
): Promise<CarIssueReport[]> {
  const res = await fetch(`${BASE_PATH}/car/${encodeURIComponent(carId)}/new`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<CarIssueReport[]>(res);
  return data;
}

export async function getActiveIssueReportsCount(
  carId: string
): Promise<number> {
  const res = await fetch(
    `${BASE_PATH}/car/${encodeURIComponent(carId)}/active-count`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  const data = await handleResponse<{ count: number }>(res);
  return data.count;
}

export async function getIssueReportAuditLogs(
  issueReportId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const res = await fetch(
    `${BASE_PATH}/${encodeURIComponent(issueReportId)}/audit-logs?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  const result = await handleResponse<{
    success: boolean;
    data: { logs: any[]; pagination: any };
  }>(res);
  // Backend returns { success, data: { logs, pagination } }
  // Transform to { success, data: logs, pagination }
  return {
    success: result.success,
    data: result.data?.logs || [],
    pagination: result.data?.pagination,
  };
}
