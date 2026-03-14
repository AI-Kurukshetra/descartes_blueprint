"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  History,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import CountUp from "react-countup"

import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { CountrySelect } from "@/components/shared/country-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { hsClassifySchema, type HSClassifyInput } from "@/lib/validations"
import { createClient } from "@/lib/supabase/client"
import type { HSClassification } from "@/lib/types"
import { format } from "date-fns"

interface ClassificationResult {
  hsCode: string
  chapter: string
  description: string
  confidence: number
  reasoning: string
  tradeRestrictions: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function HSClassifierPage() {
  const [isClassifying, setIsClassifying] = useState(false)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [showReasoning, setShowReasoning] = useState(false)
  const [history, setHistory] = useState<HSClassification[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [productDescription, setProductDescription] = useState("")

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<HSClassifyInput>({
    resolver: zodResolver(hsClassifySchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      countryOfOrigin: "IN",
      intendedUse: "",
    },
  })

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    setLoadingHistory(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("hs_classifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching history:", error)
    } else {
      setHistory(data || [])
    }
    setLoadingHistory(false)
  }

  const onSubmit = async (data: HSClassifyInput) => {
    setIsClassifying(true)
    setResult(null)
    setProductDescription(data.productDescription)

    try {
      const response = await fetch("/api/classify-hs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Classification failed")
      }

      setResult(result.classification)
    } catch (error) {
      console.error("Classification error:", error)
      toast.error(error instanceof Error ? error.message : "Classification failed")
    } finally {
      setIsClassifying(false)
    }
  }

  const handleAccept = async () => {
    if (!result) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("You must be logged in")
      return
    }

    const { error } = await supabase.from("hs_classifications").insert({
      user_id: user.id,
      product_description: productDescription,
      suggested_hs_code: result.hsCode,
      hs_chapter: result.chapter,
      hs_description: result.description,
      confidence_score: result.confidence,
      reasoning: result.reasoning,
      status: "accepted",
    })

    if (error) {
      toast.error("Failed to save classification")
    } else {
      toast.success("Classification accepted and saved")
      fetchHistory()
      setResult(null)
      reset()
    }
  }

  const handleReclassify = () => {
    setResult(null)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "emerald"
    if (confidence >= 60) return "amber"
    return "red"
  }

  const getConfidenceColorClass = (confidence: number) => {
    if (confidence >= 80) return "bg-emerald-500"
    if (confidence >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  const getConfidenceTextClass = (confidence: number) => {
    if (confidence >= 80) return "text-emerald-500"
    if (confidence >= 60) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI HS Code Classifier</h1>
            <p className="text-muted-foreground">
              Classify products instantly using AI
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
          {/* Classifier Form */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Cpu className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <CardTitle>Classify Your Product</CardTitle>
                  <CardDescription>
                    Enter product details for AI-powered HS code classification
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Pharmaceutical Tablets"
                    {...register("productName")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productDescription">
                    Detailed Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="productDescription"
                    placeholder="Describe the product including materials, composition, manufacturing process, dimensions..."
                    rows={4}
                    {...register("productDescription")}
                    className={errors.productDescription ? "border-red-500" : ""}
                  />
                  {errors.productDescription && (
                    <p className="text-sm text-red-500">{errors.productDescription.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country of Origin <span className="text-red-500">*</span></Label>
                  <Controller
                    name="countryOfOrigin"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select country"
                      />
                    )}
                  />
                  {errors.countryOfOrigin && (
                    <p className="text-sm text-red-500">{errors.countryOfOrigin.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intendedUse">Intended Use (Optional)</Label>
                  <Input
                    id="intendedUse"
                    placeholder="e.g., Medical treatment, Industrial manufacturing"
                    {...register("intendedUse")}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isClassifying}
                >
                  {isClassifying ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Cpu className="mr-2 h-4 w-4" />
                      </motion.div>
                      Classifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Classify with AI
                    </>
                  )}
                </Button>
              </form>

              {/* Scanning Animation */}
              <AnimatePresence>
                {isClassifying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 relative"
                  >
                    <div className="rounded-lg bg-muted/50 p-6 overflow-hidden relative">
                      {/* Scanning line */}
                      <motion.div
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                        initial={{ top: 0 }}
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="text-center space-y-3">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex justify-center"
                        >
                          <Cpu className="h-12 w-12 text-indigo-500" />
                        </motion.div>
                        <p className="font-medium">AI is analyzing your product...</p>
                        <div className="flex justify-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-2 w-2 rounded-full bg-indigo-500"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Result Card */}
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
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <CardTitle>Classification Result</CardTitle>
                          <CardDescription>
                            AI-powered HS code recommendation
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* HS Code Display */}
                    <div className="text-center py-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Recommended HS Code</p>
                      <motion.p
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-mono font-bold text-indigo-500"
                      >
                        {result.hsCode}
                      </motion.p>
                      <p className="text-sm text-muted-foreground mt-2">{result.chapter}</p>
                    </div>

                    {/* Official Description */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Official Description</p>
                      <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                        {result.description}
                      </p>
                    </div>

                    {/* Confidence Score */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Classification Confidence</p>
                        <span className={`text-2xl font-bold ${getConfidenceTextClass(result.confidence)}`}>
                          <CountUp end={result.confidence} duration={1.5} />%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${getConfidenceColorClass(result.confidence)}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.confidence >= 80
                          ? "High confidence - recommended for use"
                          : result.confidence >= 60
                          ? "Moderate confidence - review recommended"
                          : "Low confidence - manual verification required"}
                      </p>
                    </div>

                    {/* AI Reasoning (Expandable) */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowReasoning(!showReasoning)}
                        className="flex items-center justify-between w-full text-sm font-medium hover:text-indigo-500 transition-colors"
                      >
                        <span>AI Reasoning</span>
                        {showReasoning ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <AnimatePresence>
                        {showReasoning && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                              {result.reasoning}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Trade Restrictions */}
                    {result.tradeRestrictions && result.tradeRestrictions !== "None known" && (
                      <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-500">Trade Restrictions</p>
                          <p className="text-sm text-muted-foreground">{result.tradeRestrictions}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleAccept}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Accept Classification
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReclassify}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reclassify
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
                <Card className="border-border/50 bg-card/50 h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center p-8">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
                        <Cpu className="h-8 w-8 text-indigo-500/50" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Classify</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Enter your product details on the left and click "Classify with AI" to get the recommended HS code.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Classification History */}
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
                  <CardTitle className="text-lg">Classification History</CardTitle>
                  <CardDescription>Your recent HS code classifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <EmptyState
                      icon={Cpu}
                      title="No classifications yet"
                      description="Classifications you accept will appear here."
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Description</TableHead>
                          <TableHead>HS Code</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <motion.tbody
                          variants={container}
                          initial="hidden"
                          animate="show"
                          className="contents"
                        >
                          {history.map((classification) => (
                            <motion.tr
                              key={classification.id}
                              variants={item}
                              className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="max-w-[300px] truncate">
                                {classification.product_description}
                              </TableCell>
                              <TableCell className="font-mono text-indigo-500">
                                {classification.suggested_hs_code}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${getConfidenceColorClass(classification.confidence_score)}`}
                                      style={{ width: `${classification.confidence_score}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm ${getConfidenceTextClass(classification.confidence_score)}`}>
                                    {classification.confidence_score}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge
                                  status={classification.status as "accepted" | "rejected" | "pending"}
                                />
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(classification.created_at), "MMM dd, yyyy")}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </TableBody>
                    </Table>
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
