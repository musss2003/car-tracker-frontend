import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/utils/apiService';
import {
  getCarInsuranceHistory,
  getLatestCarInsuranceRecord,
  addCarInsurance,
  updateCarInsurance,
  deleteCarInsurance,
  getInsuranceAuditLogs,
} from '../carInsuranceService';
import { CarInsurance } from '../../types/car.types';

// Mock dependencies
vi.mock('@/shared/utils/apiService', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  encodePathParam: vi.fn((param) => param),
  buildQueryString: vi.fn((params) => {
    const query = new URLSearchParams(params as any).toString();
    return query ? `?${query}` : '';
  }),
}));

describe('Car Insurance Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCarInsuranceHistory', () => {
    it('should fetch all insurance records for a car', async () => {
      const mockInsurance: CarInsurance[] = [
        {
          id: 'ins-1',
          carId: 'car-123',
          provider: 'State Farm',
          policyNumber: 'POL-123',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          cost: 1200,
          createdAt: '2024-01-01',
        },
        {
          id: 'ins-2',
          carId: 'car-123',
          provider: 'Geico',
          policyNumber: 'POL-456',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          cost: 1100,
          createdAt: '2023-01-01',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockInsurance);

      const result = await getCarInsuranceHistory('car-123');

      expect(api.get).toHaveBeenCalledWith('/api/car-insurance/car-123', 'car insurance', 'car-123');
      expect(result).toEqual(mockInsurance);
      expect(result).toHaveLength(2);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(getCarInsuranceHistory('car-123')).rejects.toThrow('Network error');
    });
  });

  describe('getLatestCarInsuranceRecord', () => {
    it('should fetch the latest insurance record', async () => {
      const mockInsurance: CarInsurance = {
        id: 'ins-1',
        carId: 'car-123',
        provider: 'State Farm',
        policyNumber: 'POL-123',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cost: 1200,
        createdAt: '2024-01-01',
      };

      vi.mocked(api.get).mockResolvedValue(mockInsurance);

      const result = await getLatestCarInsuranceRecord('car-123');

      expect(api.get).toHaveBeenCalledWith('/api/car-insurance/car-123/latest', 'car insurance', 'car-123');
      expect(result).toEqual(mockInsurance);
    });
  });

  describe('addCarInsurance', () => {
    it('should add a new insurance record', async () => {
      const newInsurance: Partial<CarInsurance> = {
        carId: 'car-123',
        provider: 'Allstate',
        policyNumber: 'POL-789',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        cost: 1300,
      };

      const createdInsurance: CarInsurance = {
        id: 'ins-3',
        ...newInsurance,
        createdAt: '2025-01-01',
      } as CarInsurance;

      vi.mocked(api.post).mockResolvedValue(createdInsurance);

      const result = await addCarInsurance(newInsurance);

      expect(api.post).toHaveBeenCalledWith('/api/car-insurance/car-123', newInsurance, 'car insurance');
      expect(result).toEqual(createdInsurance);
    });
  });

  describe('updateCarInsurance', () => {
    it('should update an insurance record', async () => {
      const updateData: Partial<CarInsurance> = {
        cost: 1400,
        endDate: '2025-06-30',
      };

      const updatedInsurance: CarInsurance = {
        id: 'ins-1',
        carId: 'car-123',
        provider: 'State Farm',
        policyNumber: 'POL-123',
        startDate: '2024-01-01',
        endDate: '2025-06-30',
        cost: 1400,
        createdAt: '2024-01-01',
      };

      vi.mocked(api.put).mockResolvedValue(updatedInsurance);

      const result = await updateCarInsurance('ins-1', updateData);

      expect(api.put).toHaveBeenCalledWith('/api/car-insurance/record/ins-1', updateData, 'car insurance', 'ins-1');
      expect(result).toEqual(updatedInsurance);
    });
  });

  describe('deleteCarInsurance', () => {
    it('should delete an insurance record', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await deleteCarInsurance('ins-1');

      expect(api.delete).toHaveBeenCalledWith('/api/car-insurance/record/ins-1', 'car insurance', 'ins-1');
    });
  });

  describe('getInsuranceAuditLogs', () => {
    it('should fetch audit logs for an insurance record', async () => {
      const mockResponse = {
        success: true,
        data: {
          logs: [
            {
              id: 'log-1',
              action: 'UPDATE',
              timestamp: '2024-01-15',
              userId: 'user-1',
            },
          ],
          pagination: {
            page: 1,
            limit: 50,
            total: 1,
            totalPages: 1,
          },
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getInsuranceAuditLogs('ins-1', 1, 50);

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-insurance/record/ins-1/audit-logs?page=1&limit=50',
        'insurance audit logs',
        'ins-1'
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data.logs);
      expect(result.pagination).toEqual(mockResponse.data.pagination);
    });

    it('should handle empty audit logs', async () => {
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

      const result = await getInsuranceAuditLogs('ins-1');

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
