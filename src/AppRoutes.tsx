// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CarsPage = lazy(() => import("./pages/CarsPage"));
const ContractsPage = lazy(() => import("./pages/ContractsPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const UserProfile = lazy(() => import("./components/User/UserProfile/UserProfile"));

import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./contexts/useAuth";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import DashboardPage from "./pages/DashboardPage/DashboardPage";

export function AppRoutes() {
  const { isLoggedIn, user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={isLoggedIn() ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isLoggedIn() ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {user && <Route path="/profile" element={<UserProfile id={user.id} />} />}
        </Route>
        <Route path="*" element={<Navigate to={isLoggedIn() ? "/dashboard" : "/login"} />} />
      </Routes>
    </Suspense>
  );
}
