// Type definitions from backend
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type TransmissionType = 'manual' | 'automatic';
export type CarStatus = 'available' | 'rented' | 'maintenance' | 'unavailable';
export type CarCategory =
  | 'economy'
  | 'luxury'
  | 'suv'
  | 'van'
  | 'family'
  | 'business';

export interface Car {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  color?: string;
  licensePlate: string;
  chassisNumber?: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats?: number;
  doors?: number;
  mileage?: number;
  enginePower?: number;
  pricePerDay: number;
  category: CarCategory;
  status: CarStatus;
  currentLocation?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarWithStatus extends Car {
  isBusy: boolean
}


export interface RenderFieldOptions {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  list?: string;
  autoComplete?: string;
  required?: boolean;
  helpText?: string;
  rows?: number;
  options?: { value: string | number; label: string }[]; // for select fields
}

export interface CarFormErrors {
  id?: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  color?: string;
  licensePlate?: string;
  chassisNumber?: string;
  pricePerDay?: string;
  seats?: string;
  doors?: string;
  mileage?: string;
  enginePower?: string;
  transmission?: string;
  fuelType?: string;
  category?: string;
  status?: string;
  currentLocation?: string;
  photoUrl?: string;
}

export interface CarBrand {
  name: string;
  popular: boolean;
}

export interface BookingEvent {
  title: string;
  start: Date;
  end: Date;
  contractId: string;
  customerName: string;
  customerPassportNumber?: string;
  totalAmount?: number;
  status: 'active' | 'confirmed' | 'completed';
  resource?: any;
}

export type Feature =
  | 'Air Conditioning'
  | 'Bluetooth'
  | 'Navigation System'
  | 'Backup Camera'
  | 'Sunroof'
  | 'Leather Seats'
  | 'Heated Seats'
  | 'Cruise Control';

// Common car features
export const commonFeatures: Feature[] = [
  'Air Conditioning',
  'Bluetooth',
  'Navigation System',
  'Backup Camera',
  'Sunroof',
  'Leather Seats',
  'Heated Seats',
  'Cruise Control',
];
