import type { Car } from './Car';

/**
 * Represents a maintenance record for a vehicle
 */
export interface MaintenanceRecord {
  id: string;
  carLicensePlate: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  description: string;
  nextDueDate: string | null;
  nextDueMileage: number | null;
  createdAt: string;
  cost?: number;
  performedBy?: string;
  invoiceNumber?: string;
}

/**
 * Represents a maintenance record with associated car details
 */
export interface MaintenanceRecordWithCar extends MaintenanceRecord {
  carDetails: Pick<Car, 'manufacturer' | 'model' | 'year'>;
  isOverdue: boolean;
}

/**
 * Form data for creating or updating a maintenance record
 */
export interface MaintenanceFormData {
  type: string;
  mileage: string;
  date: string;
  description: string;
  nextDueMileage: string;
  cost?: string;
  performedBy?: string;
  invoiceNumber?: string;
}

/**
 * Types of maintenance that can be performed on a vehicle
 */
export type MaintenanceType =
  | 'Oil Change'
  | 'Tire Rotation'
  | 'Brake Service'
  | 'Air Filter'
  | 'Battery Replacement'
  | 'Inspection'
  | 'Fluid Check'
  | 'Transmission Service'
  | 'Coolant Flush'
  | 'Spark Plugs'
  | 'Timing Belt'
  | 'Other';

/**
 * API response for maintenance records
 */
export interface MaintenanceResponse {
  records: MaintenanceRecord[];
  total: number;
}

/**
 * API response for upcoming maintenance
 */
export interface UpcomingMaintenanceResponse {
  records: MaintenanceRecordWithCar[];
  total: number;
}
