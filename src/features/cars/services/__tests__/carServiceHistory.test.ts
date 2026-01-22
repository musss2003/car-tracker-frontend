import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/utils/apiService';
import {
  getCarServiceHistory,
  getLatestServiceRecord,
  getServiceRemainingKm,
  addCarServiceRecord,
  updateServiceRecord,
  deleteCarServiceRecord,
  getServiceHistoryAuditLogs,
} from '../carServiceHistory';
import { CarServiceHistory } from '../../types/car.types';

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

describe('Car Service History Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCarServiceHistory', () => {
    it('should fetch all service records for a car', async () => {
      const mockServiceHistory: CarServiceHistory[] = [
        {
          id: 'service-1',
          carId: 'car-123',
          serviceType: 'Oil Change',
          description: 'Regular oil change',
          cost: 80,
          mileage: 50000,
          serviceDate: '2024-01-15',
          nextServiceKm: 55000,
          createdAt: '2024-01-15',
        },
        {
          id: 'service-2',
          carId: 'car-123',
          serviceType: 'Tire Rotation',
          description: 'Rotated all tires',
          cost: 50,
          mileage: 48000,
          serviceDate: '2023-12-01',
          nextServiceKm: 53000,
          createdAt: '2023-12-01',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockServiceHistory);

      const result = await getCarServiceHistory('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-service-history/car-123',
        'car service history',
        'car-123'
      );
      expect(result).toEqual(mockServiceHistory);
      expect(result).toHaveLength(2);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Service unavailable'));

      await expect(getCarServiceHistory('car-123')).rejects.toThrow(
        'Service unavailable'
      );
    });
  });

  describe('getLatestServiceRecord', () => {
    it('should fetch the latest service record', async () => {
      const mockService: CarServiceHistory = {
        id: 'service-1',
        carId: 'car-123',
        serviceType: 'Oil Change',
        description: 'Regular oil change',
        cost: 80,
        mileage: 50000,
        serviceDate: '2024-01-15',
        nextServiceKm: 55000,
        createdAt: '2024-01-15',
      };

      vi.mocked(api.get).mockResolvedValue(mockService);

      const result = await getLatestServiceRecord('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-service-history/car-123/latest',
        'car service history',
        'car-123'
      );
      expect(result).toEqual(mockService);
    });
  });

  describe('getServiceRemainingKm', () => {
    it('should fetch remaining kilometers until next service', async () => {
      const mockResponse = { kmRemaining: 3000 };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getServiceRemainingKm('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-service-history/car-123/km-remaining',
        'service km remaining',
        'car-123'
      );
      expect(result).toBe(3000);
    });

    it('should return 0 if kmRemaining is null or undefined', async () => {
      const mockResponse = { kmRemaining: null };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getServiceRemainingKm('car-123');

      expect(result).toBe(0);
    });
  });

  describe('addCarServiceRecord', () => {
    it('should add a new service record', async () => {
      const newService: Partial<CarServiceHistory> = {
        carId: 'car-123',
        serviceType: 'Brake Replacement',
        description: 'Replaced front brakes',
        cost: 300,
        mileage: 52000,
        serviceDate: '2024-02-01',
        nextServiceKm: 62000,
      };

      const createdService: CarServiceHistory = {
        id: 'service-3',
        ...newService,
        createdAt: '2024-02-01',
      } as CarServiceHistory;

      vi.mocked(api.post).mockResolvedValue(createdService);

      const result = await addCarServiceRecord(newService);

      expect(api.post).toHaveBeenCalledWith(
        '/api/car-service-history/car-123',
        newService,
        'car service history'
      );
      expect(result).toEqual(createdService);
    });
  });

  describe('updateServiceRecord', () => {
    it('should update a service record', async () => {
      const updateData: Partial<CarServiceHistory> = {
        cost: 350,
        description: 'Replaced front and rear brakes',
      };

      const updatedService: CarServiceHistory = {
        id: 'service-1',
        carId: 'car-123',
        serviceType: 'Brake Replacement',
        description: 'Replaced front and rear brakes',
        cost: 350,
        mileage: 52000,
        serviceDate: '2024-02-01',
        nextServiceKm: 62000,
        createdAt: '2024-02-01',
      };

      vi.mocked(api.put).mockResolvedValue(updatedService);

      const result = await updateServiceRecord('service-1', updateData);

      expect(api.put).toHaveBeenCalledWith(
        '/api/car-service-history/record/service-1',
        updateData,
        'car service history',
        'service-1'
      );
      expect(result).toEqual(updatedService);
    });
  });

  describe('deleteCarServiceRecord', () => {
    it('should delete a service record', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await deleteCarServiceRecord('service-1');

      expect(api.delete).toHaveBeenCalledWith(
        '/api/car-service-history/record/service-1',
        'car service history',
        'service-1'
      );
    });
  });

  describe('getServiceHistoryAuditLogs', () => {
    it('should fetch audit logs for a service record', async () => {
      const mockResponse = {
        success: true,
        data: {
          logs: [
            {
              id: 'log-1',
              action: 'CREATE',
              timestamp: '2024-02-01',
              userId: 'user-1',
            },
            {
              id: 'log-2',
              action: 'UPDATE',
              timestamp: '2024-02-05',
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

      const result = await getServiceHistoryAuditLogs('service-1', 1, 50);

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-service-history/record/service-1/audit-logs?page=1&limit=50',
        'service history audit logs',
        'service-1'
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

      const result = await getServiceHistoryAuditLogs('service-1');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-service-history/record/service-1/audit-logs?page=1&limit=50',
        'service history audit logs',
        'service-1'
      );
      expect(result.data).toEqual([]);
    });

    it('should handle missing data gracefully', async () => {
      const mockResponse = {
        success: true,
        data: null,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getServiceHistoryAuditLogs('service-1');

      expect(result.data).toEqual([]);
      expect(result.pagination).toBeUndefined();
    });
  });
});
