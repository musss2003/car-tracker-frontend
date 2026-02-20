import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

interface CancelBookingModalProps {
  open: boolean;
  bookingReference: string;
  isCancelling: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  open,
  bookingReference,
  isCancelling,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim().length < 5) return;
    onConfirm(reason.trim());
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isCancelling) {
      setReason('');
      onClose();
    }
  };

  const isValid = reason.trim().length >= 5;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-destructive" />
            Otkazati rezervaciju?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Unesite razlog otkazivanja rezervacije{' '}
            <span className="font-semibold text-foreground">
              {bookingReference}
            </span>
            . Ova akcija se ne može poništiti.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <label className="text-sm font-medium text-foreground block mb-2">
            Razlog otkazivanja <span className="text-destructive">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Unesite razlog otkazivanja..."
            rows={4}
            disabled={isCancelling}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
          />
          {reason.trim().length > 0 && !isValid && (
            <p className="text-xs text-destructive mt-1">
              Razlog mora imati najmanje 5 karaktera.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {reason.trim().length} karaktera
          </p>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCancelling}
          >
            Nazad
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isCancelling}
          >
            {isCancelling ? 'Otkazivanje...' : 'Potvrdi otkazivanje'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
