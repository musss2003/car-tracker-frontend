import { Button } from '@/shared/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ResourceActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  additionalActions?: React.ReactNode;
  editLabel?: string;
  deleteLabel?: string;
  size?: 'sm' | 'default';
  showLabels?: boolean;
}

export const ResourceActions = ({
  onEdit,
  onDelete,
  additionalActions,
  editLabel = 'Uredi',
  deleteLabel = 'Obriši',
  size = 'sm',
  showLabels = false,
}: ResourceActionsProps) => {
  return (
    <div className="flex gap-2 items-center flex-shrink-0">
      {additionalActions}

      <Button
        variant="outline"
        size={size}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="gap-2"
      >
        <Edit className="w-4 h-4" />
        {showLabels && <span>{editLabel}</span>}
      </Button>

      <Button
        variant="outline"
        size={size}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
        {showLabels && <span>{deleteLabel}</span>}
      </Button>
    </div>
  );
};
