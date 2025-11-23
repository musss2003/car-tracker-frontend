import type React from "react"
import { cn } from "@/shared/lib/utils"

interface FormSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * FormSection Component
 *
 * A reusable container for form sections with consistent styling.
 * Includes an optional icon and title header.
 *
 * @example
 * <FormSection title="Customer Information" icon={<User className="w-5 h-5" />}>
 *   <FormField label="Name" id="name">
 *     <Input id="name" value={name} onChange={handleChange} />
 *   </FormField>
 * </FormSection>
 */
export const FormSection: React.FC<FormSectionProps> = ({ title, icon, children, className }) => {
  return (
    <div className={cn("bg-background border rounded-lg p-6 space-y-4", className)}>
      <h2 className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}