import { api, encodePathParam } from '@/shared/utils/apiService';
import {
  validateId,
  validateLicensePlate,
} from '@/shared/utils/inputValidator';
import { BookingEvent, Car, CarBrand } from '../types/car.types';

export const getCar = async (carId: string): Promise<Car> => {
  validateId(carId, 'car id');
  return api.get<Car>(`/api/cars/${encodePathParam(carId)}`, 'car', carId);
};

export const getCars = async (): Promise<Car[]> => {
  return api.get<Car[]>('/api/cars', 'cars');
};

export const updateCar = async (
  licensePlate: string,
  car: Omit<Car, 'createdAt'>
): Promise<Car> => {
  validateLicensePlate(licensePlate);
  return api.put<Car>(
    `/cars/${encodePathParam(licensePlate)}`,
    car,
    'car',
    licensePlate
  );
};

export const deleteCar = async (
  licensePlate: string
): Promise<{ message: string }> => {
  validateLicensePlate(licensePlate);
  return api.delete<{ message: string }>(
    `/api/cars/${encodePathParam(licensePlate)}`,
    'car',
    licensePlate
  );
};

export const addCar = async (car: Car): Promise<Car> => {
  return api.post<Car>('/api/cars', car, 'car');
};

export const getAvailableCarsForPeriod = async (
  startingDate: string,
  endingDate: string
): Promise<Car[]> => {
  if (isNaN(Date.parse(startingDate)) || isNaN(Date.parse(endingDate))) {
    throw new Error('Invalid date format for available cars query');
  }

  return api.post<Car[]>(
    '/api/cars/available-period',
    {
      startingDate,
      endingDate,
    },
    'available cars'
  );
};

export const getCarAvailability = async (
  licensePlate: string
): Promise<BookingEvent[]> => {
  return api.get<BookingEvent[]>(
    `/api/cars/${encodePathParam(licensePlate)}/availability`,
    'car availability',
    licensePlate
  );
};

export async function fetchCarBrands(): Promise<CarBrand[]> {
  // Use explicit origin and validate response
  const res = await fetch(
    new URL('/car_brands.json', window.location.origin).href
  );
  if (!res.ok) throw new Error('Failed to fetch car brands');

  // Validate Content-Type to prevent data poisoning
  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('Invalid content type for car brands data');
  }

  const data = await res.json();

  // Basic schema validation to ensure data integrity
  if (!Array.isArray(data)) {
    throw new Error('Invalid car brands data format');
  }

  return data as CarBrand[];
}
