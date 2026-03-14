"use client"

import { COUNTRIES } from "@/lib/constants"

interface CountryFlagProps {
  countryCode: string
  showName?: boolean
  className?: string
}

export function CountryFlag({
  countryCode,
  showName = true,
  className,
}: CountryFlagProps) {
  const country = COUNTRIES.find((c) => c.code === countryCode)

  if (!country) {
    return <span className={className}>{countryCode}</span>
  }

  return (
    <span className={className}>
      <span className="mr-1.5">{country.flag}</span>
      {showName && <span>{country.name}</span>}
    </span>
  )
}

interface RouteDisplayProps {
  origin: string
  destination: string
  className?: string
}

export function RouteDisplay({ origin, destination, className }: RouteDisplayProps) {
  const originCountry = COUNTRIES.find((c) => c.code === origin)
  const destCountry = COUNTRIES.find((c) => c.code === destination)

  return (
    <span className={className}>
      <span>{originCountry?.flag || origin}</span>
      <span className="mx-1.5 text-muted-foreground">→</span>
      <span>{destCountry?.flag || destination}</span>
    </span>
  )
}
