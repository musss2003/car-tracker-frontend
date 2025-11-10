import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { FormField } from '@/shared/components/ui/form-field';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, AlertCircle, Car as CarIcon, DollarSign } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Car, getAvailableCarsForPeriod } from '@/features/cars';
import formatCurrency from '@/shared/utils/formatCurrency';

interface CarAvailabilitySelectProps {
  value: string;
  onChange: (carId: string) => void;
  startDate: string;
  endDate: string;
  currentCar?: Car | null;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onCarsLoaded?: (cars: Car[]) => void;
  onPriceCalculated?: (
    dailyRate: number,
    totalAmount: number,
    days: number
  ) => void;
  showPricingSummary?: boolean;
  className?: string;
}

/**
 * CarAvailabilitySelect Component
 *
 * A smart car selector that:
 * - Fetches available cars based on date range
 * - Shows car details (make, model, year, price)
 * - Automatically calculates pricing
 * - Handles loading and error states
 * - Includes current car in edit mode
 *
 * @example
 * <CarAvailabilitySelect
 *   value={formData.carId}
 *   onChange={(carId) => handleChange('carId', carId)}
 *   startDate={formData.startDate}
 *   endDate={formData.endDate}
 *   currentCar={currentCar}
 *   error={errors.carId}
 *   required
 *   onPriceCalculated={(daily, total, days) => {
 *     setFormData(prev => ({ ...prev, dailyRate: daily, totalAmount: total }));
 *   }}
 *   showPricingSummary
 * />
 */
export const CarAvailabilitySelect: React.FC<CarAvailabilitySelectProps> = ({
  value,
  onChange,
  startDate,
  endDate,
  currentCar,
  error,
  disabled = false,
  required = false,
  onCarsLoaded,
  onPriceCalculated,
  showPricingSummary = false,
  className,
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch available cars when dates change
  useEffect(() => {
    const fetchCars = async () => {
      if (!startDate || !endDate) {
        setCars([]);
        setFetchError(null);
        onCarsLoaded?.([]);
        return;
      }

      // Validate date range - allow same day rentals
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        setCars([]);
        setFetchError(null);
        onCarsLoaded?.([]);
        return;
      }

      try {
        setLoading(true);
        setFetchError(null);

        const availableCars = await getAvailableCarsForPeriod(
          startDate,
          endDate
        );
        setCars(availableCars || []);
        onCarsLoaded?.(availableCars || []);
      } catch (err) {
        console.error('Error fetching available cars:', err);
        setFetchError(
          'Učitavanje automobila nije uspjelo. Molimo pokušajte ponovo.'
        );
        setCars([]);
        onCarsLoaded?.([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [startDate, endDate, onCarsLoaded]);

  // Calculate pricing when car or dates change
  useEffect(() => {
    if (!value || !startDate || !endDate) {
      return;
    }

    const allCars = currentCar
      ? [currentCar, ...(cars || []).filter((car) => car.id !== currentCar.id)]
      : cars || [];

    const selectedCar = allCars.find((car) => car.id === value);

    if (selectedCar) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Only calculate if end date is not before start date
      if (end >= start) {
        // For same-day rentals, count as 1 day minimum
        const days = Math.max(
          1,
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        );
        const total = days * selectedCar.pricePerDay;

        onPriceCalculated?.(selectedCar.pricePerDay, total, days);
      }
    }
  }, [value, startDate, endDate, cars, currentCar, onPriceCalculated]);

  const allCars = currentCar
    ? [currentCar, ...(cars || []).filter((car) => car.id !== currentCar.id)]
    : cars || [];

  const selectedCar = allCars.find((car) => car.id === value);

  const helperText = loading
    ? 'Učitavanje dostupnih automobila...'
    : !startDate || !endDate
      ? 'Prvo odaberite datume'
      : (cars || []).length === 0 && !loading
        ? 'Nema dostupnih automobila za odabrane datume'
        : undefined;

  return (
    <div
      className={cn('bg-background border rounded-lg p-6 space-y-4', className)}
    >
      <FormField
        label="Automobil"
        id="carId"
        error={error}
        required={required}
        helperText={helperText}
      >
        <div className="relative">
          <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled || loading || allCars.length === 0}
          >
            <SelectTrigger id="carId" className={cn(loading && 'cursor-wait')}>
              <SelectValue
                placeholder={loading ? 'Učitavanje...' : 'Odaberite automobil'}
              />
            </SelectTrigger>
            <SelectContent>
              {allCars.map((car) => (
                <SelectItem key={car.id} value={car.id}>
                  <div className="flex items-center gap-2">
                    <CarIcon className="w-4 h-4" />
                    <span>
                      {car.manufacturer} {car.model} ({car.year})
                    </span>
                    <span className="text-muted-foreground">
                      - {formatCurrency(car.pricePerDay)}/day
                    </span>
                    {currentCar?.id === car.id &&
                      !(cars || []).find((c) => c.id === car.id) && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Current)
                        </span>
                      )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loading && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </FormField>

      {/* Error Alert */}
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Učitavanje automobila nije uspjelo. Molimo pokušajte ponovo.
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Summary */}
      {showPricingSummary &&
        selectedCar &&
        startDate &&
        endDate &&
        !error &&
        new Date(endDate) >= new Date(startDate) && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Dnevna cijena:
              </span>
              <span className="font-medium">
                {formatCurrency(selectedCar.pricePerDay)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trajanje:</span>
              <span className="font-medium">
                {Math.max(
                  1,
                  Math.ceil(
                    (new Date(endDate).getTime() -
                      new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}{' '}
                {Math.max(
                  1,
                  Math.ceil(
                    (new Date(endDate).getTime() -
                      new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                ) === 1
                  ? 'dan'
                  : 'dana'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="font-semibold flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Ukupan iznos:
              </span>
              <span className="text-lg font-bold">
                {formatCurrency(
                  Math.max(
                    1,
                    Math.ceil(
                      (new Date(endDate).getTime() -
                        new Date(startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  ) * selectedCar.pricePerDay
                )}
              </span>
            </div>
          </div>
        )}
    </div>
  );
};
