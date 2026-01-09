import {
  api,
  encodePathParam,
  buildQueryString,
} from '@/shared/utils/apiService';
import { Customer } from '../types/customer.types';
import { Contract } from '@/features/contracts/types/contract.types';

// Get a single customer by ID
export const getCustomer = async (customerId: string): Promise<Customer> => {
  return api.get<Customer>(
    `/api/customers/${encodePathParam(customerId)}`,
    'customer',
    customerId
  );
};

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  return api.get<Customer[]>('/api/customers', 'customers');
};

// Search customers by name
export const searchCustomersByName = async (
  name: string
): Promise<Customer[]> => {
  const query = buildQueryString({ name });
  return api.get<Customer[]>(`/api/customers/search${query}`, 'customers');
};

// Update customer
export const updateCustomer = async (
  customerId: string,
  updatedCustomer: Partial<Customer>
): Promise<Customer> => {
  return api.put<Customer>(
    `/api/customers/${encodePathParam(customerId)}`,
    updatedCustomer,
    'customer',
    customerId
  );
};

// Delete customer
export const deleteCustomer = async (customerId: string): Promise<void> => {
  return api.delete<void>(
    `/api/customers/${encodePathParam(customerId)}`,
    'customer',
    customerId
  );
};

// Add new customer
export const addCustomer = async (
  newCustomer: Partial<Customer>
): Promise<Customer> => {
  return api.post<Customer>('/api/customers', newCustomer, 'customer');
};

// Define interface for country data from ApiCountries API
interface Country {
  name: string;
  flag: string;
  dialCodes: string[];
  alpha2Code: string;
  alpha3Code: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  currencies: Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
  languages: Array<{
    iso639_1: string;
    iso639_2: string;
    name: string;
    nativeName: string;
  }>;
}

// Interface for the country data we need in the form
export interface CountryOption {
  name: string;
  flag: string;
  dialCode: string;
  code: string;
}

// Get all countries from local database API
export const getCountries = async (): Promise<CountryOption[]> => {
  return api.get<CountryOption[]>('/api/countries', 'countries');
};

// Get all contracts for a specific customer
export const getCustomerContracts = async (
  customerId: string
): Promise<Contract[]> => {
  return api.get<Contract[]>(
    `/api/customers/${encodePathParam(customerId)}/contracts`,
    'customer contracts',
    customerId
  );
};
