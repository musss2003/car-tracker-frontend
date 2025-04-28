export interface Car {
  id: string
  manufacturer: string
  model: string
  year?: number
  color?: string
  license_plate: string
  chassis_number?: string
  price_per_day: string | number
  description?: string
  features?: Feature[]
  transmission?: "automatic" | "manual" | "semi-automatic"
  fuel_type?: "gasoline" | "diesel" | "electric" | "hybrid"
  seats?: number
  image?: string
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
  license_plate?: string;
  chassis_number?: string;
  price_per_day?: string;
  seats?: string;
  transmission?: string;
  fuel_type?: string;
  description?: string;
  image?: string;
  features?: string;
}

export interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  contractId: string;
  customerName: string;
  customerPhone?: string;
  totalAmount?: number;
  status: string;
}

export type Feature =
  | "Air Conditioning"
  | "Bluetooth"
  | "Navigation System"
  | "Backup Camera"
  | "Sunroof"
  | "Leather Seats"
  | "Heated Seats"
  | "Cruise Control";

    // Common car features
    export const commonFeatures: Feature[] = [
      "Air Conditioning",
      "Bluetooth",
      "Navigation System",
      "Backup Camera",
      "Sunroof",
      "Leather Seats",
      "Heated Seats",
      "Cruise Control",
    ];
