import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMaintenanceAlerts } from '../maintenanceNotificationService';
import * as carAnalyticsAPI from '../carAnalyticsAPI';

// Mock the carAnalyticsAPI module
vi.mock('../carAnalyticsAPI', () => ({
  getCarMaintenanceAlerts: vi.fn(),
}));

describe('maintenanceNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMaintenanceAlerts', () => {
    it('should fetch alerts from backend API', async () => {
      const mockResponse = {
        alerts: [
          {
            id: 'service',
            type: 'service' as const,
            urgency: 'critical' as const,
            title: 'Servis potreban',
            message: 'Servis je hitan! Preostalo samo 300 km',
            actionLabel: 'Zakaži servis',
            actionUrl: '/cars/car-123/service-history',
            kmRemaining: 300,
          },
          {
            id: 'registration',
            type: 'registration' as const,
            urgency: 'warning' as const,
            title: 'Registracija ističe',
            message: 'Registracija ističe za 15 dana',
            actionLabel: 'Produlji registraciju',
            actionUrl: '/cars/car-123/registration',
            daysRemaining: 15,
          },
        ],
        summary: {
          critical: 1,
          warnings: 1,
          total: 2,
        },
      };

      vi.mocked(carAnalyticsAPI.getCarMaintenanceAlerts).mockResolvedValue(
        mockResponse
      );

      const result = await getMaintenanceAlerts('car-123');

      expect(carAnalyticsAPI.getCarMaintenanceAlerts).toHaveBeenCalledWith(
        'car-123'
      );
      expect(result).toEqual(mockResponse.alerts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no alerts', async () => {
      const mockResponse = {
        alerts: [],
        summary: {
          critical: 0,
          warnings: 0,
          total: 0,
        },
      };

      vi.mocked(carAnalyticsAPI.getCarMaintenanceAlerts).mockResolvedValue(
        mockResponse
      );

      const result = await getMaintenanceAlerts('car-123');

      expect(result).toEqual([]);
    });

    it('should handle all alert types', async () => {
      const mockResponse = {
        alerts: [
          {
            id: 'service',
            type: 'service' as const,
            urgency: 'critical' as const,
            title: 'Service',
            message: 'Service needed',
            actionLabel: 'Schedule',
            actionUrl: '/service',
            kmRemaining: 100,
          },
          {
            id: 'registration',
            type: 'registration' as const,
            urgency: 'warning' as const,
            title: 'Registration',
            message: 'Expiring soon',
            actionLabel: 'Renew',
            actionUrl: '/registration',
            daysRemaining: 5,
          },
          {
            id: 'insurance',
            type: 'insurance' as const,
            urgency: 'warning' as const,
            title: 'Insurance',
            message: 'Expiring soon',
            actionLabel: 'Renew',
            actionUrl: '/insurance',
            daysRemaining: 10,
          },
          {
            id: 'issues',
            type: 'issue' as const,
            urgency: 'critical' as const,
            title: 'Issues',
            message: 'Active issues',
            actionLabel: 'View',
            actionUrl: '/issues',
            count: 3,
          },
        ],
        summary: {
          critical: 2,
          warnings: 2,
          total: 4,
        },
      };

      vi.mocked(carAnalyticsAPI.getCarMaintenanceAlerts).mockResolvedValue(
        mockResponse
      );

      const result = await getMaintenanceAlerts('car-123');

      expect(result).toHaveLength(4);
      expect(result.map((a) => a.type)).toEqual([
        'service',
        'registration',
        'insurance',
        'issue',
      ]);
    });
  });
});
