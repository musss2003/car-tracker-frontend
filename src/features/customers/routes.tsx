import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const CreateCustomerPage = lazy(() => import('./pages/CreateCustomerPage'));
const CustomerDetailsPage = lazy(() => import('./pages/CustomerDetailsPage'));
const EditCustomerPage = lazy(() => import('./pages/EditCustomerPage'));

export const customersRoutes = (
  <>
    <Route path={ROUTES.customers.root} element={<CustomersPage />} />
    <Route path={ROUTES.customers.create} element={<CreateCustomerPage />} />
    <Route path={ROUTES.customers.details} element={<CustomerDetailsPage />} />
    <Route path={ROUTES.customers.edit} element={<EditCustomerPage />} />
  </>
);
