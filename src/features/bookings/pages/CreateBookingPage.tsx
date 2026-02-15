import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { PageHeader } from '@/shared/components/ui/page-header';
import { CustomerSearchSelect } from '@/features/customers/components/customer-search-select';
import { CarAvailabilitySelect } from '@/features/cars/components/car-availability-select';
import { bookingService } from '../services/bookingService';
import { getCustomers } from '@/features/customers/services/customerService';
import { logAudit, AuditAction, AuditOutcome } from '@/shared/utils/audit';
import { logError } from '@/shared/utils/logger';
import type { CreateBookingDto, BookingExtraType } from '../types/booking.types';
import type { Customer } from '@/features/customers/types/customer.types';
import type { Car } from '@/features/cars/types/car.types';

const BOOKING_EXTRAS: Array<{
  type: BookingExtraType;
  label: string;
  pricePerDay: number;
}> = [
  { type: 'gps' as BookingExtraType, label: 'GPS Navigation', pricePerDay: 5 },
  { type: 'child_seat' as BookingExtraType, label: 'Child Seat', pricePerDay: 3 },
  {
    type: 'additional_driver' as BookingExtraType,
    label: 'Additional Driver',
    pricePerDay: 10,
  },
  {
    type: 'insurance_upgrade' as BookingExtraType,
    label: 'Insurance Upgrade',
    pricePerDay: 15,
  },
  { type: 'wifi' as BookingExtraType, label: 'Mobile WiFi', pricePerDay: 4 },
  { type: 'roof_rack' as BookingExtraType, label: 'Roof Rack', pricePerDay: 7 },
];

const DEPOSIT_PERCENTAGE = 0.2; // 20% deposit

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [carId, setCarId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
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
        toast.error('Failed to load customers');
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle car price calculation callback from CarAvailabilitySelect
  const handlePriceCalculated = (dailyRate: number, totalAmount: number, days: number) => {
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
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!carId) {
      newErrors.carId = 'Car is required';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = 'Start date must be in the future';
      }
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    } else if (startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
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
    setExtrasQuantities((prev) => ({
      ...prev,
      [extraType]: Math.max(0, quantity),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
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
        ...(pickupLocation && { pickupLocation }),
        ...(dropoffLocation && { dropoffLocation }),
        ...(extras.length > 0 && { extras }),
        ...(notes && { notes }),
      };

      const newBooking = await bookingService.createBooking(bookingData);

      // Log audit
      await logAudit({
        action: AuditAction.BOOKING_CREATED,
        resourceType: 'booking',
        resourceId: newBooking._id,
        outcome: AuditOutcome.SUCCESS,
        metadata: {
          bookingReference: newBooking.bookingReference,
          customerId,
          carId,
          totalCost,
        },
      });

      toast.success('Booking created successfully!');
      navigate(`/bookings/${newBooking._id}`);
    } catch (error) {
      logError('Failed to create booking', error);

      await logAudit({
        action: AuditAction.BOOKING_CREATED,
        resourceType: 'booking',
        outcome: AuditOutcome.FAILURE,
        metadata: { customerId, carId },
      });

      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Create New Booking"
        subtitle="Reserve a car for a customer with availability checking and pricing calculation"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Customer and Car Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customer">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <CustomerSearchSelect
                  value={customerId}
                  onChange={handleCustomerChange}
                  customers={customers}
                  disabled={loadingCustomers}
                />
                {loadingCustomers && (
                  <p className="text-sm text-gray-500">Loading customers...</p>
                )}
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId}</p>
                )}
              </div>

              {/* Car Selection */}
              <div className="space-y-2">
                <Label htmlFor="car">
                  Car <span className="text-red-500">*</span>
                </Label>
                <CarAvailabilitySelect
                  value={carId}
                  onChange={handleCarChange}
                  startDate={startDate}
                  endDate={endDate}
                  required
                  onCarsLoaded={handleCarsLoaded}
                  onPriceCalculated={handlePriceCalculated}
                  error={errors.carId}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (errors.startDate) {
                      setErrors((prev) => ({ ...prev, startDate: '' }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (errors.endDate) {
                      setErrors((prev) => ({ ...prev, endDate: '' }));
                    }
                  }}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pickup Location */}
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  type="text"
                  placeholder="e.g., Main Office, Airport Terminal 1"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                />
              </div>

              {/* Dropoff Location */}
              <div className="space-y-2">
                <Label htmlFor="dropoffLocation">Dropoff Location</Label>
                <Input
                  id="dropoffLocation"
                  type="text"
                  placeholder="e.g., Main Office, Airport Terminal 1"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extras */}
        <Card>
          <CardContent className="pt-6">
            <Label className="text-lg font-semibold mb-4 block">
              Additional Extras
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              {BOOKING_EXTRAS.map((extra) => (
                <div
                  key={extra.type}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={extra.type}
                      checked={extrasQuantities[extra.type] > 0}
                      onCheckedChange={(checked) =>
                        handleExtraToggle(extra.type, checked === true)
                      }
                    />
                    <div>
                      <Label
                        htmlFor={extra.type}
                        className="font-medium cursor-pointer"
                      >
                        {extra.label}
                      </Label>
                      <p className="text-sm text-gray-500">
                        ${extra.pricePerDay}/day
                      </p>
                    </div>
                  </div>

                  {extrasQuantities[extra.type] > 0 && (
                    <Input
                      type="number"
                      min="1"
                      value={extrasQuantities[extra.type]}
                      onChange={(e) =>
                        handleExtraQuantityChange(
                          extra.type,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any special requests or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        {totalCost > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Period:</span>
                  <span className="font-medium">
                    {totalDays} {totalDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Car Rental:</span>
                  <span className="font-medium">${carCost.toFixed(2)}</span>
                </div>
                {extrasCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extras:</span>
                    <span className="font-medium">${extrasCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-blue-300 pt-3 flex justify-between">
                  <span className="font-semibold text-lg">Total Cost:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Deposit Required (20%):
                  </span>
                  <span className="font-medium text-orange-600">
                    ${depositAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/bookings')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBookingPage;
