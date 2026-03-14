"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Package, MapPin, FileText, Truck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CountrySelect } from "@/components/shared/country-select"
import { createShipmentSchema, type CreateShipmentInput } from "@/lib/validations"
import { INCOTERMS, CURRENCIES } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"

interface CreateShipmentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: CreateShipmentInput & { id: string }
}

export function CreateShipmentModal({ open, onClose, onSuccess, editData }: CreateShipmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!editData

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateShipmentInput>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      reference_no: "",
      origin_country: "",
      destination_country: "",
      shipper_name: "",
      consignee_name: "",
      product_name: "",
      hs_code: "",
      declared_value: 0,
      currency: "USD",
      weight_kg: 0,
      incoterm: "FOB",
      customs_broker: "",
      freight_forwarder: "",
      estimated_delivery: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (editData) {
      reset(editData)
    } else {
      // Generate a new reference number
      const refNo = `TG-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`
      reset({
        reference_no: refNo,
        origin_country: "IN",
        destination_country: "",
        shipper_name: "",
        consignee_name: "",
        product_name: "",
        hs_code: "",
        declared_value: 0,
        currency: "USD",
        weight_kg: 0,
        incoterm: "FOB",
        customs_broker: "",
        freight_forwarder: "",
        estimated_delivery: "",
        notes: "",
      })
    }
  }, [editData, reset, open])

  const onSubmit = async (data: CreateShipmentInput) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in")
        return
      }

      if (isEditing && editData) {
        const { error } = await supabase
          .from("shipments")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editData.id)

        if (error) throw error
        toast.success("Shipment updated successfully")
      } else {
        const { error } = await supabase
          .from("shipments")
          .insert({
            ...data,
            user_id: user.id,
            status: "pending_clearance",
            compliance_status: "compliant",
          })

        if (error) throw error
        toast.success("Shipment created successfully")
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving shipment:", error)
      toast.error("Failed to save shipment")
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Package className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {isEditing ? "Edit Shipment" : "Create New Shipment"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isEditing ? "Update shipment details" : "Track a new international shipment"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
                {/* Section 1: Shipment Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Shipment Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reference_no">Reference Number</Label>
                      <Input
                        id="reference_no"
                        {...register("reference_no")}
                        className={errors.reference_no ? "border-red-500" : ""}
                        disabled
                      />
                      {errors.reference_no && (
                        <p className="text-sm text-red-500">{errors.reference_no.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incoterm">Incoterm</Label>
                      <select
                        id="incoterm"
                        {...register("incoterm")}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {INCOTERMS.map((term) => (
                          <option key={term} value={term}>
                            {term}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipper_name">Shipper Name</Label>
                      <Input
                        id="shipper_name"
                        placeholder="Tata Global Exports Pvt Ltd"
                        {...register("shipper_name")}
                        className={errors.shipper_name ? "border-red-500" : ""}
                      />
                      {errors.shipper_name && (
                        <p className="text-sm text-red-500">{errors.shipper_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consignee_name">Consignee Name</Label>
                      <Input
                        id="consignee_name"
                        placeholder="Global Pharma Inc"
                        {...register("consignee_name")}
                        className={errors.consignee_name ? "border-red-500" : ""}
                      />
                      {errors.consignee_name && (
                        <p className="text-sm text-red-500">{errors.consignee_name.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Route */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Route
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Origin Country</Label>
                      <Controller
                        name="origin_country"
                        control={control}
                        render={({ field }) => (
                          <CountrySelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select origin"
                          />
                        )}
                      />
                      {errors.origin_country && (
                        <p className="text-sm text-red-500">{errors.origin_country.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Destination Country</Label>
                      <Controller
                        name="destination_country"
                        control={control}
                        render={({ field }) => (
                          <CountrySelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select destination"
                          />
                        )}
                      />
                      {errors.destination_country && (
                        <p className="text-sm text-red-500">{errors.destination_country.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Product & Compliance */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    Product & Compliance
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="product_name">Product Name</Label>
                      <Input
                        id="product_name"
                        placeholder="Pharmaceutical Tablets"
                        {...register("product_name")}
                        className={errors.product_name ? "border-red-500" : ""}
                      />
                      {errors.product_name && (
                        <p className="text-sm text-red-500">{errors.product_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hs_code">HS Code</Label>
                      <Input
                        id="hs_code"
                        placeholder="3004.90"
                        {...register("hs_code")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight_kg">Weight (kg)</Label>
                      <Input
                        id="weight_kg"
                        type="number"
                        step="0.01"
                        placeholder="100"
                        {...register("weight_kg", { valueAsNumber: true })}
                        className={errors.weight_kg ? "border-red-500" : ""}
                      />
                      {errors.weight_kg && (
                        <p className="text-sm text-red-500">{errors.weight_kg.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="declared_value">Declared Value</Label>
                      <Input
                        id="declared_value"
                        type="number"
                        step="0.01"
                        placeholder="50000"
                        {...register("declared_value", { valueAsNumber: true })}
                        className={errors.declared_value ? "border-red-500" : ""}
                      />
                      {errors.declared_value && (
                        <p className="text-sm text-red-500">{errors.declared_value.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        {...register("currency")}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {CURRENCIES.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Logistics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    Logistics
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customs_broker">Customs Broker</Label>
                      <Input
                        id="customs_broker"
                        placeholder="Optional"
                        {...register("customs_broker")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freight_forwarder">Freight Forwarder</Label>
                      <Input
                        id="freight_forwarder"
                        placeholder="Optional"
                        {...register("freight_forwarder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
                      <Input
                        id="estimated_delivery"
                        type="date"
                        {...register("estimated_delivery")}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes..."
                        {...register("notes")}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      isEditing ? "Update Shipment" : "Create Shipment"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
