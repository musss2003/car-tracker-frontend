import { useState } from 'react';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { createCarIssueReport } from '../../services/carIssueReportService';

interface ReportIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  onSuccess?: () => void;
}

export function ReportIssueModal({
  open,
  onOpenChange,
  carId,
  onSuccess,
}: ReportIssueModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const handleSeverityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      severity: value as 'low' | 'medium' | 'high',
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Opis kvara je obavezan';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Opis mora biti duži od 10 karaktera';
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
        description: formData.description.trim(),
        severity: formData.severity,
        status: 'open' as const,
      };

      await createCarIssueReport(payload);
      toast.success('Kvar je uspješno prijavljen');

      // Reset form
      setFormData({
        description: '',
        severity: 'medium',
      });
      setErrors({});

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Greška pri prijavljivanju kvara');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        description: '',
        severity: 'medium',
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-yellow-600';
      case 'medium':
        return 'text-orange-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'Nizak';
      case 'medium':
        return 'Srednji';
      case 'high':
        return 'Visok';
      default:
        return severity;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle>Prijavi kvar</DialogTitle>
              <DialogDescription>
                Brzo prijavite problem sa vozilom
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">
                Ozbiljnost kvara <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.severity}
                onValueChange={handleSeverityChange}
              >
                <SelectTrigger>
                  <SelectValue>
                    <span className={getSeverityColor(formData.severity)}>
                      {getSeverityLabel(formData.severity)}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="text-yellow-600">🟡 Nizak</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="text-orange-600">🟠 Srednji</span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="text-red-600">🔴 Visok</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.severity === 'low' &&
                  'Manji problem koji ne utiče na voznju'}
                {formData.severity === 'medium' &&
                  'Problem koji zahtijeva pažnju uskoro'}
                {formData.severity === 'high' &&
                  'Kritičan problem - vozilo nije sigurno za korištenje'}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Opis problema <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detaljan opis problema sa vozilom..."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Navedite simptome, kada se problem javlja, i sve relevantne
                detalje
              </p>
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
            <Button
              type="submit"
              disabled={submitting}
              variant={formData.severity === 'high' ? 'destructive' : 'default'}
            >
              {submitting ? 'Prijavljivanje...' : 'Prijavi kvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
