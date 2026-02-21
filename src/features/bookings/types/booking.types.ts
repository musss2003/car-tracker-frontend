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
  SIM_CARD = 'sim_card',
  CHILD_SEAT = 'child_seat',
  KASKO_INSURANCE = 'kasko_insurance',
  ROOF_RACK = 'roof_rack',
}

export interface BookingExtra {
  type: BookingExtraType;
  quantity: number;
  pricePerDay?: number;
}

export interface CreateBookingExtraDto {
  type: BookingExtraType;
  quantity: number;
}

interface BookingBase {
  _id: string;
  customerId?: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalEstimatedCost: number;
  depositAmount: number;
  depositPaid: boolean;
  notes?: string;
  bookingReference: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupLocationNotes?: string;
  dropoffLocationNotes?: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffCoordinates?: { lat: number; lng: number };
  additionalDrivers?: string[];
  extras?: BookingExtra[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  car?: Car;
}

interface PendingBooking extends BookingBase {
  status: BookingStatus.PENDING;
  expiresAt: string;
}

interface ConfirmedBooking extends BookingBase {
  status: BookingStatus.CONFIRMED;
}

interface CancelledBooking extends BookingBase {
  status: BookingStatus.CANCELLED;
  cancelledAt: string;
  cancellationReason: string;
}

interface ConvertedBooking extends BookingBase {
  status: BookingStatus.CONVERTED;
  convertedToContractId: string;
  convertedAt: string;
}

interface ExpiredBooking extends BookingBase {
  status: BookingStatus.EXPIRED;
  expiresAt: string;
}

export type Booking =
  | PendingBooking
  | ConfirmedBooking
  | CancelledBooking
  | ConvertedBooking
  | ExpiredBooking;

export interface CreateBookingDto {
  customerId?: string;
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupLocationNotes?: string;
  dropoffLocationNotes?: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffCoordinates?: { lat: number; lng: number };
  extras?: CreateBookingExtraDto[];
  notes?: string;
}

export interface UpdateBookingDto {
  startDate?: string;
  endDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  extras?: CreateBookingExtraDto[];
  notes?: string;
}
