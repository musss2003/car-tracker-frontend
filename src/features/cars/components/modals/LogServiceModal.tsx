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
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Wrench } from 'lucide-react';
import { addCarServiceRecord } from '../../services/carServiceHistory';

interface LogServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  currentMileage?: number;
  onSuccess?: () => void;
}

export function LogServiceModal({
  open,
  onOpenChange,
  carId,
  currentMileage,
  onSuccess,
}: LogServiceModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    mileage: currentMileage?.toString() || '',
    serviceType: '',
    description: '',
    nextServiceKm: '',
    cost: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceDate) {
      newErrors.serviceDate = 'Datum servisa je obavezan';
    }
    if (!formData.serviceType || formData.serviceType.trim() === '') {
      newErrors.serviceType = 'Tip servisa je obavezan';
    }
    if (!formData.mileage || formData.mileage.trim() === '') {
      newErrors.mileage = 'Kilometraža je obavezna';
    } else if (
      isNaN(Number(formData.mileage)) ||
      Number(formData.mileage) < 0
    ) {
      newErrors.mileage = 'Unesite validnu kilometražu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        carId,
        serviceDate: formData.serviceDate,
        mileage: Number(formData.mileage),
        serviceType: formData.serviceType,
        description: formData.description || undefined,
        nextServiceKm: formData.nextServiceKm
          ? Number(formData.nextServiceKm)
          : undefined,
        cost: formData.cost ? Number(formData.cost) : undefined,
      };

      await addCarServiceRecord(payload);
      toast.success('Servis je uspješno zabilježen');

      // Reset form
      setFormData({
        serviceDate: new Date().toISOString().split('T')[0],
        mileage: currentMileage?.toString() || '',
        serviceType: '',
        description: '',
        nextServiceKm: '',
        cost: '',
      });
      setErrors({});

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logError('Error logging service:', error);
      toast.error('Greška pri zapisivanju servisa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        serviceDate: new Date().toISOString().split('T')[0],
        mileage: currentMileage?.toString() || '',
        serviceType: '',
        description: '',
        nextServiceKm: '',
        cost: '',
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Zabilježi servis</DialogTitle>
              <DialogDescription>
                Brzo dodajte novi servisni zapis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Service Date */}
            <div className="space-y-2">
              <Label htmlFor="serviceDate">
                Datum servisa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serviceDate"
                name="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={handleChange}
                className={errors.serviceDate ? 'border-red-500' : ''}
              />
              {errors.serviceDate && (
                <p className="text-sm text-red-500">{errors.serviceDate}</p>
              )}
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">
                Tip servisa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serviceType"
                name="serviceType"
                type="text"
                placeholder="npr. Redovni servis, Zamjena ulja..."
                value={formData.serviceType}
                onChange={handleChange}
                className={errors.serviceType ? 'border-red-500' : ''}
              />
              {errors.serviceType && (
                <p className="text-sm text-red-500">{errors.serviceType}</p>
              )}
            </div>

            {/* Mileage */}
            <div className="space-y-2">
              <Label htmlFor="mileage">
                Kilometraža <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                placeholder="npr. 45000"
                value={formData.mileage}
                onChange={handleChange}
                className={errors.mileage ? 'border-red-500' : ''}
              />
              {errors.mileage && (
                <p className="text-sm text-red-500">{errors.mileage}</p>
              )}
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <Label htmlFor="cost">Cijena (BAM)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                placeholder="npr. 250.00"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>

            {/* Next Service KM */}
            <div className="space-y-2">
              <Label htmlFor="nextServiceKm">Sljedeći servis (km)</Label>
              <Input
                id="nextServiceKm"
                name="nextServiceKm"
                type="number"
                placeholder="npr. 55000"
                value={formData.nextServiceKm}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Napomene</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Dodatne napomene o servisu..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
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
              {submitting ? 'Zapisivanje...' : 'Zabilježi servis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
