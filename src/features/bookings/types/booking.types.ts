import type { Customer } from '../../customers';
import type { Car } from '../../cars';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  CONVERTED = 'converted',
  EXPIRED = 'expired',
}

export enum BookingExtraType {
  GPS = 'gps',
  CHILD_SEAT = 'child_seat',
  ADDITIONAL_DRIVER = 'additional_driver',
  INSURANCE_UPGRADE = 'insurance_upgrade',
  WIFI = 'wifi',
  ROOF_RACK = 'roof_rack',
}

export interface BookingExtra {
  type: BookingExtraType;
  quantity: number;
  pricePerDay?: number;
}

export interface Booking {
  _id: string;
  customerId: string;
  carId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalEstimatedCost: number;
  depositAmount: number;
  depositPaid: boolean;
  notes?: string;
  bookingReference: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  additionalDrivers?: string[];
  extras?: BookingExtra[];
  cancelledAt?: string;
  cancellationReason?: string;
  convertedToContractId?: string;
  convertedAt?: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Populated fields
  customer?: Customer;
  car?: Car;
}

export interface CreateBookingDto {
  customerId: string;
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  extras?: BookingExtra[];
  notes?: string;
}

export interface UpdateBookingDto {
  startDate?: string;
  endDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  extras?: BookingExtra[];
  notes?: string;
}
