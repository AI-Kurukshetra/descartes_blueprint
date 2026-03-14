"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Search,
  History,
  Building2,
  User,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CountrySelect } from "@/components/shared/country-select"
import { StatusBadge } from "@/components/shared/status-badge"
import { CountryFlag } from "@/components/shared/country-flag"
import { screenPartySchema, type ScreenPartyInput } from "@/lib/validations"
import { WATCHLISTS, STATUS_CONFIG } from "@/lib/constants"
import { toast } from "sonner"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

interface ScreeningResult {
  party_name: string
  party_country?: string
  result: "clear" | "match" | "possible_match"
  risk_level: "none" | "low" | "medium" | "high" | "critical"
  matched_list?: string
  match_details?: {
    matched_name: string
    country: string
    reason: string
    match_score: number
  }
  screened_lists: string[]
  screened_at: string
}

interface HistoryItem {
  id: string
  party_name: string
  party_country?: string
  search_type: string
  result: string
  risk_level: string
  matched_list?: string
  created_at: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function DeniedPartyPage() {
  const [isScreening, setIsScreening] = useState(false)
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null)
  const [searchType, setSearchType] = useState<"company" | "individual">("company")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [pulseCount, setPulseCount] = useState(0)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScreenPartyInput>({
    resolver: zodResolver(screenPartySchema),
    defaultValues: {
      party_name: "",
      party_country: "",
      search_type: "company",
    },
  })

  const partyCountry = watch("party_country")

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from("denied_party_screenings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (data) {
        setHistory(data)
      }
    }
    loadHistory()
  }, [supabase])

  // Pulse animation for matches
  useEffect(() => {
    if (screeningResult?.result === "match" && pulseCount < 3) {
      const timer = setTimeout(() => {
        setPulseCount((prev) => prev + 1)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [screeningResult, pulseCount])

  const onSubmit = async (data: ScreenPartyInput) => {
    setIsScreening(true)
    setScreeningResult(null)
    setPulseCount(0)

    try {
      const response = await fetch("/api/screen-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          search_type: searchType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setScreeningResult(result.screening)

        // Save to database
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          await supabase.from("denied_party_screenings").insert({
            user_id: userData.user.id,
            party_name: data.party_name,
            party_country: data.party_country || null,
            search_type: searchType,
            result: result.screening.result,
            risk_level: result.screening.risk_level,
            matched_list: result.screening.matched_list || null,
            match_details: result.screening.match_details
              ? JSON.stringify(result.screening.match_details)
              : null,
          })

          // Refresh history
          const { data: historyData } = await supabase
            .from("denied_party_screenings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10)

          if (historyData) {
            setHistory(historyData)
          }
        }

        if (result.screening.result === "match") {
          toast.error("Denied party match found!", {
            description: `${data.party_name} matches a restricted party.`,
          })
        } else if (result.screening.result === "possible_match") {
          toast.warning("Possible match detected", {
            description: "Manual review recommended.",
          })
        } else {
          toast.success("Party cleared", {
            description: "No matches found on any watchlist.",
          })
        }
      } else {
        toast.error("Screening failed", {
          description: result.error || "Please try again.",
        })
      }
    } catch {
      toast.error("Error", {
        description: "Failed to screen party. Please try again.",
      })
    } finally {
      setIsScreening(false)
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case "clear":
        return <ShieldCheck className="h-8 w-8 text-emerald-500" />
      case "match":
        return <ShieldX className="h-8 w-8 text-red-500" />
      case "possible_match":
        return <ShieldAlert className="h-8 w-8 text-amber-500" />
      default:
        return <ShieldAlert className="h-8 w-8 text-muted-foreground" />
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case "clear":
        return "border-emerald-500/50 bg-emerald-500/10"
      case "match":
        return "border-red-500/50 bg-red-500/10"
      case "possible_match":
        return "border-amber-500/50 bg-amber-500/10"
      default:
        return "border-border"
    }
  }

  const getPulseAnimation = () => {
    if (!screeningResult) return {}

    if (screeningResult.result === "match" && pulseCount < 3) {
      return {
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 0 rgba(239, 68, 68, 0)",
          "0 0 20px 10px rgba(239, 68, 68, 0.3)",
          "0 0 0 0 rgba(239, 68, 68, 0)",
        ],
      }
    }

    if (screeningResult.result === "clear") {
      return {
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 0 rgba(16, 185, 129, 0)",
          "0 0 20px 10px rgba(16, 185, 129, 0.3)",
          "0 0 0 0 rgba(16, 185, 129, 0)",
        ],
      }
    }

    return {}
  }

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Denied Party Screening
            </h1>
            <p className="text-muted-foreground">
              Screen trading partners against global watchlists and sanctions
              lists
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            Export History
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg">
                  <Search className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Screen a Party</CardTitle>
                  <CardDescription>
                    Check companies or individuals against restricted party
                    lists
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Search Type Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={searchType === "company" ? "default" : "outline"}
                      className={`flex-1 gap-2 ${
                        searchType === "company"
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : ""
                      }`}
                      onClick={() => {
                        setSearchType("company")
                        setValue("search_type", "company")
                      }}
                    >
                      <Building2 className="h-4 w-4" />
                      Company
                    </Button>
                    <Button
                      type="button"
                      variant={
                        searchType === "individual" ? "default" : "outline"
                      }
                      className={`flex-1 gap-2 ${
                        searchType === "individual"
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : ""
                      }`}
                      onClick={() => {
                        setSearchType("individual")
                        setValue("search_type", "individual")
                      }}
                    >
                      <User className="h-4 w-4" />
                      Individual
                    </Button>
                  </div>
                </div>

                {/* Party Name */}
                <div className="space-y-2">
                  <Label htmlFor="party_name">
                    {searchType === "company" ? "Company Name" : "Full Name"} *
                  </Label>
                  <Input
                    id="party_name"
                    placeholder={
                      searchType === "company"
                        ? "Enter company or business name"
                        : "Enter person's full name"
                    }
                    {...register("party_name")}
                    className={errors.party_name ? "border-red-500" : ""}
                  />
                  {errors.party_name && (
                    <p className="text-xs text-red-500">
                      {errors.party_name.message}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label>Country (Optional)</Label>
                  <CountrySelect
                    value={partyCountry || ""}
                    onChange={(value) => setValue("party_country", value)}
                    placeholder="Select country"
                    allowClear
                  />
                  <p className="text-xs text-muted-foreground">
                    Adding country improves match accuracy
                  </p>
                </div>

                {/* Watchlists Info */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="h-4 w-4 text-indigo-500" />
                    Watchlists Screened
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {WATCHLISTS.map((list) => (
                      <span
                        key={list}
                        className="text-xs px-2 py-1 bg-background rounded border border-border/50"
                      >
                        {list}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isScreening}
                >
                  {isScreening ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Screening...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Screen Now
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Card */}
          <AnimatePresence mode="wait">
            {isScreening ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-border/50 bg-card/50 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                  {/* Scanning animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"
                    animate={{
                      y: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <div className="text-center p-8 z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <ShieldAlert className="h-16 w-16 text-indigo-500 mx-auto" />
                    </motion.div>
                    <p className="mt-4 font-medium">Screening in progress...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Checking against {WATCHLISTS.length} watchlists
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : screeningResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  ...getPulseAnimation(),
                }}
                transition={{
                  duration: 0.5,
                  scale: { duration: 0.3 }
                }}
              >
                <Card
                  className={`min-h-[400px] border-2 ${getResultColor(
                    screeningResult.result
                  )}`}
                >
                  <CardContent className="p-6">
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="space-y-6"
                    >
                      {/* Result Header */}
                      <motion.div
                        variants={item}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              screeningResult.result === "clear"
                                ? "bg-emerald-500/20"
                                : screeningResult.result === "match"
                                ? "bg-red-500/20"
                                : "bg-amber-500/20"
                            }`}
                          >
                            {getResultIcon(screeningResult.result)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {screeningResult.result === "clear"
                                ? "No Matches Found"
                                : screeningResult.result === "match"
                                ? "Match Found"
                                : "Possible Match"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Screened at{" "}
                              {format(
                                new Date(screeningResult.screened_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </p>
                          </div>
                        </div>
                        <StatusBadge
                          variant="risk"
                          status={screeningResult.risk_level}
                        />
                      </motion.div>

                      {/* Party Info */}
                      <motion.div
                        variants={item}
                        className="p-4 bg-muted/50 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Screened Party
                          </span>
                          <span className="font-medium">
                            {screeningResult.party_name}
                          </span>
                        </div>
                        {screeningResult.party_country && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Country
                            </span>
                            <CountryFlag
                              countryCode={screeningResult.party_country}
                              size="sm"
                            />
                          </div>
                        )}
                      </motion.div>

                      {/* Match Details (if match found) */}
                      {screeningResult.match_details && (
                        <motion.div variants={item}>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/15 transition-colors"
                            onClick={() => setShowDetails(!showDetails)}
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <span className="font-medium text-red-400">
                                View Match Details
                              </span>
                            </div>
                            {showDetails ? (
                              <ChevronUp className="h-4 w-4 text-red-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-red-400" />
                            )}
                          </button>

                          <AnimatePresence>
                            {showDetails && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 p-4 bg-muted/50 rounded-lg space-y-3 border border-red-500/20">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Matched Name
                                    </span>
                                    <span className="font-medium text-red-400">
                                      {screeningResult.match_details.matched_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      List
                                    </span>
                                    <span className="font-medium">
                                      {screeningResult.matched_list}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Match Score
                                    </span>
                                    <span className="font-medium">
                                      {screeningResult.match_details.match_score}%
                                    </span>
                                  </div>
                                  <div className="pt-2 border-t border-border">
                                    <span className="text-sm text-muted-foreground">
                                      Reason
                                    </span>
                                    <p className="mt-1 text-sm">
                                      {screeningResult.match_details.reason}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}

                      {/* Status Indicators */}
                      <motion.div
                        variants={item}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex justify-center mb-2">
                            {screeningResult.result === "clear" ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Sanctions
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex justify-center mb-2">
                            {screeningResult.result === "clear" ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : screeningResult.result === "match" ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Export Controls
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex justify-center mb-2">
                            {screeningResult.result === "clear" ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Denied Parties
                          </p>
                        </div>
                      </motion.div>

                      {/* Actions */}
                      <motion.div
                        variants={item}
                        className="flex gap-3 pt-2"
                      >
                        {screeningResult.result !== "clear" && (
                          <Button
                            variant="outline"
                            className="flex-1 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Flag for Review
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setScreeningResult(null)}
                        >
                          Screen Another
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="border-border/50 bg-card/50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                      <ShieldAlert className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Ready to Screen</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
                      Enter a company or individual name to check against global
                      watchlists
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Table */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-muted rounded-lg">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Screening History</CardTitle>
                <CardDescription>
                  Recent denied party screenings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No screening history yet. Use the form above to screen your
                  first trading partner.
                </p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-3">Party Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Country</div>
                  <div className="col-span-2">Result</div>
                  <div className="col-span-2">Risk</div>
                  <div className="col-span-1">Date</div>
                </div>

                {/* Table Rows */}
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg items-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-3 font-medium truncate">
                      {item.party_name}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {item.search_type === "company" ? (
                          <Building2 className="h-3.5 w-3.5" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                        <span className="capitalize">{item.search_type}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {item.party_country ? (
                        <CountryFlag countryCode={item.party_country} size="sm" />
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <StatusBadge
                        variant="screening"
                        status={item.result as "clear" | "match" | "possible_match"}
                      />
                    </div>
                    <div className="col-span-2">
                      <StatusBadge
                        variant="risk"
                        status={
                          item.risk_level as
                            | "none"
                            | "low"
                            | "medium"
                            | "high"
                            | "critical"
                        }
                      />
                    </div>
                    <div className="col-span-1 text-sm text-muted-foreground">
                      {format(new Date(item.created_at), "MMM dd")}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
