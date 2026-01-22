import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/utils/apiService';
import {
  getCarRegistrationById,
  getCarRegistrations,
  getLatestCarRegistration,
  getRegistrationDaysRemaining,
  updateCarRegistration,
  addCarRegistration,
  deleteCarRegistration,
  getRegistrationAuditLogs,
} from '../carRegistrationService';
import { CarRegistration } from '../../types/car.types';

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

describe('Car Registration Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCarRegistrationById', () => {
    it('should fetch registration records by car ID', async () => {
      const mockRegistrations: CarRegistration[] = [
        {
          id: 'reg-1',
          carId: 'car-123',
          registrationExpiry: '2024-12-31',
          renewalDate: '2024-12-01',
          notes: 'Regular registration',
          createdAt: '2024-01-01',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockRegistrations);

      const result = await getCarRegistrationById('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-registration/car-123',
        'car registration',
        'car-123'
      );
      expect(result).toEqual(mockRegistrations);
    });
  });

  describe('getCarRegistrations', () => {
    it('should fetch all registration records for a car', async () => {
      const mockRegistrations: CarRegistration[] = [
        {
          id: 'reg-1',
          carId: 'car-123',
          registrationExpiry: '2024-12-31',
          renewalDate: '2024-12-01',
          notes: 'Current registration',
          createdAt: '2024-01-01',
        },
        {
          id: 'reg-2',
          carId: 'car-123',
          registrationExpiry: '2023-12-31',
          renewalDate: '2023-12-01',
          notes: 'Previous registration',
          createdAt: '2023-01-01',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockRegistrations);

      const result = await getCarRegistrations('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-registration/car/car-123',
        'car registration',
        'car-123'
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('getLatestCarRegistration', () => {
    it('should fetch the latest registration record', async () => {
      const mockRegistration: CarRegistration = {
        id: 'reg-1',
        carId: 'car-123',
        registrationExpiry: '2024-12-31',
        renewalDate: '2024-12-01',
        notes: 'Latest registration',
        createdAt: '2024-01-01',
      };

      vi.mocked(api.get).mockResolvedValue(mockRegistration);

      const result = await getLatestCarRegistration('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-registration/car/car-123/latest',
        'car registration',
        'car-123'
      );
      expect(result).toEqual(mockRegistration);
    });
  });

  describe('getRegistrationDaysRemaining', () => {
    it('should fetch days remaining until registration expires', async () => {
      const mockResponse = { daysRemaining: 45 };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getRegistrationDaysRemaining('car-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-registration/car/car-123/days-remaining',
        'registration days remaining',
        'car-123'
      );
      expect(result).toBe(45);
    });

    it('should return 0 if daysRemaining is null', async () => {
      const mockResponse = { daysRemaining: null };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getRegistrationDaysRemaining('car-123');

      expect(result).toBe(0);
    });
  });

  describe('updateCarRegistration', () => {
    it('should update a registration record', async () => {
      const updateData: Partial<CarRegistration> = {
        registrationExpiry: '2024-12-31',
        notes: 'Updated registration',
      };

      const updatedRegistration: CarRegistration = {
        id: 'reg-1',
        carId: 'car-123',
        registrationExpiry: '2024-12-31',
        renewalDate: '2024-12-01',
        notes: 'Updated registration',
        createdAt: '2024-01-01',
      };

      vi.mocked(api.put).mockResolvedValue(updatedRegistration);

      const result = await updateCarRegistration('reg-1', updateData);

      expect(api.put).toHaveBeenCalledWith(
        '/api/car-registration/reg-1',
        updateData,
        'car registration',
        'reg-1'
      );
      expect(result).toEqual(updatedRegistration);
    });
  });

  describe('addCarRegistration', () => {
    it('should add a new registration record', async () => {
      const newRegistration: Partial<CarRegistration> = {
        carId: 'car-123',
        registrationExpiry: '2025-12-31',
        renewalDate: '2025-12-01',
        notes: 'New registration',
      };

      const createdRegistration: CarRegistration = {
        id: 'reg-3',
        ...newRegistration,
        createdAt: '2025-01-01',
      } as CarRegistration;

      vi.mocked(api.post).mockResolvedValue(createdRegistration);

      const result = await addCarRegistration(newRegistration);

      expect(api.post).toHaveBeenCalledWith(
        '/api/car-registration',
        newRegistration,
        'car registration'
      );
      expect(result).toEqual(createdRegistration);
    });
  });

  describe('deleteCarRegistration', () => {
    it('should delete a registration record', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await deleteCarRegistration('reg-1');

      expect(api.delete).toHaveBeenCalledWith(
        '/api/car-registration/reg-1',
        'car registration',
        'reg-1'
      );
    });
  });

  describe('getRegistrationAuditLogs', () => {
    it('should fetch audit logs for a registration record', async () => {
      const mockResponse = {
        success: true,
        data: {
          logs: [
            {
              id: 'log-1',
              action: 'CREATE',
              timestamp: '2024-01-01',
              userId: 'user-1',
            },
            {
              id: 'log-2',
              action: 'UPDATE',
              timestamp: '2024-01-15',
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

      const result = await getRegistrationAuditLogs('reg-1', 1, 50);

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-registration/reg-1/audit-logs?page=1&limit=50',
        'registration audit logs',
        'reg-1'
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

      const result = await getRegistrationAuditLogs('reg-1');

      expect(api.get).toHaveBeenCalledWith(
        '/api/car-registration/reg-1/audit-logs?page=1&limit=50',
        'registration audit logs',
        'reg-1'
      );
      expect(result.data).toEqual([]);
    });
  });
});
