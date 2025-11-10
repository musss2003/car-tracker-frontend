// Customers Feature - Public API
// Re-export everything that should be accessible from outside this feature

// Pages
export { default as CustomersPage } from './pages/CustomersPage';
export { default as CustomerDetailsPage } from './pages/CustomerDetailsPage';
export { default as CreateCustomerPage } from './pages/CreateCustomerPage';
export { default as EditCustomerPage } from './pages/EditCustomerPage';

// Components
export { CustomerSearchSelect } from './components/customer-search-select';

// Services
export * from './services/customerService';

// Types
export type * from './types/customer.types';
