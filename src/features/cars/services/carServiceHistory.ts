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
  const result = await res.json();
  return result.data || result;
};

// Get all service entries for a car
export const getLatestServiceRecord = async (
  carId: string
): Promise<CarServiceHistory> => {
  const res = await fetch(`${BASE_URL}${carId}/latest`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to load service history');
  const result = await res.json();
  return result.data || result;
};

// Get remaining km until next service
export const getServiceRemainingKm = async (carId: string): Promise<number> => {
  const res = await fetch(`${BASE_URL}${carId}/km-remaining`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to load remaining km');

  const result = await res.json();
  return result.data?.kmRemaining ?? 0;
};

// Add service record
export const addCarServiceRecord = async (
  data: Partial<CarServiceHistory>
): Promise<CarServiceHistory> => {
  const res = await fetch(BASE_URL + `/${data.carId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to add service record');
  const result = await res.json();
  return result.data || result;
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
  const result = await res.json();
  return result.data || result;
};

// Delete service record
export const deleteCarServiceRecord = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}record/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to delete service record');
};

// Get audit logs for a specific service record
export async function getServiceHistoryAuditLogs(
  serviceId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const res = await fetch(
    `${BASE_URL}record/${encodeURIComponent(serviceId)}/audit-logs?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );

  if (!res.ok) throw new Error('Failed to fetch audit logs');
  const result = await res.json();
  // Backend returns { success, data: { logs, pagination } }
  // Transform to { success, data: logs, pagination }
  return {
    success: result.success,
    data: result.data?.logs || [],
    pagination: result.data?.pagination,
  };
}
