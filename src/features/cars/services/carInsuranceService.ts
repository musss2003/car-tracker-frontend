import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import { CarInsurance } from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_URL = `${API_URL}car-insurance/`;

// Get all insurance records for a car
export const getCarInsuranceHistory = async (
  carId: string
): Promise<CarInsurance[]> => {
  const res = await fetch(`${BASE_URL}${carId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch insurance records');
  return res.json();
};

// Add insurance policy
export const addCarInsurance = async (
  data: Partial<CarInsurance>
): Promise<CarInsurance> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to add insurance record');
  return res.json();
};

// Delete insurance policy
export const deleteCarInsurance = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to delete insurance');
};
