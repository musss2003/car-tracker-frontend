import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const ContractsPage = lazy(() => import('./pages/ContractsPage'));
const ContractDetailsPage = lazy(() => import('./pages/ContractDetailsPage'));
const CreateContractPage = lazy(() => import('./pages/CreateContractPage'));
const EditContractPage = lazy(() => import('./pages/EditContractPage'));

export const contractsRoutes = (
  <>
    <Route path={ROUTES.contracts.root} element={<ContractsPage />} />
    <Route path={ROUTES.contracts.create} element={<CreateContractPage />} />
    <Route path={ROUTES.contracts.details} element={<ContractDetailsPage />} />
    <Route path={ROUTES.contracts.edit} element={<EditContractPage />} />
  </>
);
