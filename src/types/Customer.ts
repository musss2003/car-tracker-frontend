export interface Customer {
    id?: string; // Optional if not always present
    name: string;
    email?: string;
    phone_number?: string;
    address?: string;
    driver_license_number: string;
    passport_number: string;
    createdAt?: Date;
    drivingLicensePhotoUrl?: string;
    passportPhotoUrl?: string;
  }
  