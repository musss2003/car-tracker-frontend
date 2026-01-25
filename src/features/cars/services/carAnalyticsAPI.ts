/**
 * Car Analytics API Service
 * Interfaces with backend analytics endpoints for optimized performance
 * Backend performs all calculations using database aggregations
 */

import { api, encodePathParam } from '@/shared/utils/apiService';
import { validateId } from '@/shared/utils/inputValidator';
import { Car } from '../types/car.types';

// ===== TYPES ===== //

export interface CostAnalyticsResponse {
  totalCosts: {
    all: number;
    service: number;
    insurance: number;
    registration: number;
    issues: number;
  };
  monthlyCosts: Array<{
    month: string;
    year: number;
    service: number;
    insurance: number;
    registration: number;
    issues: number;
    total: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  averages: {
    monthly: number;
    yearly: number;
  };
  projections: {
    monthly: number;
    yearly: number;
  };
  costPerKm: number;
  costPerDay: number;
}

export interface MaintenanceAlert {
  id: string;
  type: 'service' | 'registration' | 'insurance' | 'issue';
  urgency: 'critical' | 'warning' | 'ok';
  title: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
  daysRemaining?: number;
  kmRemaining?: number;
  count?: number;
}

export interface AlertSummary {
  critical: number;
  warnings: number;
  total: number;
}

export interface MaintenanceAlertsResponse {
  alerts: MaintenanceAlert[];
  summary: AlertSummary;
}

export interface CarDashboardResponse {
  car: Car;
  costAnalytics: CostAnalyticsResponse;
  maintenanceAlerts: MaintenanceAlertsResponse;
  recentActivity: {
    latestService: any | null;
    latestRegistration: any | null;
    latestInsurance: any | null;
    recentIssues: any[];
  };
}

export interface TopExpenseCar {
  carId: string;
  manufacturer: string;
  model: string;
  year: number;
  licensePlate: string;
  totalCosts: number;
  costBreakdown: {
    service: number;
    insurance: number;
    registration: number;
    issues: number;
  };
  costPerKm?: number;
  mileage: number;
}

export interface TopExpensesResponse {
  topExpenses: TopExpenseCar[];
  count: number;
  limit: number;
}

export interface MaintenanceSummaryResponse {
  totalCars: number;
  carsWithCriticalAlerts: number;
  carsWithWarnings: number;
  carsNeedingService: number;
  carsWithExpiredDocs: number;
  totalActiveIssues: number;
  upcomingMaintenanceCount: number;
  alertsByType: {
    service: { critical: number; warning: number };
    registration: { critical: number; warning: number };
    insurance: { critical: number; warning: number };
    issues: number;
  };
}

// ===== API METHODS ===== //

/**
 * GET /api/cars/:carId/cost-analytics
 * Get comprehensive cost analytics for a specific car
 * All calculations performed on backend using database aggregations
 */
export const getCarCostAnalytics = async (
  carId: string
): Promise<CostAnalyticsResponse> => {
  validateId(carId, 'car id');
  return api.get<CostAnalyticsResponse>(
    `/api/cars/${encodePathParam(carId)}/cost-analytics`,
    'cost analytics',
    carId
  );
};

/**
 * GET /api/cars/:carId/maintenance-alerts
 * Get maintenance alerts and summary for a specific car
 * Server generates alerts based on service intervals, expiry dates, and active issues
 */
export const getCarMaintenanceAlerts = async (
  carId: string
): Promise<MaintenanceAlertsResponse> => {
  validateId(carId, 'car id');
  return api.get<MaintenanceAlertsResponse>(
    `/api/cars/${encodePathParam(carId)}/maintenance-alerts`,
    'maintenance alerts',
    carId
  );
};

/**
 * GET /api/cars/:carId/dashboard
 * Get comprehensive dashboard data for a car (single optimized call)
 * Combines car details, cost analytics, maintenance alerts, and recent activity
 * PERFORMANCE: Replaces 4-6 separate API calls with 1 call
 */
export const getCarDashboard = async (
  carId: string
): Promise<CarDashboardResponse> => {
  validateId(carId, 'car id');
  return api.get<CarDashboardResponse>(
    `/api/cars/${encodePathParam(carId)}/dashboard`,
    'car dashboard',
    carId
  );
};

/**
 * GET /api/cars/analytics/top-expenses?limit=10
 * Get top cars ranked by total expenses
 * Cross-car analytics for expense tracking
 */
export const getTopExpenses = async (
  limit: number = 10
): Promise<TopExpensesResponse> => {
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  return api.get<TopExpensesResponse>(
    `/api/cars/analytics/top-expenses?limit=${limit}`,
    'top expenses'
  );
};

/**
 * GET /api/cars/maintenance/summary
 * Get fleet-wide maintenance summary
 * Aggregates alerts and statistics across all user's cars
 */
export const getMaintenanceSummary =
  async (): Promise<MaintenanceSummaryResponse> => {
    return api.get<MaintenanceSummaryResponse>(
      `/api/cars/maintenance/summary`,
      'maintenance summary'
    );
  };
