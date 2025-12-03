import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import { CarRegistration } from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_URL = `${API_URL}car-registration/`;


// Get all registration records for a car
export const getCarRegistrationById = async (
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

// Get all registration records for a car
export const getCarRegistrations = async (
  carId: string
): Promise<CarRegistration[]> => {
  const res = await fetch(`${BASE_URL}car/${carId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch registration history');
  return res.json();
};

// Get all registration records for a car
export const getLatestCarRegistration = async (
  carId: string
): Promise<CarRegistration> => {
  const res = await fetch(`${BASE_URL}car/${carId}/latest`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch registration history');
  return res.json();
};

export const getRegistrationDaysRemaining = async (carId: string): Promise<number> => {
  const res = await fetch(`${BASE_URL}car/${carId}/registration-days-remaining`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch registration days remaining');

  const data = await res.json();

  if (typeof data === 'number') return data;
  if (data && typeof data === 'object' && 'daysRemaining' in data && typeof (data as any).daysRemaining === 'number') {
    return (data as any).daysRemaining;
  }

  throw new Error('Unexpected response format for registration days remaining');
};

// PUT update existing registration by id
export const updateCarRegistration = async (
  id: string,
  data: Partial<CarRegistration>
): Promise<CarRegistration> => {
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

// Get audit logs for a specific registration record
export async function getRegistrationAuditLogs(
  registrationId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  success: boolean;
  data: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await fetch(
    `${BASE_URL}${encodeURIComponent(registrationId)}/audit-logs?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );

  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
