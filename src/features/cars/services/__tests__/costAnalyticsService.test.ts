import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCarCostAnalytics } from '../costAnalyticsService';
import * as carAnalyticsAPI from '../carAnalyticsAPI';

// Mock the analytics API
vi.mock('../carAnalyticsAPI');

describe('Cost Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCarCostAnalytics', () => {
    it('should fetch and transform backend data successfully', async () => {
      const mockBackendResponse = {
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
          {
            category: 'Service',
            amount: 1000,
            percentage: 50,
          },
          {
            category: 'Registration',
            amount: 200,
            percentage: 10,
          },
        ],
        averages: {
          monthly: 200,
          yearly: 2400,
        },
        projections: {
          monthly: 200,
          yearly: 2400,
        },
        costPerKm: 0.5,
        costPerDay: 6.58,
      };

      vi.mocked(carAnalyticsAPI.getCarCostAnalytics).mockResolvedValue(
        mockBackendResponse
      );

      const result = await getCarCostAnalytics('car-123');

      expect(carAnalyticsAPI.getCarCostAnalytics).toHaveBeenCalledWith(
        'car-123'
      );
      expect(result.totalCosts).toBeDefined();
      expect(result.monthlyCosts).toBeDefined();
      expect(result.categoryBreakdown).toBeDefined();
      expect(result.yearlyTrends).toBeDefined();
      expect(result.projections).toBeDefined();
      expect(result.totalCosts.all).toBe(2000);
    });

    it('should transform category names to localized format', async () => {
      const mockBackendResponse = {
        totalCosts: {
          all: 1000,
          service: 1000,
          registration: 0,
          insurance: 0,
          issues: 0,
        },
        monthlyCosts: [],
        categoryBreakdown: [
          {
            category: 'Service',
            amount: 1000,
            percentage: 100,
          },
        ],
        averages: {
          monthly: 100,
          yearly: 1200,
        },
        projections: {
          monthly: 100,
          yearly: 1200,
        },
        costPerKm: 0.5,
        costPerDay: 3.0,
      };

      vi.mocked(carAnalyticsAPI.getCarCostAnalytics).mockResolvedValue(
        mockBackendResponse
      );

      const result = await getCarCostAnalytics('car-123');

      expect(result.categoryBreakdown[0].name).toBe('Servis');
      expect(result.categoryBreakdown[0].color).toBeDefined();
    });

    it('should handle empty monthly costs', async () => {
      const mockBackendResponse = {
        totalCosts: {
          all: 0,
          service: 0,
          registration: 0,
          insurance: 0,
          issues: 0,
        },
        monthlyCosts: [],
        categoryBreakdown: [],
        averages: {
          monthly: 0,
          yearly: 0,
        },
        projections: {
          monthly: 0,
          yearly: 0,
        },
        costPerKm: 0,
        costPerDay: 0,
      };

      vi.mocked(carAnalyticsAPI.getCarCostAnalytics).mockResolvedValue(
        mockBackendResponse
      );

      const result = await getCarCostAnalytics('car-123');

      expect(result.monthlyCosts).toEqual([]);
      expect(result.totalCosts.all).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.mocked(carAnalyticsAPI.getCarCostAnalytics).mockRejectedValue(
        mockError
      );

      await expect(getCarCostAnalytics('car-123')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
