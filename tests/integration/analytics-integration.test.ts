/**
 * Integration tests for backend analytics API
 * These tests validate the complete flow from API calls to data transformation
 */

import { describe, it, expect } from 'vitest';
import {
  getCarCostAnalytics,
  getCarMaintenanceAlerts,
  getCarDashboard,
} from '../../src/features/cars/services/carAnalyticsAPI';

describe('Analytics API Integration', () => {
  // Note: These tests require a running backend server
  // Set VITE_API_BASE_URL to your backend URL before running

  const TEST_CAR_ID = process.env.TEST_CAR_ID || 'test-car-id';

  describe('Cost Analytics Integration', () => {
    it('should return properly structured cost analytics', async () => {
      const result = await getCarCostAnalytics(TEST_CAR_ID);

      // Validate structure
      expect(result).toHaveProperty('totalCosts');
      expect(result.totalCosts).toHaveProperty('service');
      expect(result.totalCosts).toHaveProperty('registration');
      expect(result.totalCosts).toHaveProperty('insurance');
      expect(result.totalCosts).toHaveProperty('issues');
      expect(result.totalCosts).toHaveProperty('all');

      expect(result).toHaveProperty('monthlyCosts');
      expect(Array.isArray(result.monthlyCosts)).toBe(true);

      expect(result).toHaveProperty('categoryBreakdown');
      expect(Array.isArray(result.categoryBreakdown)).toBe(true);

      expect(result).toHaveProperty('projections');
      expect(result.projections).toHaveProperty('monthly');
      expect(result.projections).toHaveProperty('yearly');

      // Validate data types
      expect(typeof result.totalCosts.all).toBe('number');
      expect(result.totalCosts.all).toBeGreaterThanOrEqual(0);
    });

    it('should have monthly breakdown in correct format', async () => {
      const result = await getCarCostAnalytics(TEST_CAR_ID);

      if (result.monthlyCosts.length > 0) {
        const firstMonth = result.monthlyCosts[0];
        expect(firstMonth).toHaveProperty('month');
        expect(firstMonth).toHaveProperty('service');
        expect(firstMonth).toHaveProperty('registration');
        expect(firstMonth).toHaveProperty('insurance');
        expect(firstMonth).toHaveProperty('issues');
        expect(firstMonth).toHaveProperty('total');

        // Month should be in YYYY-MM format
        expect(firstMonth.month).toMatch(/^\d{4}-\d{2}$/);
      }
    });

    it('should have category breakdown with percentages', async () => {
      const result = await getCarCostAnalytics(TEST_CAR_ID);

      if (result.categoryBreakdown.length > 0) {
        const totalPercentage = result.categoryBreakdown.reduce(
          (sum, cat) => sum + cat.percentage,
          0
        );

        // Total percentage should be close to 100 (allowing for rounding)
        if (result.totalCosts.all > 0) {
          expect(totalPercentage).toBeGreaterThan(95);
          expect(totalPercentage).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('Maintenance Alerts Integration', () => {
    it('should return properly structured maintenance alerts', async () => {
      const result = await getCarMaintenanceAlerts(TEST_CAR_ID);

      expect(result).toHaveProperty('alerts');
      expect(Array.isArray(result.alerts)).toBe(true);

      if (result.alerts.length > 0) {
        const firstAlert = result.alerts[0];
        expect(firstAlert).toHaveProperty('id');
        expect(firstAlert).toHaveProperty('type');
        expect(firstAlert).toHaveProperty('urgency');
        expect(firstAlert).toHaveProperty('title');
        expect(firstAlert).toHaveProperty('message');
        expect(firstAlert).toHaveProperty('actionLabel');
        expect(firstAlert).toHaveProperty('actionUrl');

        // Validate enum values
        expect(['service', 'registration', 'insurance', 'issue']).toContain(
          firstAlert.type
        );
        expect(['critical', 'warning', 'ok']).toContain(firstAlert.urgency);
      }
    });

    it('should include appropriate metadata based on alert type', async () => {
      const result = await getCarMaintenanceAlerts(TEST_CAR_ID);

      result.alerts.forEach((alert) => {
        if (alert.type === 'service') {
          expect(alert).toHaveProperty('kmRemaining');
        } else if (
          alert.type === 'registration' ||
          alert.type === 'insurance'
        ) {
          expect(alert).toHaveProperty('daysRemaining');
        } else if (alert.type === 'issue') {
          expect(alert).toHaveProperty('count');
        }
      });
    });
  });

  describe('Dashboard Integration', () => {
    it('should return complete dashboard data', async () => {
      const result = await getCarDashboard(TEST_CAR_ID);

      // Validate all required fields
      expect(result).toHaveProperty('car');
      expect(result).toHaveProperty('costAnalytics');
      expect(result).toHaveProperty('maintenanceAlerts');
      expect(result).toHaveProperty('recentActivity');

      // Validate nested structures
      expect(result.car).toHaveProperty('id');
      expect(result.costAnalytics).toHaveProperty('totalCosts');
      expect(result.maintenanceAlerts).toHaveProperty('alerts');
    });

    it('should have consistent data across nested objects', async () => {
      const result = await getCarDashboard(TEST_CAR_ID);

      // Cost analytics should match standalone endpoint structure
      expect(result.costAnalytics).toHaveProperty('totalCosts');
      expect(result.costAnalytics).toHaveProperty('monthlyCosts');
      expect(result.costAnalytics).toHaveProperty('categoryBreakdown');
      expect(result.costAnalytics).toHaveProperty('projections');

      // Maintenance alerts should match standalone endpoint structure
      expect(Array.isArray(result.maintenanceAlerts.alerts)).toBe(true);
    });
  });

  describe('Performance Validation', () => {
    it.skip('should complete dashboard request faster than multiple separate calls', async () => {
      // NOTE: Performance benchmarks are unreliable in automated tests due to:
      // - Variable network conditions
      // - Test environment caching
      // - Concurrent test execution
      // - CI/CD environment resource constraints
      //
      // This test is skipped but preserved for manual benchmarking.
      // To run manually: npm test -- analytics-integration.test.ts --reporter=verbose
      
      const startDashboard = Date.now();
      await getCarDashboard(TEST_CAR_ID);
      const dashboardTime = Date.now() - startDashboard;

      const startSeparate = Date.now();
      await Promise.all([
        getCarCostAnalytics(TEST_CAR_ID),
        getCarMaintenanceAlerts(TEST_CAR_ID),
      ]);
      const separateTime = Date.now() - startSeparate;

      // Dashboard should be faster (single optimized call)
      console.log(`Dashboard time: ${dashboardTime}ms`);
      console.log(`Separate calls time: ${separateTime}ms`);
      console.log(
        `Performance improvement: ${(((separateTime - dashboardTime) / separateTime) * 100).toFixed(1)}%`
      );

      // Expected: Dashboard should be 30-50% faster in production
      // Actual performance gains depend on network latency and backend optimization
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid car ID gracefully', async () => {
      await expect(getCarCostAnalytics('invalid-id')).rejects.toThrow();
    });

    it.skip('should handle network errors', async () => {
      // TODO: Implement network error handling test
      // Requires mocking api.get to simulate network failures
      // Should verify that:
      // 1. Network errors are caught and logged
      // 2. Errors are re-thrown for component-level handling
      // 3. User-friendly error messages are provided
      //
      // Example implementation:
      // vi.mock('../../src/shared/utils/apiService', () => ({
      //   api: {
      //     get: vi.fn().mockRejectedValue(new Error('Network error'))
      //   }
      // }));
      // await expect(getCarCostAnalytics(TEST_CAR_ID)).rejects.toThrow('Network error');
    });
  });
});
