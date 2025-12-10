import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CarWithStatus } from '../types/car.types';

interface CarPageHeaderProps {
  title: string;
  car: CarWithStatus | null;
  carId: string;
  actionLabel?: string;
  actionIcon?: React.ElementType;
  onActionClick?: () => void;
  additionalActions?: React.ReactNode;
  backPath?: string;
}

export const CarPageHeader = ({
  title,
  car,
  carId,
  actionLabel,
  actionIcon: ActionIcon,
  onActionClick,
  additionalActions,
  backPath,
}: CarPageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(`/cars/${carId}`);
    }
  };

  return (
    <div className="border-b bg-card">
      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {car && (
                <p className="text-sm text-muted-foreground mt-1">
                  {car.manufacturer} {car.model} - {car.licensePlate}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {additionalActions}
            {actionLabel && onActionClick && (
              <Button onClick={onActionClick} className="gap-2">
                {ActionIcon && <ActionIcon className="w-4 h-4" />}
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
