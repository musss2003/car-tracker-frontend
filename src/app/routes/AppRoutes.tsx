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
// const NotificationsPage = lazy(() => import('../../features/notifications/pages/NotificationsPage'));

// Dashboard Pages - Feature-based imports
const DashboardPage = lazy(
  () => import('../../features/dashboard/pages/DashboardPage')
);

// User Components - Feature-based imports
const UserProfile = lazy(
  () => import('../../features/users/components/UserProfile/UserProfile')
);

// Shared Pages
const ShadcnExamplesPage = lazy(
  () => import('../../shared/pages/ShadcnExamplesPage')
);

import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../../features/auth/hooks/useAuth';
import LoadingSpinner from '../../shared/components/feedback/LoadingSpinner/LoadingSpinner';

export function AppRoutes() {
  const { isLoggedIn, user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn() ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={
            isLoggedIn() ? <Navigate to="/dashboard" /> : <RegisterPage />
          }
        />
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
          <Route path="/contracts/new" element={<CreateContractPage />} />
          <Route path="/contracts/:id" element={<ContractDetailsPage />} />
          <Route path="/contracts/:id/edit" element={<EditContractPage />} />
          <Route path="/contracts" element={<ContractsPage />} />

          <Route path="/customers/new" element={<CreateCustomerPage />} />
          <Route path="/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          {/* <Route path="/notifications" element={<NotificationsPage />} /> */}
          <Route path="/shadcn-examples" element={<ShadcnExamplesPage />} />
          {user && (
            <Route path="/profile" element={<UserProfile id={user.id} />} />
          )}
        </Route>
        <Route
          path="*"
          element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </Suspense>
  );
}
