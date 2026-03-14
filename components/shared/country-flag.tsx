"use client"

import { cn } from "@/lib/utils"
import { COUNTRIES } from "@/lib/constants"

interface CountryFlagProps {
  countryCode: string
  showName?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function CountryFlag({
  countryCode,
  showName = true,
  className,
  size = "md",
}: CountryFlagProps) {
  const country = COUNTRIES.find((c) => c.code === countryCode)

  if (!country) {
    return <span className={className}>{countryCode}</span>
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <span className={cn("flex items-center gap-1.5", sizeClasses[size], className)}>
      <span className={size === "lg" ? "text-2xl" : ""}>{country.flag}</span>
      {showName && <span>{country.name}</span>}
    </span>
  )
}

interface RouteDisplayProps {
  origin: string
  destination: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function RouteDisplay({ origin, destination, className, size = "md" }: RouteDisplayProps) {
  const originCountry = COUNTRIES.find((c) => c.code === origin)
  const destCountry = COUNTRIES.find((c) => c.code === destination)

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }

  const flagSizes = {
    sm: "",
    md: "text-lg",
    lg: "text-3xl",
  }

  return (
    <span className={cn("flex items-center", sizeClasses[size], className)}>
      <span className={flagSizes[size]}>{originCountry?.flag || origin}</span>
      {size === "lg" && originCountry && (
        <span className="ml-2 text-sm text-muted-foreground">{originCountry.name}</span>
      )}
      <span className={cn("mx-2 text-muted-foreground", size === "lg" && "mx-4")}>→</span>
      <span className={flagSizes[size]}>{destCountry?.flag || destination}</span>
      {size === "lg" && destCountry && (
        <span className="ml-2 text-sm text-muted-foreground">{destCountry.name}</span>
      )}
    </span>
  )
}
