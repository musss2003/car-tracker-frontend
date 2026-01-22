import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/utils/apiService';
import {
  createCarIssueReport,
  getAllCarIssueReports,
  getCarIssueReportsForCar,
  getSingleCarIssueReport,
  updateCarIssueReportStatus,
  deleteCarIssueReport,
  getNewIssueReports,
  getNewIssueReportsByCar,
  getActiveIssueReportsCount,
  getIssueReportAuditLogs,
} from '../carIssueReportService';
import {
  CarIssueReport,
  CreateCarIssueReportPayload,
  UpdateCarIssueReportPayload,
} from '../../types/car.types';

// Mock dependencies
vi.mock('@/shared/utils/apiService', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  encodePathParam: vi.fn((param) => param),
}));
vi.mock('@/shared/utils/auditLogger', () => ({
  logAudit: vi.fn(),
  AuditAction: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
  AuditResource: { CAR_ISSUE: 'CAR_ISSUE' },
}));
vi.mock('@/shared/utils/inputValidator', () => ({
  validateId: vi.fn(),
  validateText: vi.fn(),
  sanitizeObject: vi.fn((obj) => obj),
}));

describe('Car Issue Report Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCarIssueReport', () => {
    it('should create a new issue report', async () => {
      const payload: CreateCarIssueReportPayload = {
        carId: 'car-123',
        severity: 'high',
        description: 'Engine making strange noise',
      };

      const createdReport: CarIssueReport = {
        id: 'issue-1',
        carId: 'car-123',
        description: 'Engine making strange noise',
        severity: 'high',
        status: 'open',
        reportedAt: '2024-01-15',
        updatedAt: '2024-01-15',
      };

      vi.mocked(api.post).mockResolvedValue(createdReport);

      const result = await createCarIssueReport(payload);

      expect(api.post).toHaveBeenCalledWith(
        '/api/car-issue-report/',
        payload,
        'car issue report'
      );
      expect(result).toEqual(createdReport);
    });

    it('should handle API errors and log audit', async () => {
      const payload: CreateCarIssueReportPayload = {
        carId: 'car-123',
        severity: 'high',
        description: 'Test',
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Network error'));

      await expect(createCarIssueReport(payload)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getAllCarIssueReports', () => {
    it('should fetch all issue reports', async () => {
      const mockReports: CarIssueReport[] = [
        {
          id: 'issue-1',
          carId: 'car-123',
          severity: 'high',
          description: 'Engine issue',
          status: 'open',
          reportedAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
        {
          id: 'issue-2',
          carId: 'car-456',
          severity: 'medium',
          description: 'Brake issue',
          status: 'resolved',
          reportedAt: '2024-01-10',
          updatedAt: '2024-01-10',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockReports);

      const result = await getAllCarIssueReports();

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/',
        'car issue reports'
      );
      expect(result).toEqual(mockReports);
      expect(result).toHaveLength(2);
    });
  });

  describe('getCarIssueReportsForCar', () => {
    it('should fetch issue reports for a specific car', async () => {
      const mockReports: CarIssueReport[] = [
        {
          id: 'issue-1',
          carId: 'car-123',
          severity: 'high',
          description: 'Engine issue',
          status: 'open',
          reportedAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockReports);

      const result = await getCarIssueReportsForCar('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/car/car-123',
        'car issue reports',
        'car-123'
      );
      expect(result).toEqual(mockReports);
    });
  });

  describe('getSingleCarIssueReport', () => {
    it('should fetch a single issue report', async () => {
      const mockReport: CarIssueReport = {
        id: 'issue-1',
        carId: 'car-123',
        severity: 'high',
        description: 'Engine issue',
        status: 'open',
        reportedAt: '2024-01-15',
        updatedAt: '2024-01-15',
      };

      vi.mocked(api.get).mockResolvedValue(mockReport);

      const result = await getSingleCarIssueReport('issue-1');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/issue-1',
        'car issue report',
        'issue-1'
      );
      expect(result).toEqual(mockReport);
    });
  });

  describe('updateCarIssueReportStatus', () => {
    it('should update issue report status', async () => {
      const payload: UpdateCarIssueReportPayload = {
        status: 'in_progress',
      };

      const updatedReport: CarIssueReport = {
        id: 'issue-1',
        carId: 'car-123',
        severity: 'high',
        description: 'Engine issue',
        status: 'in_progress',
        reportedAt: '2024-01-15',
        updatedAt: '2024-01-15',
      };

      vi.mocked(api.patch).mockResolvedValue(updatedReport);

      const result = await updateCarIssueReportStatus('issue-1', payload);

      expect(api.patch).toHaveBeenCalledWith(
        '/api/car-issue-report/issue-1',
        payload,
        'car issue report',
        'issue-1'
      );
      expect(result).toEqual(updatedReport);
    });

    it('should handle update errors and log audit', async () => {
      const payload: UpdateCarIssueReportPayload = {
        status: 'resolved',
      };

      vi.mocked(api.patch).mockRejectedValue(new Error('Update failed'));

      await expect(
        updateCarIssueReportStatus('issue-1', payload)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteCarIssueReport', () => {
    it('should delete an issue report', async () => {
      const mockResponse = { success: true, id: 'issue-1' };

      vi.mocked(api.delete).mockResolvedValue(mockResponse);

      const result = await deleteCarIssueReport('issue-1');

      expect(api.delete).toHaveBeenCalledWith(
        '/api/car-issue-report/issue-1',
        'car issue report',
        'issue-1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete errors and log audit', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Delete failed'));

      await expect(deleteCarIssueReport('issue-1')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('getNewIssueReports', () => {
    it('should fetch new issue reports', async () => {
      const mockReports: CarIssueReport[] = [
        {
          id: 'issue-1',
          carId: 'car-123',
          severity: 'high',
          description: 'Engine issue',
          status: 'open',
          reportedAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockReports);

      const result = await getNewIssueReports();

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/reports/new',
        'new issue reports'
      );
      expect(result).toEqual(mockReports);
    });
  });

  describe('getNewIssueReportsByCar', () => {
    it('should fetch new issue reports for a specific car', async () => {
      const mockReports: CarIssueReport[] = [
        {
          id: 'issue-1',
          carId: 'car-123',
          severity: 'high',
          description: 'Engine issue',
          status: 'open',
          reportedAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockReports);

      const result = await getNewIssueReportsByCar('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/car/car-123/new',
        'new issue reports',
        'car-123'
      );
      expect(result).toEqual(mockReports);
    });
  });

  describe('getActiveIssueReportsCount', () => {
    it('should fetch active issue reports count', async () => {
      const mockResponse = { count: 5 };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getActiveIssueReportsCount('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/car/car-123/active-count',
        'active issue reports count',
        'car-123'
      );
      expect(result).toBe(5);
    });
  });

  describe('getIssueReportAuditLogs', () => {
    it('should fetch audit logs for an issue report', async () => {
      const mockResponse = {
        success: true,
        data: {
          logs: [
            {
              id: 'log-1',
              action: 'CREATE',
              timestamp: '2024-01-15',
              userId: 'user-1',
            },
            {
              id: 'log-2',
              action: 'UPDATE',
              timestamp: '2024-01-16',
              userId: 'user-2',
            },
          ],
          pagination: {
            page: 1,
            limit: 50,
            total: 2,
            totalPages: 1,
          },
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getIssueReportAuditLogs('issue-1', 1, 50);

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/issue-1/audit-logs?page=1&limit=50',
        'issue report audit logs',
        'issue-1'
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        success: true,
        data: {
          logs: [],
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
          },
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getIssueReportAuditLogs('issue-1');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-issue-report/issue-1/audit-logs?page=1&limit=50',
        'issue report audit logs',
        'issue-1'
      );
      expect(result.data).toEqual([]);
    });

    it('should handle missing data gracefully', async () => {
      const mockResponse = {
        success: true,
        data: null,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getIssueReportAuditLogs('issue-1');

      expect(result.data).toEqual([]);
      expect(result.pagination).toBeUndefined();
    });
  });
});
