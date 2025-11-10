// Contracts Feature - Public API
// Re-export everything that should be accessible from outside this feature

// Pages
export { default as ContractsPage } from './pages/ContractsPage';
export { default as ContractDetailsPage } from './pages/ContractDetailsPage';
export { default as CreateContractPage } from './pages/CreateContractPage';
export { default as EditContractPage } from './pages/EditContractPage';

// Components
export { DateRangeValidator } from './components/date-range-validator';

// Services
export * from './services/contractService';

// Types
export type * from './types/contract.types';
