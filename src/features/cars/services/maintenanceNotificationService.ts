import { LucideIcon } from 'lucide-react';

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
 * Calculate urgency level for service based on km remaining
 */
export function calculateServiceUrgency(
  kmRemaining: number | null,
  serviceInterval: number
): 'critical' | 'warning' | 'ok' {
  if (kmRemaining === null) return 'ok';
  if (kmRemaining < 500) return 'critical';
  if (kmRemaining < 2000) return 'warning';
  return 'ok';
}

/**
 * Calculate urgency level for registration/insurance based on days remaining
 */
export function calculateDaysUrgency(
  daysRemaining: number | null
): 'critical' | 'warning' | 'ok' {
  if (daysRemaining === null) return 'ok';
  if (daysRemaining < 7) return 'critical';
  if (daysRemaining < 30) return 'warning';
  return 'ok';
}

/**
 * Calculate urgency level for issues based on count
 */
export function calculateIssueUrgency(
  activeCount: number | null
): 'critical' | 'warning' | 'ok' {
  if (activeCount === null || activeCount === 0) return 'ok';
  if (activeCount >= 3) return 'critical';
  return 'warning';
}

/**
 * Generate maintenance alerts for a car
 */
export function getMaintenanceAlerts(
  carId: string,
  config: MaintenanceAlertConfig
): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = [];

  // Service Alert
  const serviceUrgency = calculateServiceUrgency(
    config.service.kmRemaining,
    config.service.serviceInterval
  );
  if (serviceUrgency !== 'ok' && config.service.kmRemaining !== null) {
    alerts.push({
      id: 'service',
      type: 'service',
      urgency: serviceUrgency,
      title: 'Servis potreban',
      message:
        serviceUrgency === 'critical'
          ? `Servis je hitan! Preostalo samo ${config.service.kmRemaining} km`
          : `Servis uskoro potreban. Preostalo ${config.service.kmRemaining} km`,
      actionLabel: 'Zakaži servis',
      actionUrl: `/cars/${carId}/service-history`,
      kmRemaining: config.service.kmRemaining,
    });
  }

  // Registration Alert
  const registrationUrgency = calculateDaysUrgency(
    config.registration.daysRemaining
  );
  if (
    registrationUrgency !== 'ok' &&
    config.registration.daysRemaining !== null
  ) {
    alerts.push({
      id: 'registration',
      type: 'registration',
      urgency: registrationUrgency,
      title: 'Registracija ističe',
      message:
        registrationUrgency === 'critical'
          ? `Registracija ističe za ${config.registration.daysRemaining} ${config.registration.daysRemaining === 1 ? 'dan' : 'dana'}!`
          : `Registracija ističe za ${config.registration.daysRemaining} dana`,
      actionLabel: 'Produlji registraciju',
      actionUrl: `/cars/${carId}/registration`,
      daysRemaining: config.registration.daysRemaining,
    });
  }

  // Insurance Alert
  const insuranceUrgency = calculateDaysUrgency(config.insurance.daysRemaining);
  if (insuranceUrgency !== 'ok' && config.insurance.daysRemaining !== null) {
    alerts.push({
      id: 'insurance',
      type: 'insurance',
      urgency: insuranceUrgency,
      title: 'Osiguranje ističe',
      message:
        insuranceUrgency === 'critical'
          ? `Osiguranje ističe za ${config.insurance.daysRemaining} ${config.insurance.daysRemaining === 1 ? 'dan' : 'dana'}!`
          : `Osiguranje ističe za ${config.insurance.daysRemaining} dana`,
      actionLabel: 'Obnovi osiguranje',
      actionUrl: `/cars/${carId}/insurance`,
      daysRemaining: config.insurance.daysRemaining,
    });
  }

  // Issues Alert
  const issueUrgency = calculateIssueUrgency(config.issues.activeCount);
  if (issueUrgency !== 'ok' && config.issues.activeCount !== null) {
    const count = config.issues.activeCount;
    alerts.push({
      id: 'issues',
      type: 'issue',
      urgency: issueUrgency,
      title: 'Aktivni kvarovi',
      message:
        issueUrgency === 'critical'
          ? `${count} kritičnih kvarova zahtijeva pažnju!`
          : `${count} ${count === 1 ? 'kvar' : 'kvara'} na vozilu`,
      actionLabel: 'Prikaži kvarove',
      actionUrl: `/cars/${carId}/issues`,
      count,
    });
  }

  // Sort by urgency (critical first)
  return alerts.sort((a, b) => {
    const urgencyOrder = { critical: 0, warning: 1, ok: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
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
