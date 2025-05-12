import { getAuthHeaders } from '../utils/getAuthHeaders';
import { Customer } from '../types/Customer';

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
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
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

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};
