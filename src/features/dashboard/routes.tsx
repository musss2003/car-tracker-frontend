import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export const dashboardRoutes = (
  <Route path={ROUTES.dashboard} element={<DashboardPage />} />
);
