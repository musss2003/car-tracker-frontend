import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));

export const profileRoutes = (
  <Route path={ROUTES.profile} element={<UserProfilePage />} />
);
