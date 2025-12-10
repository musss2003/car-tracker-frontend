// Cost Analytics Types
export interface CostAnalytics {
  totalCosts: {
    all: number;
    service: number;
    registration: number;
    insurance: number;
    issues: number;
  };
  monthlyCosts: MonthlyBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  yearlyTrends: YearlyTrend[];
  averages: {
    monthlyAverage: number;
    serviceAverage: number;
    issueAverage: number;
  };
  projections: {
    nextMonthEstimate: number;
    nextQuarterEstimate: number;
    yearEndEstimate: number;
  };
  costPerKm?: number;
  costPerDay?: number;
}

export interface MonthlyBreakdown {
  month: string;
  year: number;
  service: number;
  registration: number;
  insurance: number;
  issues: number;
  total: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface YearlyTrend {
  year: number;
  total: number;
  service: number;
  registration: number;
  insurance: number;
  issues: number;
  averageMonthly: number;
}

export interface CostComparison {
  period: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

export interface TopExpense {
  id: string;
  type: 'service' | 'registration' | 'insurance' | 'issue';
  date: string;
  description: string;
  amount: number;
}

export interface CostFilters {
  startDate?: Date;
  endDate?: Date;
  categories?: ('service' | 'registration' | 'insurance' | 'issues')[];
  minAmount?: number;
  maxAmount?: number;
}
