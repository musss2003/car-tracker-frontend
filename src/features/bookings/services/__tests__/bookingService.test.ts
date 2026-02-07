import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/utils/apiService';
import { bookingService } from '../bookingService';
import type {
  Booking,
  BookingStatus,
  CreateBookingDto,
  UpdateBookingDto,
} from '../../types/booking.types';
import type { PaginatedResponse, AvailabilityResponse } from '../bookingService';

// Mock dependencies
vi.mock('@/shared/utils/apiService', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  buildQueryString: vi.fn((params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }),
  encodePathParam: vi.fn((param) => param),
}));

vi.mock('@/shared/utils/inputValidator', () => ({
  validateId: vi.fn(),
}));

describe('Booking Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== CRUD Operations ====================

  describe('getAllBookings', () => {
    it('should fetch all bookings without filters', async () => {
      const mockResponse: PaginatedResponse<Booking> = {
        data: [
          {
            id: 'booking-1',
            bookingReference: 'BK-2024-001',
            status: 'pending',
            customer: {
              id: 'cust-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '1234567890',
              licenseNumber: 'DL123456',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            car: {
              id: 'car-1',
              licensePlate: 'ABC-123',
              manufacturer: 'Toyota',
              model: 'Camry',
              year: 2020,
              color: 'White',
              mileage: 50000,
              fuelType: 'petrol',
              transmission: 'automatic',
              pricePerDay: 50,
              category: 'economy',
              status: 'available',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-03-05'),
            totalPrice: 250,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01'),
            expiresAt: new Date('2024-02-08'),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await bookingService.getAllBookings();

      expect(api.get).toHaveBeenCalledWith('/api/bookings', 'bookings');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch bookings with query parameters', async () => {
      const mockResponse: PaginatedResponse<Booking> = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      await bookingService.getAllBookings({
        page: 1,
        limit: 20,
        status: 'confirmed',
        customerId: 'cust-123',
      });

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings?page=1&limit=20&status=confirmed&customerId=cust-123',
        'bookings'
      );
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(bookingService.getAllBookings()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getBookingById', () => {
    it('should fetch a single booking by ID', async () => {
      const mockBooking: Booking = {
        id: 'booking-123',
        bookingReference: 'BK-2024-001',
        status: 'confirmed',
        customer: {
          id: 'cust-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          licenseNumber: 'DL123456',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        car: {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          fuelType: 'petrol',
          transmission: 'automatic',
          pricePerDay: 50,
          category: 'economy',
          status: 'available',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        totalPrice: 250,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        confirmedAt: new Date('2024-02-02'),
      };

      vi.mocked(api.get).mockResolvedValue(mockBooking);

      const result = await bookingService.getBookingById('booking-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings/booking-123',
        'booking',
        'booking-123'
      );
      expect(result).toEqual(mockBooking);
    });

    it('should validate booking ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      await bookingService.getBookingById('booking-123');

      expect(validateId).toHaveBeenCalledWith('booking-123', 'booking id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Booking not found'));

      await expect(
        bookingService.getBookingById('booking-123')
      ).rejects.toThrow('Booking not found');
    });
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const createData: CreateBookingDto = {
        customerId: 'cust-123',
        carId: 'car-456',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        extras: [],
      };

      const mockBooking: Booking = {
        id: 'booking-new',
        bookingReference: 'BK-2024-002',
        status: 'pending',
        customer: {
          id: 'cust-123',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '0987654321',
          licenseNumber: 'DL789012',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        car: {
          id: 'car-456',
          licensePlate: 'XYZ-789',
          manufacturer: 'Honda',
          model: 'Civic',
          year: 2021,
          color: 'Black',
          mileage: 30000,
          fuelType: 'petrol',
          transmission: 'automatic',
          pricePerDay: 60,
          category: 'economy',
          status: 'available',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        totalPrice: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date('2024-02-15'),
      };

      vi.mocked(api.post).mockResolvedValue(mockBooking);

      const result = await bookingService.createBooking(createData);

      expect(api.post).toHaveBeenCalledWith(
        '/api/bookings',
        createData,
        'booking'
      );
      expect(result).toEqual(mockBooking);
    });

    it('should validate customer and car IDs', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');
      const createData: CreateBookingDto = {
        customerId: 'cust-123',
        carId: 'car-456',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        extras: [],
      };

      vi.mocked(api.post).mockResolvedValue({} as Booking);

      await bookingService.createBooking(createData);

      expect(validateId).toHaveBeenCalledWith('cust-123', 'customer id');
      expect(validateId).toHaveBeenCalledWith('car-456', 'car id');
    });

    it('should handle API errors', async () => {
      const createData: CreateBookingDto = {
        customerId: 'cust-123',
        carId: 'car-456',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        extras: [],
      };

      vi.mocked(api.post).mockRejectedValue(
        new Error('Car not available')
      );

      await expect(bookingService.createBooking(createData)).rejects.toThrow(
        'Car not available'
      );
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      const updateData: UpdateBookingDto = {
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-03-15'),
        extras: [{ type: 'GPS', quantity: 1 }],
      };

      const mockBooking: Booking = {
        id: 'booking-123',
        bookingReference: 'BK-2024-001',
        status: 'pending',
        customer: {
          id: 'cust-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          licenseNumber: 'DL123456',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        car: {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          fuelType: 'petrol',
          transmission: 'automatic',
          pricePerDay: 50,
          category: 'economy',
          status: 'available',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-03-15'),
        totalPrice: 300,
        extras: [{ type: 'GPS', quantity: 1 }],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        expiresAt: new Date('2024-02-15'),
      };

      vi.mocked(api.put).mockResolvedValue(mockBooking);

      const result = await bookingService.updateBooking(
        'booking-123',
        updateData
      );

      expect(api.put).toHaveBeenCalledWith(
        '/api/bookings/booking-123',
        updateData,
        'booking',
        'booking-123'
      );
      expect(result).toEqual(mockBooking);
    });

    it('should validate booking ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');
      const updateData: UpdateBookingDto = {};

      vi.mocked(api.put).mockResolvedValue({} as Booking);

      await bookingService.updateBooking('booking-123', updateData);

      expect(validateId).toHaveBeenCalledWith('booking-123', 'booking id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.put).mockRejectedValue(new Error('Update failed'));

      await expect(
        bookingService.updateBooking('booking-123', {})
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      const mockResponse = { message: 'Booking deleted successfully' };

      vi.mocked(api.delete).mockResolvedValue(mockResponse);

      const result = await bookingService.deleteBooking('booking-123');

      expect(api.delete).toHaveBeenCalledWith(
        '/api/bookings/booking-123',
        'booking',
        'booking-123'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should validate booking ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      vi.mocked(api.delete).mockResolvedValue({ message: 'Deleted' });

      await bookingService.deleteBooking('booking-123');

      expect(validateId).toHaveBeenCalledWith('booking-123', 'booking id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.delete).mockRejectedValue(
        new Error('Deletion failed')
      );

      await expect(
        bookingService.deleteBooking('booking-123')
      ).rejects.toThrow('Deletion failed');
    });
  });

  // ==================== Specialized Operations ====================

  describe('confirmBooking', () => {
    it('should confirm a booking', async () => {
      const mockBooking: Booking = {
        id: 'booking-123',
        bookingReference: 'BK-2024-001',
        status: 'confirmed',
        customer: {
          id: 'cust-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          licenseNumber: 'DL123456',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        car: {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          fuelType: 'petrol',
          transmission: 'automatic',
          pricePerDay: 50,
          category: 'economy',
          status: 'available',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        totalPrice: 250,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        confirmedAt: new Date(),
      };

      vi.mocked(api.post).mockResolvedValue(mockBooking);

      const result = await bookingService.confirmBooking('booking-123');

      expect(api.post).toHaveBeenCalledWith(
        '/api/bookings/booking-123/confirm',
        {},
        'booking',
        'booking-123'
      );
      expect(result).toEqual(mockBooking);
    });

    it('should validate booking ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      vi.mocked(api.post).mockResolvedValue({} as Booking);

      await bookingService.confirmBooking('booking-123');

      expect(validateId).toHaveBeenCalledWith('booking-123', 'booking id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.post).mockRejectedValue(
        new Error('Confirmation failed')
      );

      await expect(
        bookingService.confirmBooking('booking-123')
      ).rejects.toThrow('Confirmation failed');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking with reason', async () => {
      const mockBooking: Booking = {
        id: 'booking-123',
        bookingReference: 'BK-2024-001',
        status: 'cancelled',
        customer: {
          id: 'cust-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          licenseNumber: 'DL123456',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        car: {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          fuelType: 'petrol',
          transmission: 'automatic',
          pricePerDay: 50,
          category: 'economy',
          status: 'available',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        totalPrice: 250,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        cancelledAt: new Date(),
        cancellationReason: 'Customer request',
      };

      vi.mocked(api.post).mockResolvedValue(mockBooking);

      const result = await bookingService.cancelBooking(
        'booking-123',
        'Customer request'
      );

      expect(api.post).toHaveBeenCalledWith(
        '/api/bookings/booking-123/cancel',
        { reason: 'Customer request' },
        'booking',
        'booking-123'
      );
      expect(result).toEqual(mockBooking);
    });

    it('should validate booking ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      vi.mocked(api.post).mockResolvedValue({} as Booking);

      await bookingService.cancelBooking('booking-123', 'Test reason');

      expect(validateId).toHaveBeenCalledWith('booking-123', 'booking id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.post).mockRejectedValue(
        new Error('Cancellation failed')
      );

      await expect(
        bookingService.cancelBooking('booking-123', 'Test reason')
      ).rejects.toThrow('Cancellation failed');
    });
  });

  describe('convertToContract', () => {
    it('should convert a booking to a contract', async () => {
      const mockBooking: Booking = {
        id: 'booking-123',
        bookingReference: 'BK-2024-001',
        status: 'converted',
        customer: {
          id: 'cust-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          licenseNumber: 'DL123456',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        car: {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          fuelType: 'petrol',
          transmission: 'automatic',
          pricePerDay: 50,
          category: 'economy',
          status: 'available',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        totalPrice: 250,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        convertedAt: new Date(),
        contractId: 'contract-789',
      };

      vi.mocked(api.post).mockResolvedValue(mockBooking);

      const result = await bookingService.convertToContract('booking-123');

      expect(api.post).toHaveBeenCalledWith(
        '/api/bookings/booking-123/convert',
        {},
        'booking',
        'booking-123'
      );
      expect(result).toEqual(mockBooking);
    });

    it('should validate booking ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      vi.mocked(api.post).mockResolvedValue({} as Booking);

      await bookingService.convertToContract('booking-123');

      expect(validateId).toHaveBeenCalledWith('booking-123', 'booking id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.post).mockRejectedValue(
        new Error('Conversion failed')
      );

      await expect(
        bookingService.convertToContract('booking-123')
      ).rejects.toThrow('Conversion failed');
    });
  });

  // ==================== Query Operations ====================

  describe('getBookingsByCustomer', () => {
    it('should fetch bookings for a specific customer', async () => {
      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          bookingReference: 'BK-2024-001',
          status: 'confirmed',
          customer: {
            id: 'cust-123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            licenseNumber: 'DL123456',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          car: {
            id: 'car-1',
            licensePlate: 'ABC-123',
            manufacturer: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            mileage: 50000,
            fuelType: 'petrol',
            transmission: 'automatic',
            pricePerDay: 50,
            category: 'economy',
            status: 'available',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-05'),
          totalPrice: 250,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          confirmedAt: new Date('2024-02-02'),
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockBookings);

      const result = await bookingService.getBookingsByCustomer('cust-123');

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings/customer/cust-123',
        'customer bookings',
        'cust-123'
      );
      expect(result).toEqual(mockBookings);
    });

    it('should validate customer ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      vi.mocked(api.get).mockResolvedValue([]);

      await bookingService.getBookingsByCustomer('cust-123');

      expect(validateId).toHaveBeenCalledWith('cust-123', 'customer id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'));

      await expect(
        bookingService.getBookingsByCustomer('cust-123')
      ).rejects.toThrow('Fetch failed');
    });
  });

  describe('getBookingsByCar', () => {
    it('should fetch bookings for a specific car', async () => {
      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          bookingReference: 'BK-2024-001',
          status: 'confirmed',
          customer: {
            id: 'cust-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            licenseNumber: 'DL123456',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          car: {
            id: 'car-456',
            licensePlate: 'XYZ-789',
            manufacturer: 'Honda',
            model: 'Civic',
            year: 2021,
            color: 'Black',
            mileage: 30000,
            fuelType: 'petrol',
            transmission: 'automatic',
            pricePerDay: 60,
            category: 'economy',
            status: 'available',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-05'),
          totalPrice: 300,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          confirmedAt: new Date('2024-02-02'),
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockBookings);

      const result = await bookingService.getBookingsByCar('car-456');

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings/car/car-456',
        'car bookings',
        'car-456'
      );
      expect(result).toEqual(mockBookings);
    });

    it('should validate car ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      vi.mocked(api.get).mockResolvedValue([]);

      await bookingService.getBookingsByCar('car-456');

      expect(validateId).toHaveBeenCalledWith('car-456', 'car id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'));

      await expect(
        bookingService.getBookingsByCar('car-456')
      ).rejects.toThrow('Fetch failed');
    });
  });

  describe('checkAvailability', () => {
    it('should check if a car is available', async () => {
      const mockResponse: AvailabilityResponse = {
        available: true,
        message: 'Car is available for the selected dates',
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await bookingService.checkAvailability(
        'car-123',
        '2024-03-01',
        '2024-03-05'
      );

      expect(api.post).toHaveBeenCalledWith(
        '/api/bookings/check-availability',
        {
          carId: 'car-123',
          startDate: '2024-03-01',
          endDate: '2024-03-05',
        },
        'availability check'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return conflicting bookings when not available', async () => {
      const mockResponse: AvailabilityResponse = {
        available: false,
        conflictingBookings: [
          {
            id: 'booking-conflict',
            bookingReference: 'BK-2024-999',
            status: 'confirmed',
            customer: {
              id: 'cust-1',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              phone: '0987654321',
              licenseNumber: 'DL789012',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            car: {
              id: 'car-123',
              licensePlate: 'ABC-123',
              manufacturer: 'Toyota',
              model: 'Camry',
              year: 2020,
              color: 'White',
              mileage: 50000,
              fuelType: 'petrol',
              transmission: 'automatic',
              pricePerDay: 50,
              category: 'economy',
              status: 'available',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            startDate: new Date('2024-03-03'),
            endDate: new Date('2024-03-07'),
            totalPrice: 250,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01'),
            confirmedAt: new Date('2024-02-02'),
          },
        ],
        message: 'Car is not available for the selected dates',
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await bookingService.checkAvailability(
        'car-123',
        '2024-03-01',
        '2024-03-05'
      );

      expect(result.available).toBe(false);
      expect(result.conflictingBookings).toHaveLength(1);
    });

    it('should validate car ID', async () => {
      const { validateId } = await import('@/shared/utils/inputValidator');

      vi.mocked(api.post).mockResolvedValue({ available: true });

      await bookingService.checkAvailability(
        'car-123',
        '2024-03-01',
        '2024-03-05'
      );

      expect(validateId).toHaveBeenCalledWith('car-123', 'car id');
    });

    it('should handle API errors', async () => {
      vi.mocked(api.post).mockRejectedValue(
        new Error('Availability check failed')
      );

      await expect(
        bookingService.checkAvailability('car-123', '2024-03-01', '2024-03-05')
      ).rejects.toThrow('Availability check failed');
    });
  });

  describe('getUpcomingBookings', () => {
    it('should fetch upcoming bookings', async () => {
      const mockBookings: Booking[] = [
        {
          id: 'booking-upcoming',
          bookingReference: 'BK-2024-002',
          status: 'confirmed',
          customer: {
            id: 'cust-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            licenseNumber: 'DL123456',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          car: {
            id: 'car-1',
            licensePlate: 'ABC-123',
            manufacturer: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            mileage: 50000,
            fuelType: 'petrol',
            transmission: 'automatic',
            pricePerDay: 50,
            category: 'economy',
            status: 'available',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-20'),
          totalPrice: 300,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          confirmedAt: new Date('2024-02-02'),
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockBookings);

      const result = await bookingService.getUpcomingBookings();

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings/upcoming',
        'upcoming bookings'
      );
      expect(result).toEqual(mockBookings);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'));

      await expect(bookingService.getUpcomingBookings()).rejects.toThrow(
        'Fetch failed'
      );
    });
  });

  describe('getExpiringBookings', () => {
    it('should fetch expiring bookings', async () => {
      const mockBookings: Booking[] = [
        {
          id: 'booking-expiring',
          bookingReference: 'BK-2024-003',
          status: 'pending',
          customer: {
            id: 'cust-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            licenseNumber: 'DL123456',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          car: {
            id: 'car-1',
            licensePlate: 'ABC-123',
            manufacturer: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            mileage: 50000,
            fuelType: 'petrol',
            transmission: 'automatic',
            pricePerDay: 50,
            category: 'economy',
            status: 'available',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-05'),
          totalPrice: 250,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          expiresAt: new Date('2024-02-08'),
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockBookings);

      const result = await bookingService.getExpiringBookings();

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings/expiring',
        'expiring bookings'
      );
      expect(result).toEqual(mockBookings);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'));

      await expect(bookingService.getExpiringBookings()).rejects.toThrow(
        'Fetch failed'
      );
    });
  });

  describe('getBookingsByStatus', () => {
    it('should fetch bookings by status string', async () => {
      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          bookingReference: 'BK-2024-001',
          status: 'confirmed',
          customer: {
            id: 'cust-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            licenseNumber: 'DL123456',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          car: {
            id: 'car-1',
            licensePlate: 'ABC-123',
            manufacturer: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            mileage: 50000,
            fuelType: 'petrol',
            transmission: 'automatic',
            pricePerDay: 50,
            category: 'economy',
            status: 'available',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-05'),
          totalPrice: 250,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          confirmedAt: new Date('2024-02-02'),
        },
      ];

      vi.mocked(api.get).mockResolvedValue(mockBookings);

      const result = await bookingService.getBookingsByStatus('confirmed');

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings?status=confirmed',
        'bookings by status'
      );
      expect(result).toEqual(mockBookings);
    });

    it('should fetch bookings by BookingStatus enum', async () => {
      vi.mocked(api.get).mockResolvedValue([]);

      await bookingService.getBookingsByStatus('pending' as BookingStatus);

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings?status=pending',
        'bookings by status'
      );
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'));

      await expect(
        bookingService.getBookingsByStatus('confirmed')
      ).rejects.toThrow('Fetch failed');
    });
  });

  describe('searchByReference', () => {
    it('should search for a booking by reference', async () => {
      const mockBooking: Booking = {
        id: 'booking-123',
        bookingReference: 'BK-2024-001',
        status: 'confirmed',
        customer: {
          id: 'cust-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          licenseNumber: 'DL123456',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        car: {
          id: 'car-1',
          licensePlate: 'ABC-123',
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          mileage: 50000,
          fuelType: 'petrol',
          transmission: 'automatic',
          pricePerDay: 50,
          category: 'economy',
          status: 'available',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        totalPrice: 250,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        confirmedAt: new Date('2024-02-02'),
      };

      vi.mocked(api.get).mockResolvedValue(mockBooking);

      const result = await bookingService.searchByReference('BK-2024-001');

      expect(api.get).toHaveBeenCalledWith(
        '/api/bookings/search/BK-2024-001',
        'booking search',
        'BK-2024-001'
      );
      expect(result).toEqual(mockBooking);
    });

    it('should return null when booking not found', async () => {
      vi.mocked(api.get).mockResolvedValue(null);

      const result = await bookingService.searchByReference('BK-9999-999');

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Search failed'));

      await expect(
        bookingService.searchByReference('BK-2024-001')
      ).rejects.toThrow('Search failed');
    });
  });
});
