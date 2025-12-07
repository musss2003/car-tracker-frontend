import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import {
  BookingEvent,
  Car,
  CarBrand,
  CarRegistration,
} from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

export const getCar = async (carId: string): Promise<Car> => {
  const response = await fetch(`${API_URL}cars/${carId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok)
    throw new Error(`Error getting car: ${response.statusText}`);
  const result = await response.json();
  return result.data || result;
};

export const getCars = async (): Promise<Car[]> => {
  const response = await fetch(`${API_URL}cars`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok)
    throw new Error(`Error getting all cars: ${response.statusText}`);
  const result = await response.json();
  return result.data || result;
};

export const updateCar = async (
  licensePlate: string,
  car: Car
): Promise<Car> => {
  const response = await fetch(`${API_URL}cars/${licensePlate}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
    credentials: 'include',
  });

  if (!response.ok)
    throw new Error(`Error updating car: ${response.statusText}`);
  const result = await response.json();
  return result.data || result;
};

export const deleteCar = async (
  licensePlate: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}cars/${licensePlate}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok)
    throw new Error(`Error deleting car: ${response.statusText}`);
  const result = await response.json();
  return result.data || result;
};

export const addCar = async (car: Car): Promise<Car> => {
  const response = await fetch(`${API_URL}cars`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
    credentials: 'include',
  });

  if (!response.ok) throw new Error(`Error adding car: ${response.statusText}`);
  const result = await response.json();
  return result.data || result;
};

export const getAvailableCarsForPeriod = async (
  startingDate: string,
  endingDate: string
): Promise<Car[]> => {
  const response = await fetch(`${API_URL}cars/available`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ startingDate, endingDate }),
    credentials: 'include',
  });

  if (!response.ok)
    throw new Error(`Error fetching available cars: ${response.statusText}`);
  const result = await response.json();
  return result.data || result;
};

export const getCarAvailability = async (
  licensePlate: string
): Promise<BookingEvent[]> => {
  const response = await fetch(`${API_URL}cars/${licensePlate}/availability`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok)
    throw new Error(`Error fetching car availability: ${response.statusText}`);

  const result = await response.json();
  return result.data || result;
};

export async function fetchCarBrands(): Promise<CarBrand[]> {
  const res = await fetch('/car_brands.json');
  if (!res.ok) throw new Error('Failed to fetch car brands');
  return res.json();
}
