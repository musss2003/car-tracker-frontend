import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  ArrowLeft,
  Download,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  Wallet,
  Calculator,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { PageHeader } from '@/shared/components/ui/page-header';
import { LoadingState } from '@/shared/components/ui/loading-state';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { getCar } from '../services/carService';
import {
  getCarCostAnalytics,
  getTopExpenses,
  calculateCostComparison,
} from '../services/costAnalyticsService';
import { Car } from '../types/car.types';
import {
  CostAnalytics,
  TopExpense,
  MonthlyBreakdown,
} from '../types/costAnalytics.types';

export default function CostAnalyticsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [car, setCar] = useState<Car | null>(null);
  const [analytics, setAnalytics] = useState<CostAnalytics | null>(null);
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'month' | 'quarter' | 'year'
  >('month');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [carData, analyticsData, expensesData] = await Promise.all([
          getCar(id),
          getCarCostAnalytics(id),
          getTopExpenses(id, 5),
        ]);

        setCar(carData);
        setAnalytics(analyticsData);
        setTopExpenses(expensesData);
      } catch (error) {
        console.error('Error loading cost analytics:', error);
        toast.error('Greška pri učitavanju analitike troškova');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleExport = () => {
    if (!analytics || !car) return;

    try {
      const csvContent = generateCSVReport(analytics, car);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analitika-troskova-${car.licensePlate}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Izvještaj uspješno izvezen');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Greška pri izvozu izvještaja');
    }
  };

  if (loading) {
    return <LoadingState text="Učitavanje analitike troškova..." />;
  }

  if (!car || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Podaci nisu dostupni</p>
        </div>
      </div>
    );
  }

  const comparison = calculateCostComparison(
    analytics.monthlyCosts,
    selectedPeriod
  );
  const isIncreasing = comparison.change > 0;

  return (
    <div className="h-full w-full space-y-4">
      {/* Header */}
      <PageHeader
        title={`Analitika troškova - ${car.manufacturer} ${car.model}`}
        subtitle={`${car.licensePlate} • Detaljni pregled troškova održavanja`}
        onBack={() => navigate(`/cars/${id}`)}
        actions={
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Izvezi izvještaj
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Costs */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ukupni troškovi
                </p>
                <p className="text-3xl font-bold mt-2">
                  {Number(analytics.totalCosts.all).toFixed(2)} BAM
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isIncreasing ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
              <span
                className={`text-sm font-medium ${isIncreasing ? 'text-red-500' : 'text-green-500'}`}
              >
                {Math.abs(comparison.changePercentage).toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedPeriod === 'month'
                  ? 'ovaj mjesec'
                  : selectedPeriod === 'quarter'
                    ? 'ovaj kvartal'
                    : 'ova godina'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Average */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mjesečni prosjek
                </p>
                <p className="text-3xl font-bold mt-2">
                  {Number(analytics.averages.monthlyAverage).toFixed(2)} BAM
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Projekcija za sljedeći mjesec:{' '}
              <span className="font-semibold text-foreground">
                {Number(analytics.projections.nextMonthEstimate).toFixed(2)} BAM
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Cost per KM */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trošak po KM
                </p>
                <p className="text-3xl font-bold mt-2">
                  {(analytics.costPerKm || 0).toFixed(3)} BAM
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Trošak po danu:{' '}
              <span className="font-semibold text-foreground">
                {(analytics.costPerDay || 0).toFixed(2)} BAM
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Average Service Cost */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Prosjek servisa
                </p>
                <p className="text-3xl font-bold mt-2">
                  {Number(analytics.averages.serviceAverage).toFixed(2)} BAM
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Godišnja projekcija:{' '}
              <span className="font-semibold text-foreground">
                {Number(analytics.projections.yearEndEstimate).toFixed(2)} BAM
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Period analize
            </CardTitle>
            <div className="flex gap-2">
              {(['month', 'quarter', 'year'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === 'month'
                    ? 'Mjesec'
                    : period === 'quarter'
                      ? 'Kvartal'
                      : 'Godina'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5" />
              Mjesečni troškovi (zadnjih 12 mjeseci)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.monthlyCosts}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                  formatter={(value: number) =>
                    `${Number(value).toFixed(2)} BAM`
                  }
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Raspodjela troškova po kategorijama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) =>
                    `${name}: ${Number(percentage).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `${Number(value).toFixed(2)} BAM`
                  }
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analytics.categoryBreakdown.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="font-semibold">
                    {Number(category.value).toFixed(2)} BAM
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stacked Bar Chart - Categories by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Troškovi po kategorijama (mjesečno)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyCosts}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                  formatter={(value: number) =>
                    `${Number(value).toFixed(2)} BAM`
                  }
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="service"
                  stackId="a"
                  fill="#10b981"
                  name="Servis"
                />
                <Bar
                  dataKey="registration"
                  stackId="a"
                  fill="#3b82f6"
                  name="Registracija"
                />
                <Bar
                  dataKey="insurance"
                  stackId="a"
                  fill="#8b5cf6"
                  name="Osiguranje"
                />
                <Bar
                  dataKey="issues"
                  stackId="a"
                  fill="#ef4444"
                  name="Problemi"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Najveći troškovi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nema evidentiranih troškova</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topExpenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {expense.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString(
                              'bs-BA',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                        <Badge
                          variant={
                            expense.type === 'service'
                              ? 'default'
                              : expense.type === 'insurance'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {expense.type === 'service'
                            ? 'Servis'
                            : expense.type === 'insurance'
                              ? 'Osiguranje'
                              : expense.type === 'registration'
                                ? 'Registracija'
                                : 'Problem'}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-primary mt-1">
                        {Number(expense.amount).toFixed(2)} BAM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Yearly Trends */}
      {analytics.yearlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5" />
              Godišnji trendovi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.yearlyTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                  formatter={(value: number) =>
                    `${Number(value).toFixed(2)} BAM`
                  }
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Ukupno"
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="averageMonthly"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Mjesečni prosjek"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Generate CSV report from analytics data
 */
function generateCSVReport(analytics: CostAnalytics, car: Car): string {
  const lines: string[] = [];

  // Header
  lines.push(`Analitika troškova - ${car.manufacturer} ${car.model}`);
  lines.push(`Registarska oznaka: ${car.licensePlate}`);
  lines.push(`Datum izvještaja: ${new Date().toLocaleDateString('bs-BA')}`);
  lines.push('');

  // Total costs
  lines.push('UKUPNI TROŠKOVI');
  lines.push('Kategorija,Iznos (BAM)');
  lines.push(`Servis,${Number(analytics.totalCosts.service).toFixed(2)}`);
  lines.push(
    `Registracija,${Number(analytics.totalCosts.registration).toFixed(2)}`
  );
  lines.push(`Osiguranje,${Number(analytics.totalCosts.insurance).toFixed(2)}`);
  lines.push(`Problemi,${Number(analytics.totalCosts.issues).toFixed(2)}`);
  lines.push(`UKUPNO,${Number(analytics.totalCosts.all).toFixed(2)}`);
  lines.push('');

  // Monthly breakdown
  lines.push('MJESEČNI TROŠKOVI');
  lines.push('Mjesec,Godina,Servis,Registracija,Osiguranje,Problemi,Ukupno');
  analytics.monthlyCosts.forEach((month) => {
    lines.push(
      `${month.month},${month.year},${Number(month.service).toFixed(2)},${Number(month.registration).toFixed(2)},${Number(month.insurance).toFixed(2)},${Number(month.issues).toFixed(2)},${Number(month.total).toFixed(2)}`
    );
  });
  lines.push('');

  // Averages
  lines.push('PROSJECI');
  lines.push('Metrika,Vrijednost (BAM)');
  lines.push(
    `Mjesečni prosjek,${Number(analytics.averages.monthlyAverage).toFixed(2)}`
  );
  lines.push(
    `Prosjek servisa,${Number(analytics.averages.serviceAverage).toFixed(2)}`
  );
  lines.push(`Trošak po KM,${Number(analytics.costPerKm || 0).toFixed(3)}`);
  lines.push(`Trošak po danu,${Number(analytics.costPerDay || 0).toFixed(2)}`);

  return lines.join('\n');
}
