"use client"

import { ZoomInIcon } from "@heroicons/react/solid"

interface PhotoCardProps {
  src: string
  alt: string
  label: string
  loading?: boolean
  onZoom?: () => void
  className?: string
}

export function PhotoCard({ src, alt, label, loading, onZoom, className = "h-64" }: PhotoCardProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div
        className="relative group/photo rounded-lg overflow-hidden cursor-pointer border border-border hover:border-primary hover:shadow-md transition-all duration-300"
        onClick={onZoom}
      >
        {loading ? (
          <div className={`${className} flex items-center justify-center bg-muted`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <img src={src || "/placeholder.svg"} alt={alt} className={`w-full ${className} object-contain bg-muted`} />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white">
                <ZoomInIcon className="w-10 h-10" />
                <span className="text-sm font-medium">Klikni za uvećanje</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
