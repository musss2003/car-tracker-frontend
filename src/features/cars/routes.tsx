import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const CarsPage = lazy(() => import('./pages/CarsPage'));
const CreateCarPage = lazy(() => import('./pages/CreateCarPage'));
const EditCarPage = lazy(() => import('./pages/EditCarPage'));
const CarDetailsPage = lazy(() => import('./pages/CarDetailsPage'));
const CarAvailabilityPage = lazy(() => import('./pages/CarAvailabilityPage'));
const CarServiceHistoryPage = lazy(
  () => import('./pages/CarServiceHistoryPage')
);
const CarRegistrationPage = lazy(() => import('./pages/CarRegistrationPage'));
const CarInsurancePage = lazy(() => import('./pages/CarInsurancePage'));
const MaintenanceHubPage = lazy(() => import('./pages/MaintenanceHubPage'));
const CostAnalyticsPage = lazy(() => import('./pages/CostAnalyticsPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const CarIssuesPage = lazy(() => import('./pages/CarIssueReportPage'));

export const carsRoutes = (
  <>
    <Route path={ROUTES.cars.root} element={<CarsPage />} />
    <Route path={ROUTES.cars.create} element={<CreateCarPage />} />
    <Route path={ROUTES.cars.details} element={<CarDetailsPage />} />
    <Route path={ROUTES.cars.edit} element={<EditCarPage />} />
    <Route path={ROUTES.cars.availability} element={<CarAvailabilityPage />} />
    <Route
      path={ROUTES.cars.serviceHistory}
      element={<CarServiceHistoryPage />}
    />
    <Route path={ROUTES.cars.registration} element={<CarRegistrationPage />} />
    <Route path={ROUTES.cars.issues} element={<CarIssuesPage />} />
    <Route path={ROUTES.cars.insurance} element={<CarInsurancePage />} />
    <Route path={ROUTES.cars.maintenance} element={<MaintenanceHubPage />} />
    <Route path={ROUTES.cars.costAnalytics} element={<CostAnalyticsPage />} />
    <Route path={ROUTES.cars.timeline} element={<TimelinePage />} />
  </>
);
