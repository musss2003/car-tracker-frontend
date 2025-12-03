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

// Get the lates insurance record for a car
export const getLatestCarInsuranceRecord = async (
  carId: string
): Promise<CarInsurance> => {
  const res = await fetch(`${BASE_URL}${carId}/latest`, {
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

// PUT update insurance record (route PUT /record/:id)
export const updateCarInsurance = async (
  id: string,
  data: Partial<CarInsurance>
): Promise<CarInsurance> => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update insurance record');
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

// Get audit logs for a specific insurance record
export async function getInsuranceAuditLogs(
  insuranceId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  success: boolean;
  data: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await fetch(
    `${BASE_URL}record/${encodeURIComponent(insuranceId)}/audit-logs?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );

  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
