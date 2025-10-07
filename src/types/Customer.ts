export interface Customer {
  id: string; // UUID from backend
  name: string;
  email?: string; // Optional
  phoneNumber?: string; // Optional - camelCase (maps to phone_number in DB)
  address?: string; // Optional
  driverLicenseNumber: string; // Required - camelCase (maps to driver_license_number in DB)
  passportNumber: string; // Required - camelCase (maps to passport_number in DB)
  fatherName?: string; // Optional - camelCase (maps to father_name in DB)
  cityOfResidence?: string; // Optional - camelCase (maps to city_of_residence in DB)
  idOfPerson?: string; // Optional - camelCase (maps to id_of_person in DB)
  countryOfOrigin?: string; // Optional - camelCase (maps to country_of_origin in DB)
  drivingLicensePhotoUrl?: string; // Optional - camelCase (maps to driver_license_photo_url in DB)
  passportPhotoUrl?: string; // Optional - camelCase (maps to passport_photo_url in DB)
  createdAt: Date; // Required timestamp
  updatedAt: Date; // Required timestamp
}
