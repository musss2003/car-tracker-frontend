import { api, encodePathParam } from '@/shared/utils/apiService';
import { validateId } from '@/shared/utils/inputValidator';
import { logError } from '@/shared/utils/logger';
import type {
  Booking,
  CreateBookingDto,
  UpdateBookingDto,
} from '../types/booking.types';

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  carId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AvailabilityResponse {
  available: boolean;
  conflictingBookings?: Booking[];
  message?: string;
}

export interface BookingResponse {
  booking: Booking;
  message?: string;
}

/**
 * Booking Service - Handles all booking-related API operations
 * Follows RESTful conventions and uses centralized error handling
 */
class BookingService {
  private readonly basePath = '/api/bookings';

  /**
   * Build query string from params object
   */
  private buildQueryString(params?: QueryParams): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  // ==================== CRUD Operations ====================

  /**
   * Get all bookings with optional filtering and pagination
   */
  async getAllBookings(
    params?: QueryParams
  ): Promise<PaginatedResponse<Booking>> {
    try {
      const queryString = this.buildQueryString(params);
      return await api.get<PaginatedResponse<Booking>>(
        `${this.basePath}${queryString}`,
        'bookings'
      );
    } catch (error) {
      logError('Error fetching bookings', error);
      throw error;
    }
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      validateId(id, 'booking id');
      return await api.get<Booking>(
        `${this.basePath}/${encodePathParam(id)}`,
        'booking',
        id
      );
    } catch (error) {
      logError('Error fetching booking', error);
      throw error;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    try {
      // Validate required fields
      if (!data.customerId || !data.carId || !data.startDate || !data.endDate) {
        throw new Error(
          'Missing required fields: customerId, carId, startDate, endDate'
        );
      }

      // Validate dates
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      if (start >= end) {
        throw new Error('End date must be after start date');
      }

      return await api.post<Booking>(this.basePath, data, 'booking');
    } catch (error) {
      logError('Error creating booking', error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, data: UpdateBookingDto): Promise<Booking> {
    try {
      validateId(id, 'booking id');

      // Validate dates if provided
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format');
        }

        if (start >= end) {
          throw new Error('End date must be after start date');
        }
      }

      return await api.put<Booking>(
        `${this.basePath}/${encodePathParam(id)}`,
        data,
        'booking',
        id
      );
    } catch (error) {
      logError('Error updating booking', error);
      throw error;
    }
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<{ message: string }> {
    try {
      validateId(id, 'booking id');
      return await api.delete<{ message: string }>(
        `${this.basePath}/${encodePathParam(id)}`,
        'booking',
        id
      );
    } catch (error) {
      logError('Error deleting booking', error);
      throw error;
    }
  }

  // ==================== Specialized Operations ====================

  /**
   * Confirm a booking
   */
  async confirmBooking(id: string): Promise<Booking> {
    try {
      validateId(id, 'booking id');
      return await api.post<Booking>(
        `${this.basePath}/${encodePathParam(id)}/confirm`,
        {},
        'booking',
        id
      );
    } catch (error) {
      logError('Error confirming booking', error);
      throw error;
    }
  }

  /**
   * Cancel a booking with reason
   */
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    try {
      validateId(id, 'booking id');

      if (!reason || reason.trim().length === 0) {
        throw new Error('Cancellation reason is required');
      }

      return await api.post<Booking>(
        `${this.basePath}/${encodePathParam(id)}/cancel`,
        { reason: reason.trim() },
        'booking',
        id
      );
    } catch (error) {
      logError('Error cancelling booking', error);
      throw error;
    }
  }

  /**
   * Convert a booking to a contract
   */
  async convertToContract(id: string): Promise<Booking> {
    try {
      validateId(id, 'booking id');
      return await api.post<Booking>(
        `${this.basePath}/${encodePathParam(id)}/convert`,
        {},
        'booking',
        id
      );
    } catch (error) {
      logError('Error converting booking to contract', error);
      throw error;
    }
  }

  // ==================== Query Operations ====================

  /**
   * Get all bookings for a specific customer
   */
  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    try {
      validateId(customerId, 'customer id');
      return await api.get<Booking[]>(
        `${this.basePath}/customer/${encodePathParam(customerId)}`,
        'customer bookings',
        customerId
      );
    } catch (error) {
      logError('Error fetching customer bookings', error);
      throw error;
    }
  }

  /**
   * Get all bookings for a specific car
   */
  async getBookingsByCar(carId: string): Promise<Booking[]> {
    try {
      validateId(carId, 'car id');
      return await api.get<Booking[]>(
        `${this.basePath}/car/${encodePathParam(carId)}`,
        'car bookings',
        carId
      );
    } catch (error) {
      logError('Error fetching car bookings', error);
      throw error;
    }
  }

  /**
   * Check if a car is available for a given date range
   */
  async checkAvailability(
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityResponse> {
    try {
      validateId(carId, 'car id');

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      if (start >= end) {
        throw new Error('End date must be after start date');
      }

      return await api.post<AvailabilityResponse>(
        `${this.basePath}/check-availability`,
        {
          carId,
          startDate,
          endDate,
        },
        'availability check'
      );
    } catch (error) {
      logError('Error checking availability', error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings (confirmed bookings with start date in the future)
   */
  async getUpcomingBookings(): Promise<Booking[]> {
    try {
      return await api.get<Booking[]>(
        `${this.basePath}/upcoming`,
        'upcoming bookings'
      );
    } catch (error) {
      logError('Error fetching upcoming bookings', error);
      throw error;
    }
  }

  /**
   * Get bookings that are about to expire
   */
  async getExpiringBookings(): Promise<Booking[]> {
    try {
      return await api.get<Booking[]>(
        `${this.basePath}/expiring`,
        'expiring bookings'
      );
    } catch (error) {
      logError('Error fetching expiring bookings', error);
      throw error;
    }
  }

  /**
   * Get bookings with a specific status
   */
  async getBookingsByStatus(status: string): Promise<Booking[]> {
    try {
      if (!status || status.trim().length === 0) {
        throw new Error('Status is required');
      }

      return await api.get<Booking[]>(
        `${this.basePath}?status=${encodeURIComponent(status)}`,
        'bookings by status'
      );
    } catch (error) {
      logError('Error fetching bookings by status', error);
      throw error;
    }
  }

  /**
   * Search bookings by booking reference
   */
  async searchByReference(reference: string): Promise<Booking | null> {
    try {
      if (!reference || reference.trim().length === 0) {
        throw new Error('Booking reference is required');
      }

      return await api.get<Booking | null>(
        `${this.basePath}/search/${encodePathParam(reference)}`,
        'booking search',
        reference
      );
    } catch (error) {
      logError('Error searching booking by reference', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();

// Export class for testing purposes
export default BookingService;
