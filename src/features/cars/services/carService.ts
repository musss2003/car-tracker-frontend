import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import {
  handleServiceError,
  handleNetworkError,
  logError,
} from '@/shared/utils/errorHandler';
import {
  validateId,
  validateLicensePlate,
} from '@/shared/utils/inputValidator';
import {
  BookingEvent,
  Car,
  CarBrand,
  CarRegistration,
} from '../types/car.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

export const getCar = async (carId: string): Promise<Car> => {
  try {
    validateId(carId, 'car id');

    const response = await fetch(`${API_URL}cars/${carId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      await handleServiceError(response, {
        operation: 'retrieve',
        resource: 'car',
        resourceId: carId,
      });
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      handleNetworkError(error, {
        operation: 'retrieve',
        resource: 'car',
        resourceId: carId,
      });
    }
    if (error instanceof Error) {
      logError(error, { operation: 'getCar', carId });
    }
    throw error;
  }
};

export const getCars = async (): Promise<Car[]> => {
  try {
    const response = await fetch(`${API_URL}cars`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      await handleServiceError(response, {
        operation: 'list',
        resource: 'cars',
      });
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      handleNetworkError(error, {
        operation: 'list',
        resource: 'cars',
      });
    }
    if (error instanceof Error) {
      logError(error, { operation: 'getCars' });
    }
    throw error;
  }
};

export const updateCar = async (
  licensePlate: string,
  car: Car
): Promise<Car> => {
  try {
    validateLicensePlate(licensePlate);

    const response = await fetch(`${API_URL}cars/${licensePlate}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(car),
      credentials: 'include',
    });

    if (!response.ok) {
      await handleServiceError(response, {
        operation: 'update',
        resource: 'car',
        resourceId: licensePlate,
      });
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      handleNetworkError(error, {
        operation: 'update',
        resource: 'car',
        resourceId: licensePlate,
      });
    }
    if (error instanceof Error) {
      logError(error, { operation: 'updateCar', licensePlate });
    }
    throw error;
  }
};

export const deleteCar = async (
  licensePlate: string
): Promise<{ message: string }> => {
  try {
    validateLicensePlate(licensePlate);

    const response = await fetch(`${API_URL}cars/${licensePlate}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      await handleServiceError(response, {
        operation: 'delete',
        resource: 'car',
        resourceId: licensePlate,
      });
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      handleNetworkError(error, {
        operation: 'delete',
        resource: 'car',
        resourceId: licensePlate,
      });
    }
    if (error instanceof Error) {
      logError(error, { operation: 'deleteCar', licensePlate });
    }
    throw error;
  }
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
