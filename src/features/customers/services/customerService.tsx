import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import { Customer } from '../types/customer.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + `/api/customers/`;

// Get a single customer by ID
export const getCustomer = async (customerId: string): Promise<Customer> => {
  try {
    const response = await fetch(`${API_URL}${customerId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    console.log('🔍 Fetching customers from:', API_URL);
    console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response content-type:', response.headers.get('content-type'));

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Try to get more error details
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        // It's HTML or other non-JSON response (likely 404 page)
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText.substring(0, 200));
        errorMessage = `Server returned ${response.status}. Expected JSON but got ${contentType}`;
      }
      
      console.error('Error fetching customers:', errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all customers:', error);
    throw error;
  }
};

// Search customers by name
export const searchCustomersByName = async (
  name: string
): Promise<Customer[]> => {
  try {
    const response = await fetch(
      `${API_URL}search?name=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error searching for customers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Update customer
export const updateCustomer = async (
  customerId: string,
  updatedCustomer: Partial<Customer>
): Promise<Customer> => {
  try {
    const response = await fetch(`${API_URL}${customerId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCustomer),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// Delete customer
export const deleteCustomer = async (customerId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}${customerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Add new customer
export const addCustomer = async (
  newCustomer: Partial<Customer>
): Promise<Customer> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCustomer),
    });

    console.log(newCustomer);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
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
  try {
    const response = await fetch(
      `${API_URL.replace('customers/', '')}countries`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const countries = await response.json();

    return countries;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to fetch countries from local API:', errorMessage);
    throw new Error(`Failed to fetch countries: ${errorMessage}`);
  }
};
