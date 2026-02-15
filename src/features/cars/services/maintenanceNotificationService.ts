/**
 * ⚠️ MIGRATED TO BACKEND API ⚠️
 * Performance improvements:
 * - Server-side alert generation
 * - Reduced client-side computation
 * - Consistent alert logic across the platform
 */
import { getCarMaintenanceAlerts as getCarMaintenanceAlertsAPI } from './carAnalyticsAPI';

// Re-export backend types for backward compatibility
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

/**
 * @deprecated - This type is no longer needed with backend API
 * Kept for backward compatibility with existing code
 */
export interface MaintenanceAlertConfig {
  service: {
    kmRemaining: number | null;
    serviceInterval: number;
  };
  registration: {
    daysRemaining: number | null;
    registrationInterval: number;
  };
  insurance: {
    daysRemaining: number | null;
  };
  issues: {
    activeCount: number | null;
  };
}

/**
 * Get maintenance alerts for a car (now using backend API)
 * @param carId - The car ID
 * @param _config - Deprecated, no longer used (backend calculates alerts)
 */
export async function getMaintenanceAlerts(
  carId: string,
  _config?: MaintenanceAlertConfig
): Promise<MaintenanceAlert[]> {
  const response = await getCarMaintenanceAlertsAPI(carId);
  return response.alerts;
}

/**
 * @deprecated - These utility functions are now handled by the backend
 * Kept for backward compatibility with existing code
 */
export function calculateServiceUrgency(
  kmRemaining: number | null,
  _serviceInterval: number
): 'critical' | 'warning' | 'ok' {
  if (kmRemaining === null) return 'ok';
  if (kmRemaining < 500) return 'critical';
  if (kmRemaining < 2000) return 'warning';
  return 'ok';
}

export function calculateDaysUrgency(
  daysRemaining: number | null
): 'critical' | 'warning' | 'ok' {
  if (daysRemaining === null) return 'ok';
  if (daysRemaining < 7) return 'critical';
  if (daysRemaining < 30) return 'warning';
  return 'ok';
}

export function calculateIssueUrgency(
  activeCount: number | null
): 'critical' | 'warning' | 'ok' {
  if (activeCount === null || activeCount === 0) return 'ok';
  if (activeCount >= 3) return 'critical';
  return 'warning';
}

/**
 * Get total count of alerts by urgency level
 */
export function getAlertCounts(alerts: MaintenanceAlert[]): {
  critical: number;
  warning: number;
  total: number;
} {
  return {
    critical: alerts.filter((a) => a.urgency === 'critical').length,
    warning: alerts.filter((a) => a.urgency === 'warning').length,
    total: alerts.length,
  };
}

/**
 * Check if car needs attention (has any alerts)
 */
export function needsAttention(alerts: MaintenanceAlert[]): boolean {
  return alerts.length > 0;
}

/**
 * Get badge text for alert count
 */
export function getAlertBadgeText(alerts: MaintenanceAlert[]): string {
  const counts = getAlertCounts(alerts);
  if (counts.critical > 0) {
    return counts.critical.toString();
  }
  if (counts.warning > 0) {
    return counts.warning.toString();
  }
  return '';
}
