import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';
import { getCustomers } from '@/features/customers/services/customerService';
import { ROUTES } from '@/routing/paths';
import {
  logAudit,
  AuditAction,
  AuditOutcome,
  sanitizeAuditMetadata,
} from '@/shared/utils/audit';
import { logError } from '@/shared/utils/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { LocationData } from '@/shared/components/ui/location-picker';
import type {
  CreateBookingDto,
  BookingExtraType,
} from '../types/booking.types';
import type { Customer } from '@/features/customers/types/customer.types';
import type { Car } from '@/features/cars/types/car.types';

const DEPOSIT_PERCENTAGE = 0.2; // 20% deposit

export const BOOKING_EXTRAS: Array<{
  type: BookingExtraType;
  label: string;
  pricePerDay: number;
}> = [
  { type: 'gps' as BookingExtraType, label: 'GPS Navigacija', pricePerDay: 5 },
  {
    type: 'child_seat' as BookingExtraType,
    label: 'Dječije Sjedište',
    pricePerDay: 3,
  },
  {
    type: 'additional_driver' as BookingExtraType,
    label: 'Dodatni Vozač',
    pricePerDay: 10,
  },
  {
    type: 'insurance_upgrade' as BookingExtraType,
    label: 'Nadogradnja Osiguranja',
    pricePerDay: 15,
  },
  { type: 'wifi' as BookingExtraType, label: 'Mobilni WiFi', pricePerDay: 4 },
  {
    type: 'roof_rack' as BookingExtraType,
    label: 'Krovni Nosač',
    pricePerDay: 7,
  },
];

export const useCreateBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [carId, setCarId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(
    null
  );
  const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(
    null
  );
  const [notes, setNotes] = useState('');

  // Customer data
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Car data
  const [availableCars, setAvailableCars] = useState<Car[]>([]);

  // Extras state - quantities for each extra type
  const [extrasQuantities, setExtrasQuantities] = useState<
    Record<BookingExtraType, number>
  >({
    gps: 0,
    child_seat: 0,
    additional_driver: 0,
    insurance_upgrade: 0,
    wifi: 0,
    roof_rack: 0,
  });

  // Pricing state - managed by CarAvailabilitySelect
  const [totalDays, setTotalDays] = useState(0);
  const [carDailyRate, setCarDailyRate] = useState(0);
  const [carCost, setCarCost] = useState(0);
  const [extrasCost, setExtrasCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        logError('Failed to fetch customers', error);
        toast.error('Neuspješno učitavanje kupaca');
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle car price calculation callback from CarAvailabilitySelect
  const handlePriceCalculated = (
    dailyRate: number,
    totalAmount: number,
    days: number
  ) => {
    setCarDailyRate(dailyRate);
    setCarCost(totalAmount);
    setTotalDays(days);
  };

  // Handle cars loaded callback
  const handleCarsLoaded = (cars: Car[]) => {
    setAvailableCars(cars);
  };

  // Calculate extras cost when extras or days change
  useEffect(() => {
    if (!totalDays) {
      setExtrasCost(0);
      setTotalCost(carCost);
      setDepositAmount(carCost * DEPOSIT_PERCENTAGE);
      return;
    }

    // Calculate extras cost
    let extrasTotal = 0;
    BOOKING_EXTRAS.forEach((extra) => {
      const quantity = extrasQuantities[extra.type];
      if (quantity > 0) {
        extrasTotal += extra.pricePerDay * quantity * totalDays;
      }
    });
    setExtrasCost(extrasTotal);

    // Calculate total cost and deposit
    const total = carCost + extrasTotal;
    setTotalCost(total);
    setDepositAmount(total * DEPOSIT_PERCENTAGE);
  }, [totalDays, carCost, extrasQuantities]);

  // Validate form
  // NOTE: This is client-side validation only for UX.
  // The backend MUST enforce equivalent validation and sanitization
  // for all user-supplied fields (notes, locations, dates, etc.)
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Kupac je obavezan';
    }

    if (!carId) {
      newErrors.carId = 'Automobil je obavezan';
    }

    if (!startDate) {
      newErrors.startDate = 'Datum početka je obavezan';
    } else {
      const start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = 'Datum početka mora biti u budućnosti';
      }
    }

    if (!endDate) {
      newErrors.endDate = 'Datum završetka je obavezan';
    } else if (startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        newErrors.endDate = 'Datum završetka mora biti nakon datuma početka';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    setCustomerId(customerId);
    if (errors.customerId) {
      setErrors((prev) => ({ ...prev, customerId: '' }));
    }
  };

  // Handle car selection
  const handleCarChange = (carId: string) => {
    setCarId(carId);
    if (errors.carId) {
      setErrors((prev) => ({ ...prev, carId: '' }));
    }
  };

  // Handle start date change - clear both start and end date errors
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setErrors((prev) => ({
      ...prev,
      startDate: '',
      endDate: '',
    }));
  };

  // Handle end date change
  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: '' }));
    }
  };

  // Handle extras checkbox change
  const handleExtraToggle = (extraType: BookingExtraType, checked: boolean) => {
    setExtrasQuantities((prev) => ({
      ...prev,
      [extraType]: checked ? 1 : 0,
    }));
  };

  // Handle extras quantity change
  const handleExtraQuantityChange = (
    extraType: BookingExtraType,
    quantity: number
  ) => {
    const newQuantity = Math.max(0, quantity);
    setExtrasQuantities((prev) => ({
      ...prev,
      [extraType]: newQuantity,
    }));

    // If quantity is set to 0, also toggle the checkbox off
    if (newQuantity === 0) {
      handleExtraToggle(extraType, false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Molimo ispravite greške u formularu');
      return;
    }

    setLoading(true);

    try {
      // Build extras array
      const extras = BOOKING_EXTRAS.filter(
        (extra) => extrasQuantities[extra.type] > 0
      ).map((extra) => ({
        type: extra.type,
        quantity: extrasQuantities[extra.type],
      }));

      const bookingData: CreateBookingDto = {
        customerId,
        carId,
        startDate,
        endDate,
        ...(pickupLocation && {
          pickupLocation: pickupLocation.address,
          pickupLocationNotes: pickupLocation.notes,
          pickupCoordinates: {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng,
          },
        }),
        ...(dropoffLocation && {
          dropoffLocation: dropoffLocation.address,
          dropoffLocationNotes: dropoffLocation.notes,
          dropoffCoordinates: {
            lat: dropoffLocation.lat,
            lng: dropoffLocation.lng,
          },
        }),
        ...(extras.length > 0 && { extras }),
        ...(notes && { notes }),
      };

      const newBooking = await bookingService.createBooking(bookingData);

      // Log audit - wrapped in try-catch to prevent audit failures from blocking UX
      try {
        await logAudit({
          action: AuditAction.BOOKING_CREATED,
          resourceType: 'booking',
          resourceId: newBooking._id,
          outcome: AuditOutcome.SUCCESS,
          metadata: sanitizeAuditMetadata({
            bookingReference: newBooking.bookingReference,
            userId: user?.id || 'unknown',
            customerId,
            carId,
            totalCost,
            hasExtras: Object.values(extrasQuantities).some((q) => q > 0),
          }),
        });
      } catch (auditError) {
        // Log audit failure but don't block user flow
        logError('Audit logging failed for booking creation', auditError);
      }

      toast.success('Rezervacija uspješno kreirana!');
      navigate(ROUTES.bookings.details.replace(':id', newBooking._id));
    } catch (error) {
      // Log the error (logError already sanitizes sensitive data)
      logError('Failed to create booking', error);

      // Log audit failure - wrapped in try-catch to ensure user sees error toast
      try {
        await logAudit({
          action: AuditAction.BOOKING_CREATED,
          resourceType: 'booking',
          outcome: AuditOutcome.FAILURE,
          metadata: sanitizeAuditMetadata({
            userId: user?.id || 'unknown',
            customerId,
            carId,
            errorType: error instanceof Error ? error.name : 'unknown',
          }),
        });
      } catch (auditError) {
        // Log audit failure but don't block error handling
        logError(
          'Audit logging failed for booking creation failure',
          auditError
        );
      }

      toast.error('Neuspješno kreiranje rezervacije. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation actions
  const goBack = () => {
    navigate(ROUTES.bookings.root);
  };

  const cancelBooking = () => {
    navigate(ROUTES.bookings.root);
  };

  return {
    state: {
      loading,
      loadingCustomers,
      customerId,
      carId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      notes,
      customers,
      availableCars,
      extrasQuantities,
      totalDays,
      carDailyRate,
      carCost,
      extrasCost,
      totalCost,
      depositAmount,
      errors,
    },
    actions: {
      setPickupLocation,
      setDropoffLocation,
      setNotes,
      handleCustomerChange,
      handleCarChange,
      handleStartDateChange,
      handleEndDateChange,
      handleExtraToggle,
      handleExtraQuantityChange,
      handlePriceCalculated,
      handleCarsLoaded,
      handleSubmit,
      goBack,
      cancelBooking,
    },
  };
};
