/**
 * Format a date for display in the UI
 */
export const formatDate = (
  dateString: string | Date | null | undefined
): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('bs-BA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (
  dateString: string | Date | null | undefined
): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
};

/**
 * Format a date with time
 */
export const formatDateTime = (
  dateString: string | Date | null | undefined
): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return date.toLocaleString('bs-BA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if a date is expired (in the past)
 */
export const isExpired = (
  expiryDate: string | Date | null | undefined
): boolean => {
  if (!expiryDate) return false;

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expiry < today;
};

/**
 * Check if a date is expiring soon (within specified days, default 30)
 */
export const isExpiringSoon = (
  expiryDate: string | Date | null | undefined,
  daysThreshold: number = 30
): boolean => {
  if (!expiryDate) return false;

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0;
};

/**
 * Get days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (
  expiryDate: string | Date | null | undefined
): number => {
  if (!expiryDate) return 0;

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 120
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Calculate difference between two dates in days
 */
export const getDaysBetween = (
  startDate: string | Date,
  endDate: string | Date
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
