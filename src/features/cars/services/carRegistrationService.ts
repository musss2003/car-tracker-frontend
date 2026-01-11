import {
  api,
  encodePathParam,
  buildQueryString,
} from '@/shared/utils/apiService';
import { CarRegistration } from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_URL = `${API_URL}car-registration/`;

// Get all registration records for a car
export const getCarRegistrationById = async (
  carId: string
): Promise<CarRegistration[]> => {
  return api.get<CarRegistration[]>(
    `/api/car-registration/${encodePathParam(carId)}`,
    'car registration',
    carId
  );
};

// Get all registration records for a car
export const getCarRegistrations = async (
  carId: string
): Promise<CarRegistration[]> => {
  return api.get<CarRegistration[]>(
    `/api/car-registration/car/${encodePathParam(carId)}`,
    'car registration',
    carId
  );
};

// Get all registration records for a car
export const getLatestCarRegistration = async (
  carId: string
): Promise<CarRegistration> => {
  return api.get<CarRegistration>(
    `/api/car-registration/car/${encodePathParam(carId)}/latest`,
    'car registration',
    carId
  );
};

export const getRegistrationDaysRemaining = async (
  carId: string
): Promise<number> => {
  const result = await api.get<{ daysRemaining: number }>(
    `/api/car-registration/car/${encodePathParam(carId)}/days-remaining`,
    'registration days remaining',
    carId
  );
  return result.daysRemaining ?? 0;
};

// PUT update existing registration by id
export const updateCarRegistration = async (
  id: string,
  data: Partial<CarRegistration>
): Promise<CarRegistration> => {
  return api.put<CarRegistration>(
    `/api/car-registration/${encodePathParam(id)}`,
    data,
    'car registration',
    id
  );
};

// Add registration record
export const addCarRegistration = async (
  data: Partial<CarRegistration>
): Promise<CarRegistration> => {
  return api.post<CarRegistration>(
    '/api/car-registration',
    data,
    'car registration'
  );
};

// Delete registration record
export const deleteCarRegistration = async (id: string): Promise<void> => {
  await api.delete<void>(
    `/api/car-registration/${encodePathParam(id)}`,
    'car registration',
    id
  );
};

// Get audit logs for a specific registration record
export async function getRegistrationAuditLogs(
  registrationId: string,
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
    `/api/car-registration/${encodePathParam(registrationId)}/audit-logs${queryString}`,
    'registration audit logs',
    registrationId
  );

  return {
    success: result.success,
    data: result.data?.logs || [],
    pagination: result.data?.pagination,
  };
}
