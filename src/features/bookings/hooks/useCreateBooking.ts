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

const DEPOSIT_PERCENTAGE = 0.2; // 20% deposit

export const BOOKING_EXTRAS: Array<{
  type: BookingExtraType;
  label: string;
  pricePerDay: number;
}> = [
  {
    type: 'sim_card' as BookingExtraType,
    label: 'SIM Kartica (20GB)',
    pricePerDay: 20,
  },
  {
    type: 'child_seat' as BookingExtraType,
    label: 'Dječije Sjedište',
    pricePerDay: 5,
  },
  {
    type: 'kasko_insurance' as BookingExtraType,
    label: 'Kasko Osiguranje',
    pricePerDay: 20,
  },
  {
    type: 'roof_rack' as BookingExtraType,
    label: 'Krovni Nosač',
    pricePerDay: 10,
  },
];

// ─── Helper: strip characters not allowed by backend Matches() regex ─────────
// Backend allows only: a-z A-Z 0-9 whitespace , . - ( )
// Geocoder returns accented/Bosnian chars (š, ž, đ, č, ć) — transliterate them
// then strip anything still outside the allowed set.
const CHAR_MAP: Record<string, string> = {
  š: 's',
  Š: 'S',
  ž: 'z',
  Ž: 'Z',
  đ: 'd',
  Đ: 'D',
  č: 'c',
  Č: 'C',
  ć: 'c',
  Ć: 'C',
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  ö: 'o',
  ä: 'a',
};

const sanitizeLocation = (value: string): string =>
  value
    .split('')
    .map((ch) => CHAR_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-zA-Z0-9\s,.\-()]/g, '');

// ─── Helper: derive day count from two date strings ───────────────────────────
const calcDays = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
};

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

  // Extras state
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

  // Pricing state
  const [carDailyRate, setCarDailyRate] = useState(0);
  const [carCost, setCarCost] = useState(0);
  const [extrasCost, setExtrasCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Fetch customers on mount ────────────────────────────────────────────────
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

  // ── Derive totalDays from dates (source of truth) ───────────────────────────
  const totalDays = calcDays(startDate, endDate);

  // ── Handle price callback from CarAvailabilitySelect ───────────────────────
  // The shared component calls onPriceCalculated(dailyRate, totalAmount) — 2 args.
  // We store dailyRate and recompute carCost from dailyRate × totalDays so that
  // changing dates always re-triggers the correct cost without a stale closure.
  const handlePriceCalculated = (dailyRate: number, totalAmount: number) => {
    setCarDailyRate(dailyRate);
    // Use totalAmount directly from the component as it accounts for its own
    // day calculation; we keep it in sync via the effect below as dates change.
    setCarCost(totalAmount);
  };

  // ── Re-derive carCost when dates change (dailyRate is already stored) ───────
  useEffect(() => {
    if (carDailyRate > 0 && totalDays > 0) {
      setCarCost(carDailyRate * totalDays);
    }
  }, [totalDays, carDailyRate]);

  // ── Recalculate extras + total whenever costs or extras change ──────────────
  useEffect(() => {
    let extrasTotal = 0;
    BOOKING_EXTRAS.forEach((extra) => {
      const quantity = extrasQuantities[extra.type];
      if (quantity > 0 && totalDays > 0) {
        extrasTotal += extra.pricePerDay * quantity * totalDays;
      }
    });
    setExtrasCost(extrasTotal);

    const total = carCost + extrasTotal;
    setTotalCost(total);
    setDepositAmount(total * DEPOSIT_PERCENTAGE);
  }, [totalDays, carCost, extrasQuantities]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) newErrors.customerId = 'Kupac je obavezan';
    if (!carId) newErrors.carId = 'Automobil je obavezan';

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

  // ── Field handlers ──────────────────────────────────────────────────────────
  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    if (errors.customerId) setErrors((prev) => ({ ...prev, customerId: '' }));
  };

  const handleCarChange = (value: string) => {
    setCarId(value);
    if (errors.carId) setErrors((prev) => ({ ...prev, carId: '' }));
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setErrors((prev) => ({ ...prev, startDate: '', endDate: '' }));
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: '' }));
  };

  const handleExtraToggle = (extraType: BookingExtraType, checked: boolean) => {
    setExtrasQuantities((prev) => ({ ...prev, [extraType]: checked ? 1 : 0 }));
  };

  const handleExtraQuantityChange = (
    extraType: BookingExtraType,
    quantity: number
  ) => {
    const newQuantity = Math.max(0, quantity);
    setExtrasQuantities((prev) => ({ ...prev, [extraType]: newQuantity }));
    if (newQuantity === 0) handleExtraToggle(extraType, false);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Molimo ispravite greške u formularu');
      return;
    }

    setLoading(true);

    try {
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
          pickupLocation: sanitizeLocation(pickupLocation.address),
          pickupLocationNotes: pickupLocation.notes,
          pickupCoordinates: {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng,
          },
        }),
        ...(dropoffLocation && {
          dropoffLocation: sanitizeLocation(dropoffLocation.address),
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
        logError('Audit logging failed for booking creation', auditError);
      }

      toast.success('Rezervacija uspješno kreirana!');
      navigate(ROUTES.bookings.details.replace(':id', newBooking._id));
    } catch (error) {
      logError('Failed to create booking', error);

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

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goBack = () => navigate(ROUTES.bookings.root);
  const cancelBooking = () => navigate(ROUTES.bookings.root);

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
      handleSubmit,
      goBack,
      cancelBooking,
    },
  };
};
