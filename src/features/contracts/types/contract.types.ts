import { Car } from "@/features/cars";
import { Customer } from "@/features/customers";
import { User } from "@/features/users";


export interface Contract {
  id: string;
  createdById: string;
  createdBy: User;
  createdAt: Date;
  customerId: string;
  customer: Customer;
  carId: string;
  car: Car;
  startDate: Date;
  endDate: Date;
  dailyRate: number;
  totalAmount: number;
  additionalNotes?: string;
  photoUrl: string;
  updatedById?: string;
  updatedBy?: User;
  updatedAt?: Date;
}

export interface ContractFormData {
  customerId: string;
  carId: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  additionalNotes?: string;
  photoUrl: string;
}
