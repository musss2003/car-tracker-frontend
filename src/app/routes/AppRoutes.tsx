// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Auth Pages - Feature-based imports
const LoginPage = lazy(
  () => import('../../features/auth/pages/LoginPage/LoginPage')
);
const RegisterPage = lazy(
  () => import('../../features/auth/pages/RegisterPage/RegisterPage')
);

// Cars Pages - Feature-based imports
const CarsPage = lazy(() => import('../../features/cars/pages/CarsPage'));
const CreateCarPage = lazy(
  () => import('../../features/cars/pages/CreateCarPage')
);
const EditCarPage = lazy(() => import('../../features/cars/pages/EditCarPage'));
const CarDetailsPage = lazy(
  () => import('../../features/cars/pages/CarDetailsPage')
);
const CarAvailabilityPage = lazy(
  () => import('../../features/cars/pages/CarAvailabilityPage')
);

const CarServiceHistoryPage = lazy(
  () => import('../../features/cars/pages/CarServiceHistoryPage')
);

const CarRegistrationPage = lazy(
  () => import('../../features/cars/pages/CarRegistrationPage')
);

const CarInsurancePage = lazy(
  () => import('../../features/cars/pages/CarInsurancePage')
);

const MaintenanceHubPage = lazy(
  () => import('../../features/cars/pages/MaintenanceHubPage')
);

const CostAnalyticsPage = lazy(
  () => import('../../features/cars/pages/CostAnalyticsPage')
);

const TimelinePage = lazy(
  () => import('../../features/cars/pages/TimelinePage')
);

// Contracts Pages - Feature-based imports
const ContractsPage = lazy(
  () => import('../../features/contracts/pages/ContractsPage')
);
const ContractDetailsPage = lazy(
  () => import('../../features/contracts/pages/ContractDetailsPage')
);
const CreateContractPage = lazy(
  () => import('../../features/contracts/pages/CreateContractPage')
);
const EditContractPage = lazy(
  () => import('../../features/contracts/pages/EditContractPage')
);

// Customers Pages - Feature-based imports
const CustomersPage = lazy(
  () => import('../../features/customers/pages/CustomersPage')
);
const CreateCustomerPage = lazy(
  () => import('../../features/customers/pages/CreateCustomerPage')
);
const EditCustomerPage = lazy(
  () => import('../../features/customers/pages/EditCustomerPage')
);
const CustomerDetailsPage = lazy(
  () => import('../../features/customers/pages/CustomerDetailsPage')
);

// Notifications Pages - Feature-based imports
const NotificationsPage = lazy(
  () => import('../../features/notifications/pages/NotificationsPage')
);

// Audit Logs Pages - Feature-based imports
const AuditLogsPage = lazy(
  () => import('../../features/audit-logs/pages/AuditLogsPage')
);
const AuditLogDetailsPage = lazy(
  () => import('../../features/audit-logs/pages/AuditLogDetailsPage')
);

// Users Management Pages - Feature-based imports
const UsersPage = lazy(() => import('../../features/users/pages/UsersPage'));
const CreateUserPage = lazy(
  () => import('../../features/users/pages/CreateUserPage')
);
const EditUserPage = lazy(
  () => import('../../features/users/pages/EditUserPage')
);

// Dashboard Pages - Feature-based imports
const DashboardPage = lazy(
  () => import('../../features/dashboard/pages/DashboardPage')
);

// User Components - Feature-based imports
const UserProfilePage = lazy(
  () => import('../../features/users/pages/UserProfilePage')
);

// Shared Pages
const ShadcnExamplesPage = lazy(
  () => import('../../shared/pages/ShadcnExamplesPage')
);

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { useAuth } from '../../features/auth/hooks/useAuth';
import LoadingSpinner from '../../shared/components/feedback/LoadingSpinner/LoadingSpinner';
import CarIssuesPage from '@/features/cars/pages/CarIssueReportPage';

export function AppRoutes() {
  const { isLoggedIn, user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn() ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        {/* <Route
          path="/register"
          element={
            isLoggedIn() ? <Navigate to="/dashboard" /> : <RegisterPage />
          }
        /> */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cars/new" element={<CreateCarPage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route path="/cars/:id/edit" element={<EditCarPage />} />
          <Route
            path="/cars/:id/availability"
            element={<CarAvailabilityPage />}
          />
          <Route
            path="/cars/:id/service-history"
            element={<CarServiceHistoryPage />}
          />
          <Route
            path="/cars/:id/registration"
            element={<CarRegistrationPage />}
          />
          <Route path="/cars/:id/issues" element={<CarIssuesPage />} />
          <Route path="/cars/:id/insurance" element={<CarInsurancePage />} />
          <Route
            path="/cars/:id/maintenance"
            element={<MaintenanceHubPage />}
          />
          <Route
            path="/cars/:id/cost-analytics"
            element={<CostAnalyticsPage />}
          />
          <Route
            path="/cars/:id/timeline"
            element={<TimelinePage />}
          />
          <Route path="/contracts/new" element={<CreateContractPage />} />
          <Route path="/contracts/:id" element={<ContractDetailsPage />} />
          <Route path="/contracts/:id/edit" element={<EditContractPage />} />
          <Route path="/contracts" element={<ContractsPage />} />

          <Route path="/customers/new" element={<CreateCustomerPage />} />
          <Route path="/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/shadcn-examples" element={<ShadcnExamplesPage />} />
          {user && <Route path="/profile" element={<UserProfilePage />} />}
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/audit-logs/:id" element={<AuditLogDetailsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/create" element={<CreateUserPage />} />
          <Route path="/users/:id/edit" element={<EditUserPage />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </Suspense>
  );
}
