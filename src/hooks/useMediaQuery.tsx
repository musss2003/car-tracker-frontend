import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const media = window.matchMedia(query)

    const updateMatches = () => {
      setMatches(media.matches)
    }

    updateMatches()

    // Check for browser compatibility
    if (media.addEventListener) {
      media.addEventListener("change", updateMatches)
      return () => media.removeEventListener("change", updateMatches)
    } else {
      // For Safari and old browsers
      media.addListener(updateMatches)
      return () => media.removeListener(updateMatches)
    }
  }, [query])

  return matches
}
