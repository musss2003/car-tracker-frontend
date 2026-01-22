import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCarCostAnalytics,
  getCarMaintenanceAlerts,
  getCarDashboard,
  getTopExpenses,
  getMaintenanceSummary,
} from '../carAnalyticsAPI';
import { api } from '@/shared/utils/apiService';
import * as inputValidator from '@/shared/utils/inputValidator';

vi.mock('@/shared/utils/apiService', () => ({
  api: {
    get: vi.fn(),
  },
  encodePathParam: vi.fn((param) => param),
}));

vi.mock('@/shared/utils/inputValidator', () => ({
  validateId: vi.fn((id) => id),
}));

describe('Car Analytics API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cost Analytics', () => {
    it('should fetch cost analytics for a car', async () => {
      const mockResponse = {
        totalCosts: {
          all: 2000,
          service: 1000,
          registration: 200,
          insurance: 500,
          issues: 300,
        },
        monthlyCosts: [
          {
            month: '2025-01',
            year: 2025,
            service: 100,
            registration: 0,
            insurance: 0,
            issues: 50,
            total: 150,
          },
        ],
        categoryBreakdown: [
          { category: 'Service', amount: 1000, percentage: 50 },
        ],
        averages: { monthly: 200, yearly: 2400 },
        projections: { monthly: 200, yearly: 2400 },
        costPerKm: 0.5,
        costPerDay: 6.58,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getCarCostAnalytics('car-123');

      expect(inputValidator.validateId).toHaveBeenCalledWith(
        'car-123',
        'car id'
      );
      expect(api.get).toHaveBeenCalledWith(
        '/api/cars/car-123/cost-analytics',
        'cost analytics',
        'car-123'
      );
      expect(result.totalCosts.all).toBe(2000);
    });
  });

  describe('Maintenance Alerts', () => {
    it('should fetch maintenance alerts', async () => {
      const mockResponse = {
        alerts: [
          {
            id: 'service',
            type: 'service' as const,
            urgency: 'critical' as const,
            title: 'Service Required',
            message: 'Service needed',
            actionLabel: 'Schedule',
            actionUrl: '/service',
            kmRemaining: 300,
          },
        ],
        summary: { critical: 1, warnings: 0, total: 1 },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getCarMaintenanceAlerts('car-456');

      expect(api.get).toHaveBeenCalledWith(
        '/api/cars/car-456/maintenance-alerts',
        'maintenance alerts',
        'car-456'
      );
      expect(result.alerts).toHaveLength(1);
    });
  });

  describe('Dashboard', () => {
    it('should fetch dashboard data', async () => {
      const mockResponse = {
        car: { id: 'car-789', manufacturer: 'Toyota', model: 'Camry' },
        costAnalytics: {
          totalCosts: {
            all: 2000,
            service: 1000,
            registration: 200,
            insurance: 500,
            issues: 300,
          },
          monthlyCosts: [],
          categoryBreakdown: [],
          averages: { monthly: 200, yearly: 2400 },
          projections: { monthly: 200, yearly: 2400 },
          costPerKm: 0.5,
          costPerDay: 6.58,
        },
        maintenanceAlerts: {
          alerts: [],
          summary: { critical: 0, warnings: 0, total: 0 },
        },
        recentActivity: {
          latestService: null,
          latestRegistration: null,
          latestInsurance: null,
          recentIssues: [],
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getCarDashboard('car-789');

      expect(api.get).toHaveBeenCalledWith(
        '/api/cars/car-789/dashboard',
        'car dashboard',
        'car-789'
      );
      expect(result.car.id).toBe('car-789');
    });
  });

  describe('Top Expenses', () => {
    it('should fetch top expenses', async () => {
      const mockResponse = {
        topExpenses: [
          {
            carId: 'car-1',
            manufacturer: 'Toyota',
            model: 'Camry',
            year: 2020,
            licensePlate: 'ABC-123',
            totalCosts: 5000,
            costBreakdown: {
              service: 3000,
              insurance: 1000,
              registration: 500,
              issues: 500,
            },
            costPerKm: 0.5,
            mileage: 10000,
          },
        ],
        count: 1,
        limit: 10,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getTopExpenses();

      expect(api.get).toHaveBeenCalledWith(
        '/api/cars/analytics/top-expenses?limit=10',
        'top expenses'
      );
      expect(result.topExpenses).toHaveLength(1);
    });

    it('should validate limit range', async () => {
      await expect(getTopExpenses(0)).rejects.toThrow(
        'Limit must be between 1 and 100'
      );
      await expect(getTopExpenses(101)).rejects.toThrow(
        'Limit must be between 1 and 100'
      );
    });
  });

  describe('Maintenance Summary', () => {
    it('should fetch fleet summary', async () => {
      const mockResponse = {
        totalCars: 10,
        upcomingMaintenance: { nextWeek: 3, nextMonth: 5 },
        overdueMaintenance: { service: 2, registration: 1, insurance: 0 },
        averageCosts: { perCar: 500, perMonth: 200 },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getMaintenanceSummary();

      expect(api.get).toHaveBeenCalledWith(
        '/api/cars/maintenance/summary',
        'maintenance summary'
      );
      expect(result.totalCars).toBe(10);
    });
  });
});
