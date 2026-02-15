import {
  AuditAction,
  AuditResource,
  AuditStatus,
} from '../types/auditLog.types';

/**
 * Get user-friendly label for audit action
 */
export const getActionLabel = (action: AuditAction): string => {
  const labels: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'Kreirao',
    [AuditAction.READ]: 'Pročitao',
    [AuditAction.UPDATE]: 'Ažurirao',
    [AuditAction.DELETE]: 'Obrisao',
    [AuditAction.LOGIN]: 'Prijava',
    [AuditAction.LOGOUT]: 'Odjava',
    [AuditAction.LOGIN_FAILED]: 'Neuspješna prijava',
    [AuditAction.EXPORT]: 'Izvezao',
    [AuditAction.UPLOAD]: 'Otpremio',
    [AuditAction.DOWNLOAD]: 'Preuzeo',
  };
  return labels[action] || action;
};

/**
 * Get user-friendly label for resource
 */
export const getResourceLabel = (resource: AuditResource): string => {
  const labels: Record<AuditResource, string> = {
    [AuditResource.CONTRACT]: 'Ugovor',
    [AuditResource.CUSTOMER]: 'Kupac',
    [AuditResource.CAR]: 'Vozilo',
    [AuditResource.CAR_ISSUE_REPORT]: 'Izvještaj o problemu vozila',
    [AuditResource.CAR_INSURANCE]: 'Osiguranje vozila',
    [AuditResource.CAR_REGISTRATION]: 'Registracija vozila',
    [AuditResource.CAR_SERVICE_HISTORY]: 'Servisna istorija vozila',
    [AuditResource.USER]: 'Korisnik',
    [AuditResource.AUTH]: 'Autentifikacija',
    [AuditResource.NOTIFICATION]: 'Notifikacija',
    [AuditResource.COUNTRY]: 'Država',
  };
  return labels[resource] || resource;
};

/**
 * Get color for audit action (for badges)
 */
export const getActionColor = (action: AuditAction): string => {
  const colors: Record<AuditAction, string> = {
    [AuditAction.CREATE]:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [AuditAction.READ]:
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [AuditAction.UPDATE]:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [AuditAction.DELETE]:
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [AuditAction.LOGIN]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [AuditAction.LOGOUT]:
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    [AuditAction.LOGIN_FAILED]:
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [AuditAction.EXPORT]:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    [AuditAction.UPLOAD]:
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    [AuditAction.DOWNLOAD]:
      'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  };
  return colors[action] || 'bg-gray-100 text-gray-800';
};

/**
 * Get color for status (for badges)
 */
export const getStatusColor = (status: AuditStatus): string => {
  return status === AuditStatus.SUCCESS
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
};

/**
 * Get status label
 */
export const getStatusLabel = (status: AuditStatus): string => {
  return status === AuditStatus.SUCCESS ? 'Uspješno' : 'Neuspješno';
};

/**
 * Get icon for audit action
 */
export const getActionIcon = (action: AuditAction): string => {
  const icons: Record<AuditAction, string> = {
    [AuditAction.CREATE]: '➕',
    [AuditAction.READ]: '👁️',
    [AuditAction.UPDATE]: '✏️',
    [AuditAction.DELETE]: '🗑️',
    [AuditAction.LOGIN]: '🔐',
    [AuditAction.LOGOUT]: '🚪',
    [AuditAction.LOGIN_FAILED]: '❌',
    [AuditAction.EXPORT]: '📤',
    [AuditAction.UPLOAD]: '📤',
    [AuditAction.DOWNLOAD]: '📥',
  };
  return icons[action] || '•';
};

/**
 * Format duration in milliseconds to human-readable string
 */
export const formatDuration = (ms?: number): string => {
  if (!ms) return 'N/A';

  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}min`;
};

/**
 * Format IP address (hide some digits for privacy)
 */
export const formatIpAddress = (ip?: string): string => {
  if (!ip) return 'N/A';

  // Hide last octet: 192.168.1.100 -> 192.168.1.xxx
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }

  return ip;
};

/**
 * Truncate user agent string
 */
export const formatUserAgent = (userAgent?: string): string => {
  if (!userAgent) return 'N/A';

  // Extract browser and OS
  const browserMatch = userAgent.match(
    /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/
  );
  const osMatch = userAgent.match(/(Windows|Mac OS|Linux|Android|iOS)[\s\w.]*/);

  const browser = browserMatch ? browserMatch[0] : '';
  const os = osMatch ? osMatch[0] : '';

  return `${browser} on ${os}` || userAgent.substring(0, 50) + '...';
};

/**
 * Get relative time string
 */
export const getRelativeTime = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Upravo sada';
  if (diffMinutes < 60) return `Prije ${diffMinutes} min`;
  if (diffHours < 24) return `Prije ${diffHours} sati`;
  if (diffDays < 7) return `Prije ${diffDays} dana`;

  return new Date(date).toLocaleDateString('bs-BA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
