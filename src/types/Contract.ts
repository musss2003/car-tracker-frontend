import { Customer } from './Customer';

export interface Contract {
  id?: string; // optional for newly created contracts before save
  customer: Customer;
  car: {
    id: string;
    manufacturer: string;
    model: string;
    license_plate: string;
    price_per_day: number | string;
  };
  rentalPeriod: {
    startDate: string | Date;
    endDate: string | Date;
  };
  rentalPrice: {
    dailyRate: number;
    totalAmount: number;
  };
  paymentDetails: {
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid';
  };
  additionalNotes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  contractPhoto?: string;
  status: string;
}
