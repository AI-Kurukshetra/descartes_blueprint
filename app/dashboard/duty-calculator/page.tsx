"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calculator,
  History,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Banknote,
  Percent,
  Package,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import CountUp from "react-countup"
import { format } from "date-fns"

import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { CountrySelect } from "@/components/shared/country-select"
import { RouteDisplay } from "@/components/shared/country-flag"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { dutyCalculateSchema, type DutyCalculateInput } from "@/lib/validations"
import { INCOTERMS, CURRENCIES, DUTY_RATES, FTA_AGREEMENTS } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import type { DutyCalculation } from "@/lib/types"

interface CalculationResult {
  declaredValue: number
  currency: string
  dutyRate: number
  dutyAmount: number
  vatRate: number
  vatAmount: number
  otherFees: number
  totalLandedCost: number
  ftaApplicable: boolean
  ftaName: string | null
  standardDutyRate: number
  savings: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export default function DutyCalculatorPage() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [history, setHistory] = useState<DutyCalculation[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [formData, setFormData] = useState<DutyCalculateInput | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<DutyCalculateInput>({
    resolver: zodResolver(dutyCalculateSchema),
    defaultValues: {
      origin_country: "IN",
      destination_country: "",
      hs_code: "",
      product_description: "",
      declared_value: 0,
      currency: "USD",
      quantity: 1,
      weight_kg: 0,
      incoterm: "FOB",
    },
  })

  const watchedCurrency = watch("currency")

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    setLoadingHistory(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("duty_calculations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15)

    if (error) {
      console.error("Error fetching history:", error)
    } else {
      setHistory(data || [])
    }
    setLoadingHistory(false)
  }

  const calculateDuties = (data: DutyCalculateInput): CalculationResult => {
    const routeKey = `${data.origin_country}-${data.destination_country}`
    const hsPrefix = data.hs_code.substring(0, 4)

    // Get duty rates
    const routeRates = DUTY_RATES[routeKey] || DUTY_RATES["IN-US"] || {}
    const productRates = routeRates[hsPrefix] || routeRates["default"] || { rate: 5, vat: 10 }

    let dutyRate = productRates.rate
    let vatRate = productRates.vat
    let ftaApplicable = false
    let ftaName: string | null = null
    let standardDutyRate = dutyRate
    let savings = 0

    // Check for FTA benefits
    const fta = FTA_AGREEMENTS[routeKey]
    if (fta) {
      ftaApplicable = true
      ftaName = fta.name
      standardDutyRate = dutyRate
      dutyRate = Math.max(0, dutyRate - fta.savings)
      savings = (standardDutyRate - dutyRate) * data.declared_value / 100
    }

    // Calculate amounts
    const dutyAmount = (data.declared_value * dutyRate) / 100
    const cifValue = data.declared_value + dutyAmount // Simplified CIF
    const vatAmount = (cifValue * vatRate) / 100
    const otherFees = Math.min(data.declared_value * 0.005, 500) // 0.5% up to $500

    const totalLandedCost = data.declared_value + dutyAmount + vatAmount + otherFees

    return {
      declaredValue: data.declared_value,
      currency: data.currency,
      dutyRate,
      dutyAmount,
      vatRate,
      vatAmount,
      otherFees,
      totalLandedCost,
      ftaApplicable,
      ftaName,
      standardDutyRate,
      savings,
    }
  }

  const onSubmit = async (data: DutyCalculateInput) => {
    setIsCalculating(true)
    setResult(null)
    setFormData(data)

    // Simulate calculation delay for animation
    await new Promise((resolve) => setTimeout(resolve, 800))

    const calculationResult = calculateDuties(data)
    setResult(calculationResult)
    setIsCalculating(false)
  }

  const handleSaveCalculation = async () => {
    if (!result || !formData) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("You must be logged in")
      return
    }

    const { error } = await supabase.from("duty_calculations").insert({
      user_id: user.id,
      origin_country: formData.origin_country,
      destination_country: formData.destination_country,
      hs_code: formData.hs_code,
      product_description: formData.product_description || "",
      declared_value: formData.declared_value,
      currency: formData.currency,
      duty_rate: result.dutyRate,
      duty_amount: result.dutyAmount,
      vat_rate: result.vatRate,
      vat_amount: result.vatAmount,
      other_fees: result.otherFees,
      total_landed_cost: result.totalLandedCost,
      fta_applicable: result.ftaApplicable,
      fta_name: result.ftaName,
      savings_vs_standard: result.savings,
    })

    if (error) {
      toast.error("Failed to save calculation")
    } else {
      toast.success("Calculation saved")
      fetchHistory()
    }
  }

  const handleRecalculate = () => {
    setResult(null)
    setFormData(null)
  }

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getCurrencySymbol = (code: string) => {
    const curr = CURRENCIES.find((c) => c.code === code)
    return curr?.symbol || "$"
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Duty Calculator</h1>
            <p className="text-muted-foreground">
              Calculate landed costs for any shipment
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="mr-2 h-4 w-4" />
            {showHistory ? "Hide History" : "View History"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Calculator className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <CardTitle>Calculate Duties & Taxes</CardTitle>
                  <CardDescription>
                    Enter shipment details to calculate landed costs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Route */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origin Country <span className="text-red-500">*</span></Label>
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
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Country <span className="text-red-500">*</span></Label>
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

                {/* HS Code & Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hs_code">HS Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="hs_code"
                      placeholder="3004.90"
                      {...register("hs_code")}
                      className={errors.hs_code ? "border-red-500" : ""}
                    />
                    {errors.hs_code && (
                      <p className="text-sm text-red-500">{errors.hs_code.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_description">Product Description</Label>
                    <Input
                      id="product_description"
                      placeholder="Pharmaceutical tablets"
                      {...register("product_description")}
                    />
                  </div>
                </div>

                {/* Value & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="declared_value">Declared Value <span className="text-red-500">*</span></Label>
                    <Input
                      id="declared_value"
                      type="number"
                      step="0.01"
                      placeholder="10000"
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
                          {curr.symbol} {curr.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantity & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="1"
                      {...register("quantity", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg) <span className="text-red-500">*</span></Label>
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
                </div>

                {/* Incoterm */}
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

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                      </motion.div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Duties
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Card */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/50 bg-card/50 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Banknote className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <CardTitle>Landed Cost Breakdown</CardTitle>
                          <CardDescription>
                            {formData && (
                              <RouteDisplay
                                origin={formData.origin_country}
                                destination={formData.destination_country}
                              />
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cost Breakdown */}
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="space-y-3"
                    >
                      {/* Declared Value */}
                      <motion.div
                        variants={item}
                        className="flex items-center justify-between py-2 border-b border-border"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Declared Value</span>
                        </div>
                        <span className="font-medium">
                          <CountUp
                            end={result.declaredValue}
                            duration={1}
                            prefix={getCurrencySymbol(result.currency)}
                            decimals={2}
                            separator=","
                          />
                        </span>
                      </motion.div>

                      {/* Duty */}
                      <motion.div
                        variants={item}
                        className="flex items-center justify-between py-2 border-b border-border"
                      >
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Duty ({result.dutyRate}%)
                            {result.ftaApplicable && (
                              <Badge variant="outline" className="ml-2 text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                FTA Rate
                              </Badge>
                            )}
                          </span>
                        </div>
                        <span className="font-medium">
                          <CountUp
                            end={result.dutyAmount}
                            duration={1}
                            prefix={getCurrencySymbol(result.currency)}
                            decimals={2}
                            separator=","
                          />
                        </span>
                      </motion.div>

                      {/* VAT/GST */}
                      <motion.div
                        variants={item}
                        className="flex items-center justify-between py-2 border-b border-border"
                      >
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">VAT/GST ({result.vatRate}%)</span>
                        </div>
                        <span className="font-medium">
                          <CountUp
                            end={result.vatAmount}
                            duration={1}
                            prefix={getCurrencySymbol(result.currency)}
                            decimals={2}
                            separator=","
                          />
                        </span>
                      </motion.div>

                      {/* Other Fees */}
                      <motion.div
                        variants={item}
                        className="flex items-center justify-between py-2 border-b border-border"
                      >
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Other Fees (handling, inspection)</span>
                        </div>
                        <span className="font-medium">
                          <CountUp
                            end={result.otherFees}
                            duration={1}
                            prefix={getCurrencySymbol(result.currency)}
                            decimals={2}
                            separator=","
                          />
                        </span>
                      </motion.div>

                      {/* Total */}
                      <motion.div
                        variants={item}
                        className="flex items-center justify-between py-3 bg-muted/30 rounded-lg px-3 mt-2"
                      >
                        <span className="font-semibold">Total Landed Cost</span>
                        <span className="text-2xl font-bold text-indigo-500">
                          <CountUp
                            end={result.totalLandedCost}
                            duration={1.5}
                            prefix={getCurrencySymbol(result.currency)}
                            decimals={2}
                            separator=","
                          />
                        </span>
                      </motion.div>
                    </motion.div>

                    {/* FTA Benefits */}
                    {result.ftaApplicable && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-emerald-500">
                              FTA Available — {result.ftaName}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Reduced rate: {result.dutyRate}% (standard: {result.standardDutyRate}%)
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <TrendingDown className="h-4 w-4 text-emerald-500" />
                              <span className="text-lg font-bold text-emerald-500">
                                <CountUp
                                  end={result.savings}
                                  duration={1}
                                  prefix={getCurrencySymbol(result.currency)}
                                  decimals={2}
                                  separator=","
                                />
                              </span>
                              <span className="text-sm text-muted-foreground">saved</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleSaveCalculation}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save Calculation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRecalculate}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        New Calculation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-border/50 bg-card/50 h-full flex items-center justify-center min-h-[500px]">
                  <div className="text-center p-8">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
                        <Calculator className="h-8 w-8 text-indigo-500/50" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Calculate</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Enter your shipment details on the left to calculate duties, taxes, and total landed cost.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Calculation History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Calculation History</CardTitle>
                  <CardDescription>Your recent duty calculations</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <EmptyState
                      icon={Calculator}
                      title="No calculations yet"
                      description="Saved calculations will appear here."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Route</TableHead>
                            <TableHead>HS Code</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">Duty</TableHead>
                            <TableHead className="text-right">Total Cost</TableHead>
                            <TableHead>FTA</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {history.map((calc) => (
                            <TableRow
                              key={calc.id}
                              className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                            >
                              <TableCell>
                                <RouteDisplay
                                  origin={calc.origin_country}
                                  destination={calc.destination_country}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-indigo-500">
                                {calc.hs_code}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(Number(calc.declared_value), calc.currency)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(Number(calc.duty_amount), calc.currency)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(Number(calc.total_landed_cost), calc.currency)}
                              </TableCell>
                              <TableCell>
                                {calc.fta_applicable ? (
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Yes
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(calc.created_at), "MMM dd, yyyy")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
