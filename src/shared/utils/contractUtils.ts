export const calculateDuration = (
  startDateStr: string | Date | undefined,
  endDateStr: string | Date | undefined
): number => {
  try {
    if (!startDateStr || !endDateStr) return 0;

    const startDate =
      typeof startDateStr === 'string' ? new Date(startDateStr) : startDateStr;
    const endDate =
      typeof endDateStr === 'string' ? new Date(endDateStr) : endDateStr;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (_error) {
    return 0;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
