import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import LoadingSpinner from '@/shared/components/feedback/LoadingSpinner/LoadingSpinner';

import ProtectedRoute from './guards/ProtectedRoute';
import AdminRoute from './guards/AdminRoute';
import { ROUTES } from './paths';
import { carsRoutes } from '@/features/cars/routes';
import { bookingsRoutes } from '@/features/bookings/routes';
import { contractsRoutes } from '@/features/contracts/routes';
import { customersRoutes } from '@/features/customers/routes';
import { adminRoutes } from '@/features/users/routes';
import { profileRoutes } from '@/features/users/profile.routes';
import { auditLogsRoutes } from '@/features/audit-logs/routes';
import { dashboardRoutes } from '@/features/dashboard/routes';
import { authRoutes } from '@/features/auth/routes';

export function AppRouter() {
  const { isLoggedIn } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {authRoutes(isLoggedIn())}

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to={ROUTES.dashboard} />} />

          {dashboardRoutes}
          {carsRoutes}
          {contractsRoutes}
          {bookingsRoutes}
          {customersRoutes}
          {profileRoutes}
          {auditLogsRoutes}
        </Route>

        <Route element={<AdminRoute />}>{adminRoutes}</Route>

        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn() ? ROUTES.dashboard : ROUTES.auth.login}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}
