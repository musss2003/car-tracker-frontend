import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationCircleIcon,
  BanIcon,
} from '@heroicons/react/solid';
import { BookingStatus } from '../types/booking.types';

// ─── Status display config ────────────────────────────────────────────────────
interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  [BookingStatus.PENDING]: {
    label: 'Na čekanju',
    className: 'bg-yellow-500',
    icon: <ClockIcon className="w-4 h-4" />,
  },
  [BookingStatus.CONFIRMED]: {
    label: 'Potvrđeno',
    className: 'bg-blue-500',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  [BookingStatus.CANCELLED]: {
    label: 'Otkazano',
    className: 'bg-red-500',
    icon: <BanIcon className="w-4 h-4" />,
  },
  [BookingStatus.CONVERTED]: {
    label: 'Pretvoreno u ugovor',
    className: 'bg-purple-500',
    icon: <DocumentTextIcon className="w-4 h-4" />,
  },
  [BookingStatus.EXPIRED]: {
    label: 'Isteklo',
    className: 'bg-gray-500',
    icon: <ExclamationCircleIcon className="w-4 h-4" />,
  },
};

// ─── View-only statuses ───────────────────────────────────────────────────────
const VIEW_ONLY_STATUSES: BookingStatus[] = [
  BookingStatus.CANCELLED,
  BookingStatus.CONVERTED,
  BookingStatus.EXPIRED,
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface BookingActionsProps {
  status: BookingStatus;
  isActionLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onConvert: () => void;
  onEdit: () => void;
}

export const BookingActions: React.FC<BookingActionsProps> = ({
  status,
  isActionLoading,
  onConfirm,
  onCancel,
  onConvert,
  onEdit,
}) => {
  const { className, icon, label } = BOOKING_STATUS_CONFIG[status];
  const isViewOnly = VIEW_ONLY_STATUSES.includes(status);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Status badge — always visible */}
      <Badge className={`${className} text-white gap-2 px-3 py-1`}>
        {icon}
        {label}
      </Badge>

      {/* Confirm — pending only */}
      {status === BookingStatus.PENDING && (
        <Button
          variant="default"
          size="sm"
          onClick={onConfirm}
          disabled={isActionLoading}
          className="gap-2"
        >
          <CheckCircleIcon className="w-4 h-4" />
          Potvrdi
        </Button>
      )}

      {/* Convert to contract — confirmed only */}
      {status === BookingStatus.CONFIRMED && (
        <Button
          variant="default"
          size="sm"
          onClick={onConvert}
          disabled={isActionLoading}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Pretvori u ugovor
        </Button>
      )}

      {/* Edit — pending or confirmed */}
      {!isViewOnly && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={isActionLoading}
          className="gap-2"
        >
          <PencilIcon className="w-4 h-4" />
          Uredi
        </Button>
      )}

      {/* Cancel — pending or confirmed */}
      {!isViewOnly && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onCancel}
          disabled={isActionLoading}
          className="gap-2"
        >
          <TrashIcon className="w-4 h-4" />
          Otkaži
        </Button>
      )}
    </div>
  );
};
