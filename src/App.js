"use client"

import "./App.css"

import React, { useState, lazy, Suspense } from "react"
import { Route, Routes, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAuth } from "./contexts/useAuth.js"
import useScreenSize from "./hooks/useScreenSize.js"

// Layout Components
import Sidebar from "./components/Sidebar/Sidebar.js"
import Navbar from "./components/Navbar/Navbar.js"
import AppHeader from "./components/AppHeader/AppHeader.js"
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.js"
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner.js"

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute.js"

// Lazy-loaded Pages
const LoginPage = lazy(() => import("./pages/LoginPage"))
const RegisterPage = lazy(() => import("./pages/RegisterPage"))
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const CarsPage = lazy(() => import("./pages/CarsPage"))
const ContractsPage = lazy(() => import("./pages/ContractsPage"))
const CustomersPage = lazy(() => import("./pages/CustomersPage"))
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"))
const UserProfile = lazy(() => import("./components/User/UserProfile/UserProfile"))


function App() {
  const { isLoggedIn, user } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(true) // Default open on desktop
  const isSmallScreen = useScreenSize("(max-width: 768px)")

  // Close sidebar by default on small screens
  React.useEffect(() => {
    if (isSmallScreen) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isSmallScreen])

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <ToastContainer position="bottom-right" />

        {isLoggedIn() && <Sidebar isOpen={isSidebarOpen} isSmallScreen={isSmallScreen} toggleSidebar={toggleSidebar} />}

        <main
          className={`main-content ${isLoggedIn() && !isSmallScreen && isSidebarOpen ? "with-sidebar-open" : isLoggedIn() && !isSmallScreen && !isSidebarOpen ? "with-sidebar-closed" : ""}`}
        >
          {isLoggedIn() && !isSmallScreen && <Navbar />}

          {/* App Header - only show on mobile */}
          {isSmallScreen && (
            <AppHeader isLoggedIn={isLoggedIn()} toggleSidebar={toggleSidebar} isSmallScreen={isSmallScreen} />
          )}

          <div className="page-content">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={isLoggedIn() ? <Navigate to="/dashboard" /> : <LoginPage />} />
                <Route path="/register" element={isLoggedIn() ? <Navigate to="/dashboard" /> : <RegisterPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/cars" element={<CarsPage />} />
                  <Route path="/contracts" element={<ContractsPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  {user && <Route path="/profile" element={<UserProfile id={user.id} />} />}
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to={isLoggedIn() ? "/dashboard" : "/login"} />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App

