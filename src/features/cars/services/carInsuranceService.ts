import {
  api,
  encodePathParam,
  buildQueryString,
} from '@/shared/utils/apiService';
import { CarInsurance } from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_URL = `${API_URL}car-insurance/`;

// Get all insurance records for a car
export const getCarInsuranceHistory = async (
  carId: string
): Promise<CarInsurance[]> => {
  return api.get<CarInsurance[]>(
    `/car-insurance/${encodePathParam(carId)}`,
    'car insurance',
    carId
  );
};

// Get the lates insurance record for a car
export const getLatestCarInsuranceRecord = async (
  carId: string
): Promise<CarInsurance> => {
  return api.get<CarInsurance>(
    `/car-insurance/${encodePathParam(carId)}/latest`,
    'car insurance',
    carId
  );
};

// Add insurance policy
export const addCarInsurance = async (
  data: Partial<CarInsurance>
): Promise<CarInsurance> => {
  return api.post<CarInsurance>(
    `/car-insurance/${encodePathParam(data.carId!)}`,
    data,
    'car insurance'
  );
};

// PUT update insurance record (route PUT /record/:id)
export const updateCarInsurance = async (
  id: string,
  data: Partial<CarInsurance>
): Promise<CarInsurance> => {
  return api.put<CarInsurance>(
    `/car-insurance/record/${encodePathParam(id)}`,
    data,
    'car insurance',
    id
  );
};

// Delete insurance policy
export const deleteCarInsurance = async (id: string): Promise<void> => {
  await api.delete<void>(
    `/car-insurance/record/${encodePathParam(id)}`,
    'car insurance',
    id
  );
};

// Get audit logs for a specific insurance record
export async function getInsuranceAuditLogs(
  insuranceId: string,
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
    `/car-insurance/record/${encodePathParam(insuranceId)}/audit-logs${queryString}`,
    'insurance audit logs',
    insuranceId
  );

  return {
    success: result.success,
    data: result.data?.logs || [],
    pagination: result.data?.pagination,
  };
}
