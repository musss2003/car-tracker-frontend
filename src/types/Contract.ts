// types/contract.ts

export interface Contract {
    _id?: string; // optional for newly created contracts before save
    customer: {
      id: string;
      name: string;
      passport_number: string;
      driver_license_number: string;
      address?: string;
    };
    car: {
      id: string;
      manufacturer: string;
      model: string;
      license_plate: string;
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
  }
  