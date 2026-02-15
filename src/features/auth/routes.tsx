import { Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));

export const authRoutes = (isLoggedIn: boolean) => (
  <Route
    path={ROUTES.auth.login}
    element={
      isLoggedIn ? <Navigate to={ROUTES.dashboard} replace /> : <LoginPage />
    }
  />
);
