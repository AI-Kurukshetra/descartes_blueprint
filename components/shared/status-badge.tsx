"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type StatusType =
  | "in_transit"
  | "pending_clearance"
  | "cleared"
  | "flagged"
  | "delivered"
  | "compliant"
  | "review_required"
  | "draft"
  | "generated"
  | "submitted"
  | "approved"
  | "pending"
  | "clear"
  | "match"
  | "possible_match"
  | "accepted"
  | "rejected"

const statusConfig: Record<
  StatusType,
  { label: string; className: string }
> = {
  // Shipment statuses
  in_transit: {
    label: "In Transit",
    className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  pending_clearance: {
    label: "Pending Clearance",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  cleared: {
    label: "Cleared",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  flagged: {
    label: "Flagged",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  // Compliance statuses
  compliant: {
    label: "Compliant",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  review_required: {
    label: "Review Required",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  // Document statuses
  draft: {
    label: "Draft",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
  generated: {
    label: "Generated",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  submitted: {
    label: "Submitted",
    className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  // Screening results
  clear: {
    label: "Clear",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  match: {
    label: "Match",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  possible_match: {
    label: "Possible Match",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  // Classification statuses
  accepted: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
}

interface StatusBadgeProps {
  status: StatusType
  className?: string
  variant?: "shipment" | "compliance" | "document" | "screening" | "classification"
}

export function StatusBadge({ status, className, variant }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
