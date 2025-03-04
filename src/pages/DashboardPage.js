"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getCars } from "../services/carService"
import { getCustomers } from "../services/customerService"
import { getTotalRevenue, getActiveContracts } from "../services/contractService"

// Custom hook for data fetching with loading and error states
function useDataFetcher(fetchFn, initialValue = null) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await fetchFn()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchFn])

  return { data, loading, error }
}

function DashboardPage() {
  // Use the custom hook for each data fetch
  const { data: cars, loading: carsLoading, error: carsError } = useDataFetcher(getCars, [])

  const { data: customers, loading: customersLoading, error: customersError } = useDataFetcher(getCustomers, [])

  const {
    data: revenueData,
    loading: revenueLoading,
    error: revenueError,
  } = useDataFetcher(getTotalRevenue, { totalRevenue: 0 })

  const { data: contracts, loading: contractsLoading, error: contractsError } = useDataFetcher(getActiveContracts, [])

  // Derived values
  const numberOfCars = cars?.length || 0
  const numberOfCustomers = customers?.length || 0
  const numberOfContracts = contracts?.length || 0
  const totalRevenue = revenueData?.totalRevenue || 0

  // Mock data for charts and trends
  const monthlyRevenue = [12500, 14000, 15800, 14200, 16500, 17800, 19200, 18500, 20100, 21500, 22800, totalRevenue]
  const carUtilization = numberOfCars ? (numberOfContracts / numberOfCars) * 100 : 0
  const revenueChange = 12.5 // Percentage change from last month
  const customerChange = 8.3 // Percentage change from last month

  // Check if any errors occurred
  const hasErrors = carsError || customersError || revenueError || contractsError

  return (
    <div className="flex flex-col gap-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Overview of your car rental business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center px-3 py-1 text-sm border rounded-md hover:bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2"
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
          <button className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2"
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
        <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
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
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm">
            There was a problem loading some dashboard data. Please try refreshing the page.
          </p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Contracts Card */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Contracts</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-blue-500"
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
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{numberOfContracts}</div>
            )}
            <p className="text-xs text-gray-500">{carUtilization.toFixed(1)}% car utilization</p>
            <div className="w-full h-1 mt-2 bg-gray-200 rounded-full">
              <div
                className="h-1 bg-blue-500 rounded-full"
                style={{ width: `${Math.min(carUtilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Available Cars Card */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Available Cars</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-green-500"
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
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{numberOfCars}</div>
            )}
            <p className="text-xs text-gray-500">{numberOfCars - numberOfContracts} cars currently available</p>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-purple-500"
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
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{numberOfCustomers}</div>
            )}
            <div className="flex items-center pt-1">
              {customerChange > 0 ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 mr-1 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs text-green-500">+{customerChange}%</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 mr-1 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-xs text-red-500">{customerChange}%</span>
                </>
              )}
              <span className="text-xs text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-yellow-500"
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
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            )}
            <div className="flex items-center pt-1">
              {revenueChange > 0 ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 mr-1 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs text-green-500">+{revenueChange}%</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 mr-1 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-xs text-red-500">{revenueChange}%</span>
                </>
              )}
              <span className="text-xs text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Revenue Overview</h3>
          <p className="text-sm text-gray-500">Monthly revenue for the current year</p>
        </div>
        <div className="h-80">
          <RevenueChart data={monthlyRevenue} />
        </div>
      </div>

      {/* Quick Links and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Links */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Quick Links</h3>
            <p className="text-sm text-gray-500">Frequently used pages and actions</p>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/contracts" className="flex items-start h-20 p-3 border rounded-md hover:bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 text-blue-500"
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
                <div className="flex flex-col items-start">
                  <span className="font-medium">Manage Contracts</span>
                  <span className="text-xs text-gray-500">{numberOfContracts} active contracts</span>
                </div>
              </Link>

              <Link to="/customers" className="flex items-start h-20 p-3 border rounded-md hover:bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 text-purple-500"
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
                <div className="flex flex-col items-start">
                  <span className="font-medium">View Customers</span>
                  <span className="text-xs text-gray-500">{numberOfCustomers} total customers</span>
                </div>
              </Link>

              <Link to="/cars" className="flex items-start h-20 p-3 border rounded-md hover:bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 text-green-500"
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
                <div className="flex flex-col items-start">
                  <span className="font-medium">Available Cars</span>
                  <span className="text-xs text-gray-500">{numberOfCars} in fleet</span>
                </div>
              </Link>

              <Link to="/rentals" className="flex items-start h-20 p-3 border rounded-md hover:bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 text-yellow-500"
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
                <div className="flex flex-col items-start">
                  <span className="font-medium">Rental Details</span>
                  <span className="text-xs text-gray-500">View all transactions</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest transactions and events</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                <div className={`rounded-full p-2 ${activity.iconBg}`}>{activity.icon}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="w-full px-4 py-2 text-sm border rounded-md hover:bg-gray-50">View All Activity</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Revenue Chart Component
function RevenueChart({ data }) {
  // This is a placeholder for a real chart component
  // In a real application, you would use a library like Recharts, Chart.js, or D3.js
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const maxValue = Math.max(...data)

  return (
    <div className="w-full h-full flex items-end gap-2">
      {data.map((value, index) => (
        <div key={index} className="relative flex flex-col items-center flex-1 group">
          <div
            className="w-full bg-blue-100 hover:bg-blue-200 rounded-t transition-all duration-200"
            style={{ height: `${(value / maxValue) * 100}%` }}
          >
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded px-2 py-1 text-xs">
              ${value.toLocaleString()}
            </div>
          </div>
          <div className="text-xs mt-2">{months[index]}</div>
        </div>
      ))}
    </div>
  )
}

// Mock data for recent activities
const recentActivities = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
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
    iconBg: "bg-blue-500",
    title: "New customer registered",
    description: "John Doe created a new account",
    time: "2 hours ago",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
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
    iconBg: "bg-green-500",
    title: "Car rental started",
    description: "Toyota Camry rented by Maria Garcia",
    time: "5 hours ago",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
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
    iconBg: "bg-purple-500",
    title: "Contract completed",
    description: "Contract #1234 has been completed",
    time: "Yesterday",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
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
    iconBg: "bg-yellow-500",
    title: "Payment received",
    description: "$350 payment for Contract #5678",
    time: "Yesterday",
  },
]

export default DashboardPage

