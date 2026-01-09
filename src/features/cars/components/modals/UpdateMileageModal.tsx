import { useState } from 'react';
import { logError } from '@/shared/utils/logger';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Gauge } from 'lucide-react';
import { updateCar } from '../../services/carService';

interface UpdateMileageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  currentMileage?: number;
  onSuccess?: () => void;
}

export function UpdateMileageModal({
  open,
  onOpenChange,
  carId,
  currentMileage,
  onSuccess,
}: UpdateMileageModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [mileage, setMileage] = useState(currentMileage?.toString() || '');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMileage(e.target.value);
    setError('');
  };

  const validateMileage = () => {
    if (!mileage || mileage.trim() === '') {
      setError('Kilometraža je obavezna');
      return false;
    }

    const mileageNum = Number(mileage);
    if (isNaN(mileageNum) || mileageNum < 0) {
      setError('Unesite validnu kilometražu');
      return false;
    }

    if (currentMileage && mileageNum < currentMileage) {
      setError(
        `Nova kilometraža ne može biti manja od trenutne (${currentMileage} km)`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMileage()) return;

    try {
      setSubmitting(true);

      // Fetch current car data and update only mileage
      const { getCar } = await import('../../services/carService');
      const currentCar = await getCar(carId);

      await updateCar(carId, {
        ...currentCar,
        mileage: Number(mileage),
      });

      toast.success('Kilometraža je uspješno ažurirana');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logError('Error updating mileage:', error);
      toast.error('Greška pri ažuriranju kilometraže');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMileage(currentMileage?.toString() || '');
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Ažuriraj kilometražu</DialogTitle>
              <DialogDescription>
                Unesite trenutnu kilometražu vozila
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Current Mileage Display */}
            {currentMileage !== undefined && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Trenutna kilometraža
                </p>
                <p className="text-2xl font-bold">
                  {currentMileage.toLocaleString()} km
                </p>
              </div>
            )}

            {/* New Mileage Input */}
            <div className="space-y-2">
              <Label htmlFor="mileage">
                Nova kilometraža <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                placeholder="npr. 45000"
                value={mileage}
                onChange={handleChange}
                className={error ? 'border-red-500' : ''}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {/* Difference Display */}
            {currentMileage !== undefined &&
              mileage &&
              !isNaN(Number(mileage)) &&
              Number(mileage) >= currentMileage && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-muted-foreground">
                    Razlika od posljednjeg ažuriranja
                  </p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                    +{(Number(mileage) - currentMileage).toLocaleString()} km
                  </p>
                </div>
              )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Ažuriranje...' : 'Ažuriraj'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
