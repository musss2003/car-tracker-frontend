import { api, buildQueryString, encodePathParam } from '@/shared/utils/apiService';
import { validateId } from '@/shared/utils/inputValidator';
import type {
  Booking,
  BookingStatus,
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
  status?: BookingStatus | string; // Allow enum or string for flexibility
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

/**
 * Booking Service - Handles all booking-related API operations
 * Follows RESTful conventions and uses centralized error handling
 */
class BookingService {
  private readonly basePath = '/api/bookings';

  // ==================== CRUD Operations ====================

  /**
   * Get all bookings with optional filtering and pagination
   */
  async getAllBookings(
    params?: QueryParams
  ): Promise<PaginatedResponse<Booking>> {
    const queryString = buildQueryString(params || {});
    return await api.get<PaginatedResponse<Booking>>(
      `${this.basePath}${queryString}`,
      'bookings'
    );
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    validateId(id, 'booking id');
    return await api.get<Booking>(
      `${this.basePath}/${encodePathParam(id)}`,
      'booking',
      id
    );
  }

  /**
   * Create a new booking
   * Note: UI layer should validate required fields and date logic before calling
   */
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    // Security validation only - prevent injection attacks
    if (data.customerId) validateId(data.customerId, 'customer id');
    if (data.carId) validateId(data.carId, 'car id');

    return await api.post<Booking>(this.basePath, data, 'booking');
  }

  /**
   * Update an existing booking
   * Note: UI layer should validate dates and business logic before calling
   */
  async updateBooking(id: string, data: UpdateBookingDto): Promise<Booking> {
    validateId(id, 'booking id');

    return await api.put<Booking>(
      `${this.basePath}/${encodePathParam(id)}`,
      data,
      'booking',
      id
    );
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<{ message: string }> {
    validateId(id, 'booking id');
    return await api.delete<{ message: string }>(
      `${this.basePath}/${encodePathParam(id)}`,
      'booking',
      id
    );
  }

  // ==================== Specialized Operations ====================

  /**
   * Confirm a booking
   */
  async confirmBooking(id: string): Promise<Booking> {
    validateId(id, 'booking id');
    return await api.post<Booking>(
      `${this.basePath}/${encodePathParam(id)}/confirm`,
      {},
      'booking',
      id
    );
  }

  /**
   * Cancel a booking with reason
   * Note: UI layer should validate reason is provided
   */
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    validateId(id, 'booking id');

    return await api.post<Booking>(
      `${this.basePath}/${encodePathParam(id)}/cancel`,
      { reason },
      'booking',
      id
    );
  }

  /**
   * Convert a booking to a contract
   */
  async convertToContract(id: string): Promise<Booking> {
    validateId(id, 'booking id');
    return await api.post<Booking>(
      `${this.basePath}/${encodePathParam(id)}/convert`,
      {},
      'booking',
      id
    );
  }

  // ==================== Query Operations ====================

  /**
   * Get all bookings for a specific customer
   */
  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    validateId(customerId, 'customer id');
    return await api.get<Booking[]>(
      `${this.basePath}/customer/${encodePathParam(customerId)}`,
      'customer bookings',
      customerId
    );
  }

  /**
   * Get all bookings for a specific car
   */
  async getBookingsByCar(carId: string): Promise<Booking[]> {
    validateId(carId, 'car id');
    return await api.get<Booking[]>(
      `${this.basePath}/car/${encodePathParam(carId)}`,
      'car bookings',
      carId
    );
  }

  /**
   * Check if a car is available for a given date range
   * Note: UI layer should validate date logic before calling
   */
  async checkAvailability(
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityResponse> {
    validateId(carId, 'car id');

    return await api.post<AvailabilityResponse>(
      `${this.basePath}/check-availability`,
      {
        carId,
        startDate,
        endDate,
      },
      'availability check'
    );
  }

  /**
   * Get upcoming bookings (confirmed bookings with start date in the future)
   */
  async getUpcomingBookings(): Promise<Booking[]> {
    return await api.get<Booking[]>(
      `${this.basePath}/upcoming`,
      'upcoming bookings'
    );
  }

  /**
   * Get bookings that are about to expire
   */
  async getExpiringBookings(): Promise<Booking[]> {
    return await api.get<Booking[]>(
      `${this.basePath}/expiring`,
      'expiring bookings'
    );
  }

  /**
   * Get bookings with a specific status
   */
  async getBookingsByStatus(status: BookingStatus | string): Promise<Booking[]> {
    const queryString = buildQueryString({ status });
    return await api.get<Booking[]>(
      `${this.basePath}${queryString}`,
      'bookings by status'
    );
  }

  /**
   * Search bookings by booking reference
   */
  async searchByReference(reference: string): Promise<Booking | null> {
    return await api.get<Booking | null>(
      `${this.basePath}/search/${encodePathParam(reference)}`,
      'booking search',
      reference
    );
  }
}

// Export singleton instance
export const bookingService = new BookingService();

// Export class for testing purposes
export default BookingService;
