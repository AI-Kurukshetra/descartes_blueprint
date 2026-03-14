"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { RiskLevel } from "@/lib/types"

const riskConfig: Record<RiskLevel, { label: string; className: string; pulse?: boolean }> = {
  none: {
    label: "None",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  low: {
    label: "Low",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  high: {
    label: "High",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  critical: {
    label: "Critical",
    className: "bg-red-900/20 text-red-500 border-red-500/30",
    pulse: true,
  },
}

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level]

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.className,
        config.pulse && "animate-pulse",
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
