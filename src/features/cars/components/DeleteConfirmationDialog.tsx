import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  resourceName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  resourceName = 'ovaj zapis',
  confirmLabel = 'Obriši',
  cancelLabel = 'Otkaži',
}: DeleteConfirmationDialogProps) => {
  const defaultTitle = `Obrisati ${resourceName}?`;
  const defaultDescription = `Da li ste sigurni da želite obrisati ${resourceName}? Ova akcija se ne može poništiti.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
