import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/utils/apiService';
import {
  getCar,
  getCars,
  updateCar,
  deleteCar,
  addCar,
  getAvailableCarsForPeriod,
  getCarAvailability,
  fetchCarBrands,
} from '../carService';
import { Car, BookingEvent, CarBrand } from '../../types/car.types';

// Mock dependencies
vi.mock('@/shared/utils/apiService', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  encodePathParam: vi.fn((param) => param),
}));
vi.mock('@/shared/utils/inputValidator', () => ({
  validateId: vi.fn(),
  validateLicensePlate: vi.fn(),
}));

describe('Car Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCar', () => {
    it('should fetch a single car by ID', async () => {
      const mockCar: Car = {
        id: 'car-123',
        licensePlate: 'ABC-123',
        manufacturer: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'White',
        mileage: 50000,
        customerId: 'customer-1',
        createdAt: '2024-01-01',
      };

      vi.mocked(api.get).mockResolvedValue(mockCar);

      const result = await getCar('car-123');

      expect(api.get).toHaveBeenCalledWith('/api/cars/car-123', 'car', 'car-123');
      expect(result).toEqual(mockCar);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(getCar('car-123')).rejects.toThrow('Network error');
    });
  });

  describe('getCars', () => {
    it('should fetch all cars', async () => {
      const mockCars: Car[] = [
        {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          customerId: 'customer-1',
          createdAt: '2024-01-01',
        },
        {
          id: 'car-2',
          licensePlate: 'XYZ-789',
          manufacturer: 'Honda',
          model: 'Civic',
          year: 2021,
          color: 'Black',
          mileage: 30000,
          customerId: 'customer-2',
          createdAt: '2024-01-02',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockCars);

      const result = await getCars();

      expect(api.get).toHaveBeenCalledWith('/api/cars', 'cars');
      expect(result).toEqual(mockCars);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateCar', () => {
    it('should update a car', async () => {
      const mockCar: Omit<Car, 'createdAt'> = {
        id: 'car-123',
        licensePlate: 'ABC-123',
        manufacturer: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Red',
        mileage: 55000,
        customerId: 'customer-1',
      };

      const updatedCar: Car = { ...mockCar, createdAt: '2024-01-01' };
      vi.mocked(api.put).mockResolvedValue(updatedCar);

      const result = await updateCar('ABC-123', mockCar);

      expect(api.put).toHaveBeenCalledWith('/cars/ABC-123', mockCar, 'car', 'ABC-123');
      expect(result).toEqual(updatedCar);
    });
  });

  describe('deleteCar', () => {
    it('should delete a car', async () => {
      const mockResponse = { message: 'Car deleted successfully' };
      vi.mocked(api.delete).mockResolvedValue(mockResponse);

      const result = await deleteCar('ABC-123');

      expect(api.delete).toHaveBeenCalledWith('/api/cars/ABC-123', 'car', 'ABC-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addCar', () => {
    it('should add a new car', async () => {
      const newCar: Car = {
        id: 'car-123',
        licensePlate: 'NEW-123',
        manufacturer: 'BMW',
        model: 'X5',
        year: 2023,
        color: 'Blue',
        mileage: 0,
        customerId: 'customer-1',
        createdAt: '2024-01-01',
      };

      vi.mocked(api.post).mockResolvedValue(newCar);

      const result = await addCar(newCar);

      expect(api.post).toHaveBeenCalledWith('/api/cars', newCar, 'car');
      expect(result).toEqual(newCar);
    });
  });

  describe('getAvailableCarsForPeriod', () => {
    it('should fetch available cars for a period', async () => {
      const mockCars: Car[] = [
        {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          customerId: 'customer-1',
          createdAt: '2024-01-01',
        },
      ];

      vi.mocked(api.post).mockResolvedValue(mockCars);

      const result = await getAvailableCarsForPeriod('2024-01-01', '2024-01-10');

      expect(api.post).toHaveBeenCalledWith(
        '/api/cars/available-period',
        { startingDate: '2024-01-01', endingDate: '2024-01-10' },
        'available cars'
      );
      expect(result).toEqual(mockCars);
    });

    it('should throw error for invalid date format', async () => {
      await expect(getAvailableCarsForPeriod('invalid-date', '2024-01-10')).rejects.toThrow(
        'Invalid date format for available cars query'
      );
    });
  });

  describe('getCarAvailability', () => {
    it('should fetch car availability', async () => {
      const mockEvents: BookingEvent[] = [
        {
          title: 'Booking 1',
          start: '2024-01-01',
          end: '2024-01-05',
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockEvents);

      const result = await getCarAvailability('ABC-123');

      expect(api.get).toHaveBeenCalledWith('/api/cars/ABC-123/availability', 'car availability', 'ABC-123');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('fetchCarBrands', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should fetch car brands from JSON file', async () => {
      const mockBrands: CarBrand[] = [
        { name: 'Toyota', models: ['Camry', 'Corolla'] },
        { name: 'Honda', models: ['Civic', 'Accord'] },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockBrands,
      });

      const result = await fetchCarBrands();

      expect(result).toEqual(mockBrands);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw error on fetch failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        headers: { get: () => 'application/json' },
      });

      await expect(fetchCarBrands()).rejects.toThrow('Failed to fetch car brands');
    });

    it('should throw error for invalid content type', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'text/html' },
        json: async () => [],
      });

      await expect(fetchCarBrands()).rejects.toThrow('Invalid content type for car brands data');
    });

    it('should throw error for non-array data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ invalid: 'data' }),
      });

      await expect(fetchCarBrands()).rejects.toThrow('Invalid car brands data format');
    });
  });
});
