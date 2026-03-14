"use client"

import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  X,
  Package,
  MapPin,
  Building2,
  FileText,
  Calculator,
  ShieldCheck,
  Truck,
  Clock,
  Edit,
  Trash2,
  CircleDot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { RouteDisplay, CountryFlag } from "@/components/shared/country-flag"
import type { Shipment, ShipmentStatus } from "@/lib/types"
import { CURRENCIES } from "@/lib/constants"

interface ShipmentDetailPanelProps {
  shipment: Shipment | null
  open: boolean
  onClose: () => void
  onEdit: (shipment: Shipment) => void
  onDelete: (shipment: Shipment) => void
}

const statusTimeline = [
  { status: "pending_clearance", label: "Pending Clearance", icon: Clock },
  { status: "in_transit", label: "In Transit", icon: Truck },
  { status: "cleared", label: "Customs Cleared", icon: ShieldCheck },
  { status: "delivered", label: "Delivered", icon: Package },
]

export function ShipmentDetailPanel({
  shipment,
  open,
  onClose,
  onEdit,
  onDelete,
}: ShipmentDetailPanelProps) {
  if (!shipment) return null

  const formatCurrency = (value: number, currency: string = "USD") => {
    const curr = CURRENCIES.find((c) => c.code === currency)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM dd, yyyy")
  }

  const getStatusIndex = (status: ShipmentStatus) => {
    if (status === "flagged") return -1
    return statusTimeline.findIndex((s) => s.status === status)
  }

  const currentStatusIndex = getStatusIndex(shipment.status)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Package className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="font-mono text-lg font-semibold text-indigo-500">
                      {shipment.reference_no}
                    </h2>
                    <p className="text-sm text-muted-foreground">Shipment Details</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(shipment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => onDelete(shipment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Status & Route */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={shipment.status as "in_transit" | "pending_clearance" | "cleared" | "flagged" | "delivered"} />
                  <StatusBadge
                    status={shipment.compliance_status as "compliant" | "review_required" | "flagged"}
                    variant="compliance"
                  />
                </div>

                <div className="flex items-center justify-center py-4">
                  <RouteDisplay
                    origin={shipment.origin_country}
                    destination={shipment.destination_country}
                    size="lg"
                  />
                </div>
              </div>

              {/* Status Timeline */}
              {shipment.status !== "flagged" && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Shipment Progress</h3>
                  <div className="relative">
                    {statusTimeline.map((step, index) => {
                      const isCompleted = index <= currentStatusIndex
                      const isCurrent = index === currentStatusIndex
                      const Icon = step.icon

                      return (
                        <div key={step.status} className="flex items-start gap-3 mb-4 last:mb-0">
                          <div className="relative flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                isCurrent
                                  ? "border-indigo-500 bg-indigo-500 text-white"
                                  : isCompleted
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-border bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            {index < statusTimeline.length - 1 && (
                              <div
                                className={`absolute top-8 w-0.5 h-6 ${
                                  isCompleted ? "bg-emerald-500" : "bg-border"
                                }`}
                              />
                            )}
                          </div>
                          <div className="pt-1">
                            <p className={`text-sm font-medium ${isCurrent ? "text-indigo-500" : ""}`}>
                              {step.label}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Product Information
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Product</span>
                    <span className="text-sm font-medium">{shipment.product_name}</span>
                  </div>
                  {shipment.hs_code && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">HS Code</span>
                      <span className="text-sm font-mono text-indigo-500">{shipment.hs_code}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Declared Value</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(Number(shipment.declared_value), shipment.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight</span>
                    <span className="text-sm font-medium">{shipment.weight_kg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Incoterm</span>
                    <span className="text-sm font-medium">{shipment.incoterm}</span>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Parties
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Shipper</p>
                    <p className="text-sm font-medium">{shipment.shipper_name}</p>
                    <div className="mt-2">
                      <CountryFlag countryCode={shipment.origin_country} showName size="sm" />
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Consignee</p>
                    <p className="text-sm font-medium">{shipment.consignee_name}</p>
                    <div className="mt-2">
                      <CountryFlag countryCode={shipment.destination_country} showName size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics */}
              {(shipment.customs_broker || shipment.freight_forwarder) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Logistics
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {shipment.customs_broker && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Customs Broker</span>
                        <span className="text-sm font-medium">{shipment.customs_broker}</span>
                      </div>
                    )}
                    {shipment.freight_forwarder && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Freight Forwarder</span>
                        <span className="text-sm font-medium">{shipment.freight_forwarder}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Duty & Taxes */}
              {(shipment.duty_amount || shipment.tax_amount) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    Duty & Taxes
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {shipment.duty_amount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duty Amount</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(Number(shipment.duty_amount), shipment.currency)}
                        </span>
                      </div>
                    )}
                    {shipment.tax_amount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tax Amount</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(Number(shipment.tax_amount), shipment.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Timeline
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">{formatDate(shipment.created_at)}</span>
                  </div>
                  {shipment.estimated_delivery && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Est. Delivery</span>
                      <span className="text-sm font-medium">{formatDate(shipment.estimated_delivery)}</span>
                    </div>
                  )}
                  {shipment.actual_delivery && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actual Delivery</span>
                      <span className="text-sm font-medium">{formatDate(shipment.actual_delivery)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {shipment.notes && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Notes
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{shipment.notes}</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-sm font-medium">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-1" />
                    Documents
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Calculator className="h-4 w-4 mr-1" />
                    Duty Calc
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Screen
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
