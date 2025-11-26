import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import { CarServiceHistory } from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_URL = `${API_URL}car-service-history/`;

// Get all service entries for a car
export const getCarServiceHistory = async (
  carId: string
): Promise<CarServiceHistory[]> => {
  const res = await fetch(`${BASE_URL}${carId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to load service history');
  return res.json();
};

// Add service record
export const addCarServiceRecord = async (
  data: Partial<CarServiceHistory>
): Promise<CarServiceHistory> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to add service record');
  return res.json();
};

// PUT update a service record (route: PUT /record/:id)
export const updateServiceRecord = async (
  id: string,
  data: Partial<CarServiceHistory>
): Promise<CarServiceHistory> => {
  const res = await fetch(`${BASE_URL}record/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update service record');
  return res.json();
};

// Delete service record
export const deleteCarServiceRecord = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to delete service record');
};
