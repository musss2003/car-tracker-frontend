import { getCarServiceHistory } from './carServiceHistory';
import { getCarRegistrations } from './carRegistrationService';
import { getCarInsuranceHistory } from './carInsuranceService';
import { getCarIssueReportsForCar } from './carIssueReportService';
import { logError } from '@/shared/utils/errorHandler';
import { validateId } from '@/shared/utils/inputValidator';
import {
  CostAnalytics,
  MonthlyBreakdown,
  CategoryBreakdown,
  YearlyTrend,
  TopExpense,
} from '../types/costAnalytics.types';
import {
  CarServiceHistory,
  CarRegistration,
  CarInsurance,
  CarIssueReport,
} from '../types/car.types';

/**
 * Fetch and calculate comprehensive cost analytics for a car
 */
export async function getCarCostAnalytics(
  carId: string
): Promise<CostAnalytics> {
  try {
    // Input validation
    validateId(carId, 'car id');

    // Fetch all maintenance data with error handling for each source
    const results = await Promise.allSettled([
      getCarServiceHistory(carId),
      getCarRegistrations(carId),
      getCarInsuranceHistory(carId),
      getCarIssueReportsForCar(carId),
    ]);

    const serviceHistory: CarServiceHistory[] =
      results[0].status === 'fulfilled' ? results[0].value : [];
    const registrations: CarRegistration[] =
      results[1].status === 'fulfilled' ? results[1].value : [];
    const insuranceHistory: CarInsurance[] =
      results[2].status === 'fulfilled' ? results[2].value : [];
    const issueReports: CarIssueReport[] =
      results[3].status === 'fulfilled' ? results[3].value : [];

    // Calculate total costs by category
    const serviceCosts = serviceHistory.reduce(
      (sum, s) => sum + (s.cost || 0),
      0
    );
    const registrationCosts = 0; // Registrations don't have cost field yet
    const insuranceCosts = insuranceHistory.reduce(
      (sum, i) => sum + (i.price || 0),
      0
    );
    const issueCosts = 0; // Issue reports don't have cost field yet

    const totalCosts = {
      all: serviceCosts + registrationCosts + insuranceCosts + issueCosts,
      service: serviceCosts,
      registration: registrationCosts,
      insurance: insuranceCosts,
      issues: issueCosts,
    };

    // Generate monthly breakdown
    const monthlyCosts = generateMonthlyBreakdown(
      serviceHistory,
      registrations,
      insuranceHistory,
      issueReports
    );

    // Generate category breakdown
    const categoryBreakdown = generateCategoryBreakdown(totalCosts);

    // Generate yearly trends
    const yearlyTrends = generateYearlyTrends(monthlyCosts);

    // Calculate averages
    const monthsWithData = monthlyCosts.filter((m) => m.total > 0).length || 1;
    const monthlyAverage = totalCosts.all / monthsWithData;
    const serviceAverage =
      serviceCosts / Math.max(serviceHistory.length, 1) || 0;
    const issueAverage = 0; // Placeholder

    const averages = {
      monthlyAverage,
      serviceAverage,
      issueAverage,
    };

    // Generate projections based on historical data
    const projections = generateProjections(monthlyCosts, monthlyAverage);

    // Calculate cost efficiency metrics
    const latestService = serviceHistory.sort(
      (a, b) =>
        new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
    )[0];
    const totalMileage = latestService?.mileage || 0;
    const costPerKm = totalMileage > 0 ? totalCosts.all / totalMileage : 0;

    // Estimate cost per day based on total costs over time span
    const oldestDate = getOldestDate(
      serviceHistory,
      registrations,
      insuranceHistory
    );
    const daysSinceStart = oldestDate
      ? Math.max(
          1,
          Math.ceil(
            (Date.now() - new Date(oldestDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 365;
    const costPerDay = totalCosts.all / daysSinceStart;

    return {
      totalCosts,
      monthlyCosts,
      categoryBreakdown,
      yearlyTrends,
      averages,
      projections,
      costPerKm,
      costPerDay,
    };
  } catch (error) {
    if (error instanceof Error) {
      logError(error, { operation: 'getCarCostAnalytics', carId });
    }
    throw error;
  }
}

/**
 * Generate monthly cost breakdown for the last 12 months
 */
function generateMonthlyBreakdown(
  serviceHistory: CarServiceHistory[],
  registrations: CarRegistration[],
  insuranceHistory: CarInsurance[],
  issueReports: CarIssueReport[]
): MonthlyBreakdown[] {
  const monthlyMap = new Map<string, MonthlyBreakdown>();

  // Initialize last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, {
      month: date.toLocaleString('bs-BA', { month: 'short' }),
      year: date.getFullYear(),
      service: 0,
      registration: 0,
      insurance: 0,
      issues: 0,
      total: 0,
    });
  }

  // Add service costs
  serviceHistory.forEach((service) => {
    const date = new Date(service.serviceDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthlyMap.get(key);
    if (existing) {
      existing.service += service.cost || 0;
      existing.total += service.cost || 0;
    }
  });

  // Add insurance costs
  insuranceHistory.forEach((insurance) => {
    const date = new Date(insurance.insuranceExpiry);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthlyMap.get(key);
    if (existing) {
      existing.insurance += insurance.price || 0;
      existing.total += insurance.price || 0;
    }
  });

  return Array.from(monthlyMap.values());
}

/**
 * Generate category breakdown for pie chart
 */
function generateCategoryBreakdown(totalCosts: {
  all: number;
  service: number;
  registration: number;
  insurance: number;
  issues: number;
}): CategoryBreakdown[] {
  const total = totalCosts.all || 1; // Avoid division by zero

  return [
    {
      name: 'Servis',
      value: totalCosts.service,
      percentage: (totalCosts.service / total) * 100,
      color: '#10b981', // green
    },
    {
      name: 'Registracija',
      value: totalCosts.registration,
      percentage: (totalCosts.registration / total) * 100,
      color: '#3b82f6', // blue
    },
    {
      name: 'Osiguranje',
      value: totalCosts.insurance,
      percentage: (totalCosts.insurance / total) * 100,
      color: '#8b5cf6', // purple
    },
    {
      name: 'Problemi',
      value: totalCosts.issues,
      percentage: (totalCosts.issues / total) * 100,
      color: '#ef4444', // red
    },
  ].filter((cat) => cat.value > 0);
}

/**
 * Generate yearly trends
 */
function generateYearlyTrends(monthlyCosts: MonthlyBreakdown[]): YearlyTrend[] {
  const yearlyMap = new Map<number, YearlyTrend>();

  monthlyCosts.forEach((month) => {
    const existing = yearlyMap.get(month.year);
    if (existing) {
      existing.total += month.total;
      existing.service += month.service;
      existing.registration += month.registration;
      existing.insurance += month.insurance;
      existing.issues += month.issues;
    } else {
      yearlyMap.set(month.year, {
        year: month.year,
        total: month.total,
        service: month.service,
        registration: month.registration,
        insurance: month.insurance,
        issues: month.issues,
        averageMonthly: 0,
      });
    }
  });

  // Calculate average monthly for each year
  return Array.from(yearlyMap.values())
    .map((year) => ({
      ...year,
      averageMonthly: year.total / 12,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Generate cost projections
 */
function generateProjections(
  monthlyCosts: MonthlyBreakdown[],
  monthlyAverage: number
): {
  nextMonthEstimate: number;
  nextQuarterEstimate: number;
  yearEndEstimate: number;
} {
  // Simple projection based on average (can be enhanced with trend analysis)
  const recentMonths = monthlyCosts.slice(-3);
  const recentAverage =
    recentMonths.reduce((sum, m) => sum + m.total, 0) /
    Math.max(recentMonths.length, 1);

  return {
    nextMonthEstimate: recentAverage,
    nextQuarterEstimate: recentAverage * 3,
    yearEndEstimate: monthlyAverage * 12,
  };
}

/**
 * Get top expenses across all categories
 */
export async function getTopExpenses(
  carId: string,
  limit: number = 10
): Promise<TopExpense[]> {
  try {
    const results = await Promise.allSettled([
      getCarServiceHistory(carId),
      getCarInsuranceHistory(carId),
    ]);

    const serviceHistory: CarServiceHistory[] =
      results[0].status === 'fulfilled' ? results[0].value : [];
    const insuranceHistory: CarInsurance[] =
      results[1].status === 'fulfilled' ? results[1].value : [];

    const expenses: TopExpense[] = [];

    // Add service expenses
    serviceHistory.forEach((service) => {
      if (service.cost) {
        expenses.push({
          id: service.id,
          type: 'service',
          date: service.serviceDate,
          description: `${service.serviceType} - ${service.description || 'Redovni servis'}`,
          amount: service.cost,
        });
      }
    });

    // Add insurance expenses
    insuranceHistory.forEach((insurance) => {
      if (insurance.price) {
        expenses.push({
          id: insurance.id,
          type: 'insurance',
          date: insurance.insuranceExpiry,
          description: `Osiguranje ${insurance.provider ? `- ${insurance.provider}` : ''}`,
          amount: insurance.price,
        });
      }
    });

    // Sort by amount descending and take top N
    return expenses.sort((a, b) => b.amount - a.amount).slice(0, limit);
  } catch (error) {
    if (error instanceof Error) {
      logError(error, { operation: 'getTopExpenses', carId, limit });
    }
    throw error;
  }
}

/**
 * Get oldest date from all maintenance records
 */
function getOldestDate(
  serviceHistory: CarServiceHistory[],
  registrations: CarRegistration[],
  insuranceHistory: CarInsurance[]
): string | null {
  const dates: Date[] = [];

  serviceHistory.forEach((s) => dates.push(new Date(s.serviceDate)));
  registrations.forEach((r) => dates.push(new Date(r.createdAt)));
  insuranceHistory.forEach((i) => dates.push(new Date(i.createdAt)));

  if (dates.length === 0) return null;

  const validDates = dates.filter((d) => !isNaN(d.getTime()));
  if (validDates.length === 0) return null;

  validDates.sort((a, b) => a.getTime() - b.getTime());

  return validDates[0].toISOString();
}

/**
 * Calculate cost comparison between periods
 */
export function calculateCostComparison(
  monthlyCosts: MonthlyBreakdown[],
  period: 'month' | 'quarter' | 'year'
): {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
} {
  const monthsToCompare =
    period === 'month' ? 1 : period === 'quarter' ? 3 : 12;

  const currentPeriod = monthlyCosts.slice(-monthsToCompare);
  const previousPeriod = monthlyCosts.slice(
    -monthsToCompare * 2,
    -monthsToCompare
  );

  const current = currentPeriod.reduce((sum, m) => sum + m.total, 0);
  const previous = previousPeriod.reduce((sum, m) => sum + m.total, 0);
  const change = current - previous;
  const changePercentage = previous > 0 ? (change / previous) * 100 : 0;

  return { current, previous, change, changePercentage };
}
