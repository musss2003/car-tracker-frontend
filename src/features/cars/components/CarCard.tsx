import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  EyeIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/solid';
import type { CarWithStatus } from '../types/car.types';

interface CarCardProps {
  car: CarWithStatus;
  photoUrl?: string;
  onViewDetails: (car: CarWithStatus) => void;
  onViewAvailability: (car: CarWithStatus) => void;
  onEdit: (car: CarWithStatus) => void;
  onDelete: (car: CarWithStatus) => void;
}

const CarPhotoPlaceholder = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <svg
        className="w-16 h-16 mx-auto mb-2 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-sm font-medium">Nema slike</p>
    </div>
  </div>
);

const ColorIndicator = ({ color }: { color?: string }) => {
  if (!color) return null;

  return (
    <div className="absolute bottom-3 left-3">
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full border-2 border-white shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: color }}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
      </div>
    </div>
  );
};

const StatusBadge = ({ isBusy }: { isBusy: boolean }) => (
  <Badge
    variant={isBusy ? 'destructive' : 'default'}
    className={
      isBusy
        ? 'bg-red-500 text-white'
        : 'bg-green-500 text-white hover:bg-green-600'
    }
  >
    {isBusy ? 'Zauzeto' : 'Dostupno'}
  </Badge>
);

interface DetailCardProps {
  label: string;
  value: string;
  isPrimary?: boolean;
}

const DetailCard = ({ label, value, isPrimary = false }: DetailCardProps) => (
  <div
    className={
      isPrimary
        ? 'bg-primary/5 rounded-lg p-3 col-span-2 border border-primary/20'
        : 'bg-muted/50 rounded-lg p-3'
    }
  >
    <span
      className={`text-xs font-medium uppercase tracking-wide ${
        isPrimary ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      {label}
    </span>
    <p
      className={`mt-1 ${
        isPrimary
          ? 'font-bold text-lg text-primary'
          : 'font-semibold text-sm text-foreground'
      }`}
    >
      {value}
    </p>
  </div>
);

export const CarCard = ({
  car,
  photoUrl,
  onViewDetails,
  onViewAvailability,
  onEdit,
  onDelete,
}: CarCardProps) => {
  return (
    <Card className="group relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/50">
      {/* Car Photo Section */}
      <div className="relative h-48 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${car.manufacturer} ${car.model}`}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <CarPhotoPlaceholder />
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge isBusy={car.isBusy} />
        </div>

        {/* Color Indicator */}
        <ColorIndicator color={car.color} />
      </div>

      {/* Card Content */}
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-bold text-lg leading-tight truncate">
            {car.manufacturer || 'N/A'}
          </h3>
          <p className="text-base font-medium text-foreground/80 truncate">
            {car.model || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Godina: {car.year || 'N/A'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <DetailCard
            label="Registarska oznaka"
            value={car.licensePlate || 'N/A'}
          />
          <DetailCard
            label="Kilometraža"
            value={car.mileage ? `${car.mileage} km` : 'N/A'}
          />
          <DetailCard
            label="Cijena po danu"
            value={car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A'}
            isPrimary
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 shadow-sm"
            onClick={() => onViewDetails(car)}
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Detalji
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-sm"
            onClick={() => onViewAvailability(car)}
          >
            <CalendarIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-sm"
            onClick={() => onEdit(car)}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-sm hover:bg-destructive hover:text-destructive-foreground"
            disabled={car.isBusy}
            onClick={() => onDelete(car)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
