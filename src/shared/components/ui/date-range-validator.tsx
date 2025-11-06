import React, { useEffect, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/ui/form-field';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateConflict {
  start: string;
  end: string;
  contractId?: string;
  message?: string;
}

interface DateRangeValidatorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startDateError?: string;
  endDateError?: string;
  disabled?: boolean;
  minStartDate?: string;
  checkConflicts?: boolean;
  existingBookings?: DateConflict[];
  currentBookingId?: string;
  onConflictDetected?: (hasConflict: boolean, message?: string) => void;
  showConflictWarning?: boolean;
  className?: string;
}

/**
 * DateRangeValidator Component
 * 
 * A reusable date range picker with built-in validation:
 * - Start date must be before end date
 * - Optional minimum start date
 * - Optional conflict detection with existing bookings
 * - Visual feedback for conflicts
 * 
 * @example
 * <DateRangeValidator
 *   startDate={formData.startDate}
 *   endDate={formData.endDate}
 *   onStartDateChange={(date) => handleChange('startDate', date)}
 *   onEndDateChange={(date) => handleChange('endDate', date)}
 *   startDateError={errors.startDate}
 *   endDateError={errors.endDate}
 *   checkConflicts
 *   existingBookings={carBookings}
 *   currentBookingId={contractId}
 *   onConflictDetected={(hasConflict, message) => setHasConflict(hasConflict)}
 * />
 */
export const DateRangeValidator: React.FC<DateRangeValidatorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError,
  disabled = false,
  minStartDate,
  checkConflicts = false,
  existingBookings = [],
  currentBookingId,
  onConflictDetected,
  showConflictWarning = true,
  className,
}) => {
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!checkConflicts || !startDate || !endDate) {
      setConflictMessage(null);
      onConflictDetected?.(false);
      return;
    }

    // Check for date range validity first
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setConflictMessage(null);
      onConflictDetected?.(false);
      return;
    }

    // Check for conflicts with existing bookings
    const hasConflict = existingBookings.some((booking) => {
      // Skip the current booking being edited
      if (currentBookingId && booking.contractId === currentBookingId) {
        return false;
      }

      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);

      // Check if dates overlap
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });

    if (hasConflict) {
      const message = 'This date range conflicts with an existing booking for this vehicle';
      setConflictMessage(message);
      onConflictDetected?.(true, message);
    } else {
      setConflictMessage(null);
      onConflictDetected?.(false);
    }
  }, [startDate, endDate, checkConflicts, existingBookings, currentBookingId, onConflictDetected]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    onStartDateChange(newStartDate);

    // Clear conflict message when dates change
    if (conflictMessage) {
      setConflictMessage(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    onEndDateChange(newEndDate);

    // Clear conflict message when dates change
    if (conflictMessage) {
      setConflictMessage(null);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Start Date"
          id="startDate"
          error={startDateError}
          required
        >
          <div className="relative">
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              disabled={disabled}
              min={minStartDate}
              className={cn(
                conflictMessage && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </FormField>

        <FormField
          label="End Date"
          id="endDate"
          error={endDateError}
          required
        >
          <div className="relative">
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              disabled={disabled}
              min={startDate || minStartDate}
              className={cn(
                conflictMessage && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </FormField>
      </div>

      {/* Conflict Warning */}
      {showConflictWarning && conflictMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{conflictMessage}</AlertDescription>
        </Alert>
      )}

      {/* Date Range Summary */}
      {startDate && endDate && !conflictMessage && (
        <div className="text-sm text-muted-foreground">
          Duration:{' '}
          <span className="font-medium text-foreground">
            {Math.ceil(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )}{' '}
            day(s)
          </span>
        </div>
      )}
    </div>
  );
};
