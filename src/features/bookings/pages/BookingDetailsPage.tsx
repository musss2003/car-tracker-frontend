import React, { useState, useEffect, useCallback } from 'react';
import { logError } from '@/shared/utils/logger';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardListIcon,
  ExclamationCircleIcon,
  LocationMarkerIcon,
  CheckCircleIcon,
} from '@heroicons/react/solid';

import {
  BookingStatus,
  BookingExtraType,
  type Booking,
} from '../types/booking.types';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '@/shared/components/feedback/LoadingSpinner/LoadingSpinner';
import { BookingActions } from '../components/booking-actions';
import { CancelBookingModal } from '../components/cancel-modal';

// ─── Extra label map ──────────────────────────────────────────────────────────
const EXTRA_LABELS: Record<BookingExtraType, string> = {
  [BookingExtraType.GPS]: 'GPS',
  [BookingExtraType.CHILD_SEAT]: 'Dječija sjedalica',
  [BookingExtraType.ADDITIONAL_DRIVER]: 'Dodatni vozač',
  [BookingExtraType.INSURANCE_UPGRADE]: 'Nadogradnja osiguranja',
  [BookingExtraType.WIFI]: 'Wi-Fi',
  [BookingExtraType.ROOF_RACK]: 'Krovni nosač',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return 'N/A';
  try {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('bs-BA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (
  dateInput: string | Date | null | undefined
): string => {
  if (!dateInput) return 'N/A';
  try {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('bs-BA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount)))
    return 'N/A';
  return `${Number(amount).toFixed(2)} KM`;
};

const getValue = (value: unknown, defaultValue = 'N/A'): string => {
  if (value === undefined || value === null || value === '')
    return defaultValue;
  return String(value);
};

const daysBetween = (start: string, end: string): number =>
  Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);

// ─── Page ─────────────────────────────────────────────────────────────────────
const BookingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action loading states
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Modal visibility
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const isActionLoading = isConfirming || isCancelling || isConverting;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const fetched = await bookingService.getBookingById(id!);

        if (!fetched) {
          setError('Rezervacija nije pronađena');
          toast.error('Rezervacija nije pronađena');
          navigate('/bookings');
          return;
        }

        setBooking(fetched);
      } catch (err) {
        logError('Error fetching booking:', err);
        setError('Greška pri učitavanju rezervacije');
        toast.error('Greška pri učitavanju rezervacije');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id, navigate]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!booking) return;
    try {
      setIsConfirming(true);
      const updated = await bookingService.confirmBooking(booking._id);
      setBooking(updated);
      setShowConfirmDialog(false);
      toast.success('Rezervacija je uspješno potvrđena');
    } catch (err) {
      logError('Error confirming booking:', err);
      toast.error('Greška pri potvrđivanju rezervacije');
    } finally {
      setIsConfirming(false);
    }
  }, [booking]);

  const handleCancel = useCallback(
    async (reason: string) => {
      if (!booking) return;
      try {
        setIsCancelling(true);
        const updated = await bookingService.cancelBooking(booking._id, reason);
        setBooking(updated);
        setShowCancelModal(false);
        toast.success('Rezervacija je uspješno otkazana');
      } catch (err) {
        logError('Error cancelling booking:', err);
        toast.error('Greška pri otkazivanju rezervacije');
      } finally {
        setIsCancelling(false);
      }
    },
    [booking]
  );

  const handleConvert = useCallback(async () => {
    if (!booking) return;
    try {
      setIsConverting(true);
      const updated = await bookingService.convertToContract(booking._id);
      setBooking(updated);
      setShowConvertDialog(false);
      toast.success('Rezervacija je uspješno pretvorena u ugovor');
      // Navigate to contract if convertedToContractId is available on the updated booking
      if (updated.status === BookingStatus.CONVERTED) {
        navigate(`/contracts/${updated.convertedToContractId}`);
      }
    } catch (err) {
      logError('Error converting booking:', err);
      toast.error('Greška pri pretvaranju rezervacije u ugovor');
    } finally {
      setIsConverting(false);
    }
  }, [booking, navigate]);

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;

  if (error || !booking) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <ExclamationCircleIcon className="w-16 h-16 text-destructive" />
              <p className="text-lg font-medium">
                {error || 'Rezervacija nije pronađena'}
              </p>
              <Button onClick={() => navigate('/bookings')}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Nazad na rezervacije
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const days = daysBetween(booking.startDate, booking.endDate);
  const extras = booking.extras ?? [];
  const extrasTotal = extras.reduce(
    (sum, e) => sum + (e.pricePerDay ?? 0) * e.quantity * days,
    0
  );
  const _baseRate = booking.totalEstimatedCost - extrasTotal;

  // Status-discriminated fields
  const expiresAt =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.EXPIRED
      ? booking.expiresAt
      : null;

  const cancellationReason =
    booking.status === BookingStatus.CANCELLED
      ? booking.cancellationReason
      : null;

  const cancelledAt =
    booking.status === BookingStatus.CANCELLED ? booking.cancelledAt : null;

  const convertedToContractId =
    booking.status === BookingStatus.CONVERTED
      ? booking.convertedToContractId
      : null;

  const convertedAt =
    booking.status === BookingStatus.CONVERTED ? booking.convertedAt : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <div className="flex-none px-6 py-6 bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/bookings')}
              className="gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Nazad
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <ClipboardListIcon className="w-6 h-6 text-primary" />
                Detalji rezervacije
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {booking.bookingReference}
              </p>
            </div>
          </div>

          <BookingActions
            status={booking.status}
            isActionLoading={isActionLoading}
            onConfirm={() => setShowConfirmDialog(true)}
            onCancel={() => setShowCancelModal(true)}
            onConvert={() => setShowConvertDialog(true)}
            onEdit={() => navigate(`/bookings/${booking._id}/edit`)}
          />
        </div>
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto p-6">
          {/* Status banners */}
          {booking.status === BookingStatus.CANCELLED && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                Otkazano — {formatDateTime(cancelledAt)}
              </p>
              <p className="text-sm text-red-600 dark:text-red-500">
                Razlog: {cancellationReason}
              </p>
            </div>
          )}

          {booking.status === BookingStatus.CONVERTED && (
            <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900 p-4">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-1">
                Pretvoreno u ugovor — {formatDateTime(convertedAt)}
              </p>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-purple-600 dark:text-purple-400"
                onClick={() => navigate(`/contracts/${convertedToContractId}`)}
              >
                Pregledaj ugovor →
              </Button>
            </div>
          )}

          {booking.status === BookingStatus.EXPIRED && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900/40 dark:border-gray-700 p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rezervacija je istekla — {formatDateTime(expiresAt)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ── Customer ──────────────────────────────────────────────────── */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <UserIcon className="w-5 h-5" />
                  Informacije o kupcu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ime i prezime
                  </p>
                  <button
                    className="text-base font-semibold text-primary hover:underline text-left"
                    onClick={() => navigate(`/customers/${booking.customerId}`)}
                  >
                    {getValue(booking.customer?.name)}
                  </button>
                </div>
                {booking.customer?.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <a
                      href={`mailto:${booking.customer.email}`}
                      className="text-base text-primary hover:underline"
                    >
                      {booking.customer.email}
                    </a>
                  </div>
                )}
                {booking.customer?.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Telefon
                    </p>
                    <p className="text-base">{booking.customer.phoneNumber}</p>
                  </div>
                )}
                {booking.customer?.driverLicenseNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Broj vozačke
                    </p>
                    <p className="text-base font-mono">
                      {booking.customer.driverLicenseNumber}
                    </p>
                  </div>
                )}
                {booking.customer?.passportNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Broj pasoša
                    </p>
                    <p className="text-base font-mono">
                      {booking.customer.passportNumber}
                    </p>
                  </div>
                )}
                {booking.customer?.countryOfOrigin && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Zemlja porijekla
                    </p>
                    <p className="text-base">
                      {booking.customer.countryOfOrigin}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Vehicle ───────────────────────────────────────────────────── */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <TruckIcon className="w-5 h-5" />
                  Informacije o vozilu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vozilo
                  </p>
                  <button
                    className="text-base font-semibold text-primary hover:underline text-left"
                    onClick={() => navigate(`/cars/${booking.carId}`)}
                  >
                    {booking.car
                      ? `${booking.car.manufacturer} ${booking.car.model} ${booking.car.year}`
                      : 'N/A'}
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Registarska oznaka
                  </p>
                  <p className="text-base font-mono font-bold">
                    {getValue(booking.car?.licensePlate)}
                  </p>
                </div>
                {booking.car?.fuelType && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Gorivo
                    </p>
                    <p className="text-base capitalize">
                      {booking.car.fuelType}
                    </p>
                  </div>
                )}
                {booking.car?.transmission && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Mjenjač
                    </p>
                    <p className="text-base capitalize">
                      {booking.car.transmission}
                    </p>
                  </div>
                )}
                {booking.car?.seats && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Sjedišta
                    </p>
                    <p className="text-base">{booking.car.seats}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Period ────────────────────────────────────────────────────── */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <CalendarIcon className="w-5 h-5" />
                  Period rezervacije
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Datum početka
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(booking.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Datum završetka
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(booking.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Trajanje
                  </p>
                  <p className="text-base font-semibold">
                    {days > 0 ? `${days} dana` : 'N/A'}
                  </p>
                </div>
                {expiresAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ističe
                    </p>
                    <p className="text-base text-amber-600 dark:text-amber-400">
                      {formatDateTime(expiresAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Pickup / Dropoff ──────────────────────────────────────────── */}
            {(booking.pickupLocation || booking.dropoffLocation) && (
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500">
                <CardHeader className="bg-gradient-to-r from-teal-500/10 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                    <LocationMarkerIcon className="w-5 h-5" />
                    Lokacije preuzimanja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {booking.pickupLocation && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Preuzimanje
                      </p>
                      <p className="text-base font-semibold">
                        {booking.pickupLocation}
                      </p>
                      {booking.pickupLocationNotes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.pickupLocationNotes}
                        </p>
                      )}
                    </div>
                  )}
                  {booking.dropoffLocation && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Povrat
                      </p>
                      <p className="text-base font-semibold">
                        {booking.dropoffLocation}
                      </p>
                      {booking.dropoffLocationNotes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.dropoffLocationNotes}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Pricing ───────────────────────────────────────────────────── */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <CreditCardIcon className="w-5 h-5" />
                  Informacije o cijeni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {booking.car?.pricePerDay && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Dnevna cijena
                    </p>
                    <p className="text-base font-semibold">
                      {formatCurrency(booking.car.pricePerDay)}
                    </p>
                  </div>
                )}
                {extras.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Dodaci
                    </p>
                    <p className="text-base">{formatCurrency(extrasTotal)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ukupno (procjena)
                  </p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(booking.totalEstimatedCost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Depozit
                  </p>
                  <p className="text-base font-semibold flex items-center gap-1">
                    {formatCurrency(booking.depositAmount)}
                    {booking.depositPaid ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-normal ml-1">
                        <CheckCircleIcon className="w-3.5 h-3.5" /> uplaćen
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-1">
                        nije uplaćen
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ── Extras ────────────────────────────────────────────────────── */}
            {extras.length > 0 && (
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-pink-500">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-400">
                    <ClipboardListIcon className="w-5 h-5" />
                    Dodaci
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {extras.map((extra, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium"
                      >
                        {EXTRA_LABELS[extra.type] ?? extra.type}
                        {extra.quantity > 1 && (
                          <span className="rounded-full bg-background px-1.5 py-0.5 text-xs font-bold">
                            ×{extra.quantity}
                          </span>
                        )}
                        {extra.pricePerDay && (
                          <span className="text-xs text-muted-foreground">
                            ({formatCurrency(extra.pricePerDay)}/dan)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Notes ─────────────────────────────────────────────────────── */}
            {booking.notes && (
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-gray-500 md:col-span-2 lg:col-span-3">
                <CardHeader className="bg-gradient-to-r from-gray-500/10 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                    <DocumentTextIcon className="w-5 h-5" />
                    Napomene
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-base whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── Additional drivers ────────────────────────────────────────── */}
            {(booking.additionalDrivers?.length ?? 0) > 0 && (
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500 md:col-span-2 lg:col-span-3">
                <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <UserIcon className="w-5 h-5" />
                    Dodatni vozači
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {booking.additionalDrivers!.map((driver, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium text-muted-foreground">
                          Vozač {i + 1}
                        </p>
                        <p className="text-base font-semibold font-mono">
                          {driver}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Metadata ──────────────────────────────────────────────────── */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-slate-500 md:col-span-2 lg:col-span-3">
              <CardHeader className="bg-gradient-to-r from-slate-500/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-400">
                  <DocumentTextIcon className="w-5 h-5" />
                  Informacije o rezervaciji
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Kreirao
                    </p>
                    <p className="text-base font-semibold">
                      {getValue(booking.createdBy)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Datum kreiranja
                    </p>
                    <p className="text-base">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Posljednje ažuriranje
                    </p>
                    <p className="text-base">{formatDate(booking.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      ID rezervacije
                    </p>
                    <p className="text-base font-mono text-xs break-all">
                      {booking._id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Cancel Modal ──────────────────────────────────────────────────────── */}
      <CancelBookingModal
        open={showCancelModal}
        bookingReference={booking.bookingReference}
        isCancelling={isCancelling}
        onConfirm={handleCancel}
        onClose={() => setShowCancelModal(false)}
      />

      {/* ── Confirm Dialog ────────────────────────────────────────────────────── */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrditi rezervaciju?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite potvrditi rezervaciju{' '}
              <span className="font-semibold text-foreground">
                {booking.bookingReference}
              </span>
              ? Kupac će biti obaviješten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>
              Otkaži
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? 'Potvrđivanje...' : 'Potvrdi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Convert Dialog ────────────────────────────────────────────────────── */}
      <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pretvoriti u ugovor?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će pretvoriti rezervaciju{' '}
              <span className="font-semibold text-foreground">
                {booking.bookingReference}
              </span>{' '}
              u aktivni ugovor o najmu. Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConverting}>
              Otkaži
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isConverting ? 'Pretvaranje...' : 'Pretvori u ugovor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingDetailsPage;
