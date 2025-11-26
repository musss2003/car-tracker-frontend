import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import { CarRegistration } from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_URL = `${API_URL}car-registration/`;

// Get all registration records for a car
export const getCarRegistrations = async (
  carId: string
): Promise<CarRegistration[]> => {
  const res = await fetch(`${BASE_URL}${carId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch registration history');
  return res.json();
};

// PUT update existing registration by id
export const updateCarRegistration = async (id: string, data: Partial<CarRegistration>): Promise<CarRegistration> => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update registration');
  return res.json();
};

// Add registration record
export const addCarRegistration = async (
  data: Partial<CarRegistration>
): Promise<CarRegistration> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to add registration');
  return res.json();
};

// Delete registration record
export const deleteCarRegistration = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to delete registration record');
};
