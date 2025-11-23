import type React from "react"

import { Save, X } from "lucide-react"
import { Button } from "./button"

interface FormActionsProps {
  onCancel: () => void
  onSave?: () => void
  saveLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  showSave?: boolean
  additionalActions?: React.ReactNode
}

export function FormActions({
  onCancel,
  onSave,
  saveLabel = "Sačuvaj",
  cancelLabel = "Otkaži",
  isSubmitting = false,
  showSave = true,
  additionalActions,
}: FormActionsProps) {
  return (
    <div className="flex-none px-6 py-4 bg-card border-t sticky bottom-0 z-10 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="gap-2 bg-transparent"
          >
            <X className="w-4 h-4" />
            {cancelLabel}
          </Button>
          {additionalActions}
        </div>
        {showSave && (
          <Button type="submit" onClick={onSave} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Čuvanje...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saveLabel}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}