import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const UsersPage = lazy(() => import('./pages/UsersPage'));
const CreateUserPage = lazy(() => import('./pages/CreateUserPage'));
const EditUserPage = lazy(() => import('./pages/EditUserPage'));

export const adminRoutes = (
  <>
    <Route path={ROUTES.admin.users} element={<UsersPage />} />
    <Route path={ROUTES.admin.createUser} element={<CreateUserPage />} />
    <Route path={ROUTES.admin.editUser} element={<EditUserPage />} />
  </>
);
