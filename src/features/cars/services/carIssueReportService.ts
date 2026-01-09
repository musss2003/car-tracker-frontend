import { api, encodePathParam } from '@/shared/utils/apiService';
import {
  logAudit,
  AuditAction,
  AuditResource,
} from '@/shared/utils/auditLogger';
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

export async function createCarIssueReport(
  payload: CreateCarIssueReportPayload
): Promise<CarIssueReport> {
  try {
    // Input validation
    validateId(payload.carId, 'carId');
    if (payload.description) {
      validateText(payload.description, {
        fieldName: 'description',
        minLength: 3,
        maxLength: 2000,
      });
    }

    const sanitized = sanitizeObject(payload as any);
    const result = await api.post<CarIssueReport>(
      '/car-issue-report/',
      sanitized,
      'car issue report'
    );

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
    throw error;
  }
}

export async function getAllCarIssueReports(): Promise<CarIssueReport[]> {
  return api.get<CarIssueReport[]>('/car-issue-report/', 'car issue reports');
}

export async function getCarIssueReportsForCar(
  carId: string
): Promise<CarIssueReport[]> {
  return api.get<CarIssueReport[]>(
    `/car-issue-report/car/${encodePathParam(carId)}`,
    'car issue reports',
    carId
  );
}

export async function getSingleCarIssueReport(
  id: string
): Promise<CarIssueReport> {
  return api.get<CarIssueReport>(
    `/car-issue-report/${encodePathParam(id)}`,
    'car issue report',
    id
  );
}

export async function updateCarIssueReportStatus(
  id: string,
  payload: UpdateCarIssueReportPayload
): Promise<CarIssueReport> {
  try {
    // Input validation
    validateId(id, 'issue report id');

    const sanitized = sanitizeObject(payload as any);
    const result = await api.patch<CarIssueReport>(
      `/car-issue-report/${encodePathParam(id)}`,
      sanitized,
      'car issue report',
      id
    );

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
    throw error;
  }
}

export async function deleteCarIssueReport(
  id: string
): Promise<{ success: boolean; id?: string }> {
  try {
    // Input validation
    validateId(id, 'issue report id');

    const result = await api.delete<{ success: boolean; id?: string }>(
      `/car-issue-report/${encodePathParam(id)}`,
      'car issue report',
      id
    );

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
    throw error;
  }
}

export async function getNewIssueReports(): Promise<CarIssueReport[]> {
  return api.get<CarIssueReport[]>(
    '/car-issue-report/reports/new',
    'new issue reports'
  );
}

export async function getNewIssueReportsByCar(
  carId: string
): Promise<CarIssueReport[]> {
  return api.get<CarIssueReport[]>(
    `/car-issue-report/car/${encodePathParam(carId)}/new`,
    'new issue reports',
    carId
  );
}

export async function getActiveIssueReportsCount(
  carId: string
): Promise<number> {
  const data = await api.get<{ count: number }>(
    `/car-issue-report/car/${encodePathParam(carId)}/active-count`,
    'active issue reports count',
    carId
  );
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
  const result = await api.get<{
    success: boolean;
    data: { logs: any[]; pagination: any };
  }>(
    `/car-issue-report/${encodePathParam(issueReportId)}/audit-logs?page=${page}&limit=${limit}`,
    'issue report audit logs',
    issueReportId
  );

  // Backend returns { success, data: { logs, pagination } }
  // Transform to { success, data: logs, pagination }
  return {
    success: result.success,
    data: result.data?.logs || [],
    pagination: result.data?.pagination,
  };
}
