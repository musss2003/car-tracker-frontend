import './DashboardPage.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCars } from '../../services/carService';
import { getCustomers } from '../../services/customerService';
import {
  getTotalRevenue,
  getActiveContracts,
} from '../../services/contractService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Generic custom hook with typing
function useDataFetcher<T>(fetchFn: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFn]);

  return { data, loading, error };
}

function DashboardPage() {
  // Use the custom hook for each data fetch
  const {
    data: cars,
    loading: carsLoading,
    error: carsError,
  } = useDataFetcher(getCars, []);

  const {
    data: customers,
    loading: customersLoading,
    error: customersError,
  } = useDataFetcher(getCustomers, []);

  const {
    data: revenueData,
    loading: revenueLoading,
    error: revenueError,
  } = useDataFetcher(getTotalRevenue, 0);

  const {
    data: contracts,
    loading: contractsLoading,
    error: contractsError,
  } = useDataFetcher(getActiveContracts, []);

  // Derived values
  const numberOfCars = cars.length;
  const numberOfCustomers = customers.length;
  const numberOfContracts = contracts.length;
  const totalRevenue = revenueData;

  console.log(totalRevenue);

  // Mock data for charts and trends
  const monthlyRevenue = [
    12500,
    14000,
    15800,
    14200,
    16500,
    17800,
    19200,
    18500,
    20100,
    21500,
    22800,
    totalRevenue,
  ];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  // Transform the data for Recharts
  const revenue = months.map((month, index) => ({
    name: month,
    revenue: monthlyRevenue[index],
  }));
  const carUtilization = numberOfCars
    ? (numberOfContracts / numberOfCars) * 100
    : 0;
  const revenueChange = 12.5; // Percentage change from last month
  const customerChange = 8.3; // Percentage change from last month

  // Check if any errors occurred
  const hasErrors =
    carsError || customersError || revenueError || contractsError;

  const RevenueLineChart = () => (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={revenue}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#82ca9d"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Dashboard</h1>
          <p>Overview of your car rental business performance</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon-small"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Last updated: {new Date().toLocaleTimeString()}
          </button>
          <button className="btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon-small"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            View Reports
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <div className="error-alert">
          <div className="alert-icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="alert-title">Error</span>
          </div>
          <p className="alert-message">
            There was a problem loading some dashboard data. Please try
            refreshing the page.
          </p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {/* Active Contracts Card */}
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Active Contracts</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="metric-icon blue"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            {contractsLoading ? (
              <div className="loading-placeholder"></div>
            ) : (
              <div className="metric-value">{numberOfContracts}</div>
            )}
            <p className="metric-subtitle">
              {carUtilization.toFixed(1)}% car utilization
            </p>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(carUtilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Available Cars Card */}
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Available Cars</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="metric-icon green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <div>
            {carsLoading ? (
              <div className="loading-placeholder"></div>
            ) : (
              <div className="metric-value">{numberOfCars}</div>
            )}
            <p className="metric-subtitle">
              {numberOfCars - numberOfContracts} cars currently available
            </p>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Total Customers</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="metric-icon purple"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            {customersLoading ? (
              <div className="loading-placeholder"></div>
            ) : (
              <div className="metric-value">{numberOfCustomers}</div>
            )}
            <div className="trend-indicator">
              {customerChange > 0 ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="trend-icon up"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span className="trend-value up">+{customerChange}%</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="trend-icon down"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  <span className="trend-value down">{customerChange}%</span>
                </>
              )}
              <span className="trend-period">from last month</span>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Total Revenue</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="metric-icon yellow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            {revenueLoading ? (
              <div className="loading-placeholder"></div>
            ) : (
              <div className="metric-value">
                {totalRevenue.toLocaleString()} BAM
              </div>
            )}
            <div className="trend-indicator">
              {revenueChange > 0 ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="trend-icon up"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span className="trend-value up">+{revenueChange}%</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="trend-icon down"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  <span className="trend-value down">{revenueChange}%</span>
                </>
              )}
              <span className="trend-period">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Revenue Overview</h3>
          <p className="chart-subtitle">Monthly revenue for the current year</p>
        </div>
        <div className="chart-content">
          <RevenueLineChart />
        </div>
      </div>

      {/* Quick Links and Recent Activity */}
      <div className="dashboard-grid">
        {/* Quick Links */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Quick Links</h3>
            <p className="card-subtitle">Frequently used pages and actions</p>
          </div>
          <div className="quick-links">
            <div className="quick-links-grid">
              <Link to="/contracts" className="quick-link-card">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="quick-link-icon blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="quick-link-content">
                  <span className="quick-link-title">Manage Contracts</span>
                  <span className="quick-link-subtitle">
                    {numberOfContracts} active contracts
                  </span>
                </div>
              </Link>

              <Link to="/customers" className="quick-link-card">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="quick-link-icon purple"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <div className="quick-link-content">
                  <span className="quick-link-title">View Customers</span>
                  <span className="quick-link-subtitle">
                    {numberOfCustomers} total customers
                  </span>
                </div>
              </Link>

              <Link to="/cars" className="quick-link-card">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="quick-link-icon green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <div className="quick-link-content">
                  <span className="quick-link-title">Available Cars</span>
                  <span className="quick-link-subtitle">
                    {numberOfCars} in fleet
                  </span>
                </div>
              </Link>

              <Link to="/rentals" className="quick-link-card">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="quick-link-icon yellow"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="quick-link-content">
                  <span className="quick-link-title">Rental Details</span>
                  <span className="quick-link-subtitle">
                    View all transactions
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <p className="card-subtitle">Latest transactions and events</p>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.iconClass}`}>
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <p className="activity-title">{activity.title}</p>
                  <p className="activity-description">{activity.description}</p>
                </div>
                <p className="activity-time">{activity.time}</p>
              </div>
            ))}
          </div>
          <div className="view-all-container">
            <button className="btn-view-all">View All Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data for recent activities
const recentActivities = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="activity-icon-svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    iconClass: 'blue',
    title: 'New customer registered',
    description: 'John Doe created a new account',
    time: '2 hours ago',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="activity-icon-svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    iconClass: 'green',
    title: 'Car rental started',
    description: 'Toyota Camry rented by Maria Garcia',
    time: '5 hours ago',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="activity-icon-svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    iconClass: 'purple',
    title: 'Contract completed',
    description: 'Contract #1234 has been completed',
    time: 'Yesterday',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="activity-icon-svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    iconClass: 'yellow',
    title: 'Payment received',
    description: '$350 payment for Contract #5678',
    time: 'Yesterday',
  },
];

export default DashboardPage;
