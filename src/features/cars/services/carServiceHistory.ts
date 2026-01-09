import {
  api,
  encodePathParam,
  buildQueryString,
} from '@/shared/utils/apiService';
import { CarServiceHistory } from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_URL = `${API_URL}car-service-history/`;

// Get all service entries for a car
export const getCarServiceHistory = async (
  carId: string
): Promise<CarServiceHistory[]> => {
  return api.get<CarServiceHistory[]>(
    `/car-service-history/${encodePathParam(carId)}`,
    'car service history',
    carId
  );
};

// Get all service entries for a car
export const getLatestServiceRecord = async (
  carId: string
): Promise<CarServiceHistory> => {
  return api.get<CarServiceHistory>(
    `/car-service-history/${encodePathParam(carId)}/latest`,
    'car service history',
    carId
  );
};

// Get remaining km until next service
export const getServiceRemainingKm = async (carId: string): Promise<number> => {
  const result = await api.get<{ kmRemaining: number }>(
    `/car-service-history/${encodePathParam(carId)}/km-remaining`,
    'service km remaining',
    carId
  );
  return result.kmRemaining ?? 0;
};

// Add service record
export const addCarServiceRecord = async (
  data: Partial<CarServiceHistory>
): Promise<CarServiceHistory> => {
  return api.post<CarServiceHistory>(
    `/car-service-history/${encodePathParam(data.carId!)}`,
    data,
    'car service history'
  );
};

// PUT update a service record (route: PUT /record/:id)
export const updateServiceRecord = async (
  id: string,
  data: Partial<CarServiceHistory>
): Promise<CarServiceHistory> => {
  return api.put<CarServiceHistory>(
    `/car-service-history/record/${encodePathParam(id)}`,
    data,
    'car service history',
    id
  );
};

// Delete service record
export const deleteCarServiceRecord = async (id: string): Promise<void> => {
  await api.delete<void>(
    `/car-service-history/record/${encodePathParam(id)}`,
    'car service history',
    id
  );
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
  const queryString = buildQueryString({ page, limit });
  const result = await api.get<{
    success: boolean;
    data: { logs: any[]; pagination: any };
  }>(
    `/car-service-history/record/${encodePathParam(serviceId)}/audit-logs${queryString}`,
    'service history audit logs',
    serviceId
  );

  return {
    success: result.success,
    data: result.data?.logs || [],
    pagination: result.data?.pagination,
  };
}
