import type { ReactNode } from "react"

interface DetailFieldProps {
  label: string
  value: string | number | ReactNode
  valueClassName?: string
}

export function DetailField({ label, value, valueClassName = "font-medium text-sm" }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {typeof value === "string" || typeof value === "number" ? <p className={valueClassName}>{value}</p> : value}
    </div>
  )
}
