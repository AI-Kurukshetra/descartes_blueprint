"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Plus,
  Eye,
  MessageSquare,
  User,
  Calendar,
  Package,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format, formatDistanceToNow } from "date-fns"
import type { ComplianceException, Severity, ExceptionStatus } from "@/lib/types"

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "waived", label: "Waived" },
]

const SEVERITIES = [
  { value: "all", label: "All Severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

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

function getSeverityBadge(severity: Severity) {
  switch (severity) {
    case "critical":
      return (
        <Badge className="bg-red-900/50 text-red-400 border-red-500/30 animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Critical
        </Badge>
      )
    case "high":
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          High
        </Badge>
      )
    case "medium":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          Medium
        </Badge>
      )
    case "low":
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Low
        </Badge>
      )
    default:
      return <Badge variant="outline">{severity}</Badge>
  }
}

function getStatusBadge(status: ExceptionStatus) {
  switch (status) {
    case "open":
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="h-3 w-3 mr-1" />
          Open
        </Badge>
      )
    case "in_review":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          <Clock className="h-3 w-3 mr-1" />
          In Review
        </Badge>
      )
    case "resolved":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      )
    case "waived":
      return (
        <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
          Waived
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function CompliancePage() {
  const [exceptions, setExceptions] = useState<ComplianceException[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [selectedException, setSelectedException] =
    useState<ComplianceException | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchExceptions()
  }, [])

  async function fetchExceptions() {
    try {
      const { data, error } = await supabase
        .from("compliance_exceptions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setExceptions(data || [])
    } catch (error) {
      console.error("Error fetching compliance exceptions:", error)
      toast.error("Failed to load compliance exceptions")
    } finally {
      setLoading(false)
    }
  }

  const filteredExceptions = exceptions.filter((exception) => {
    const matchesSearch =
      searchQuery === "" ||
      exception.exception_type
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exception.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || exception.status === statusFilter

    const matchesSeverity =
      severityFilter === "all" || exception.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

  const stats = {
    total: exceptions.length,
    open: exceptions.filter((e) => e.status === "open").length,
    inReview: exceptions.filter((e) => e.status === "in_review").length,
    critical: exceptions.filter(
      (e) => e.severity === "critical" && e.status !== "resolved"
    ).length,
  }

  async function handleResolve(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedException) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const newStatus = formData.get("status") as ExceptionStatus
    const resolutionNotes = formData.get("resolution_notes") as string

    try {
      const updateData: Partial<ComplianceException> = {
        status: newStatus,
        resolution_notes: resolutionNotes,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === "resolved" || newStatus === "waived") {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("compliance_exceptions")
        .update(updateData)
        .eq("id", selectedException.id)

      if (error) throw error

      toast.success("Exception updated successfully")
      setShowResolveModal(false)
      setSelectedException(null)
      fetchExceptions()
    } catch (error) {
      console.error("Error updating exception:", error)
      toast.error("Failed to update exception")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return null
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
            <p className="text-muted-foreground">
              Review and resolve compliance exceptions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Exceptions
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Review</p>
                  <p className="text-2xl font-bold">{stats.inReview}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Critical Issues
                  </p>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exceptions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={(v) => v && setSeverityFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((severity) => (
                <SelectItem key={severity.value} value={severity.value}>
                  {severity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredExceptions.length} of {exceptions.length} exceptions
        </p>

        {/* Exceptions List */}
        {filteredExceptions.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No compliance exceptions"
            description={
              exceptions.length === 0
                ? "Great job! You have no open compliance exceptions to resolve."
                : "No exceptions match your current filters."
            }
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredExceptions.map((exception) => (
              <motion.div key={exception.id} variants={item}>
                <Card
                  className={`border-border/50 bg-card/50 hover:border-border transition-colors ${
                    exception.severity === "critical" &&
                    exception.status === "open"
                      ? "border-red-500/50"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {getSeverityBadge(exception.severity)}
                          {getStatusBadge(exception.status)}
                          <Badge variant="outline" className="font-mono text-xs">
                            {exception.exception_type}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm">{exception.description}</p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          {exception.shipment_id && (
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              <span>
                                Shipment: {exception.shipment_id.slice(0, 8)}...
                              </span>
                            </div>
                          )}
                          {exception.assigned_to && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{exception.assigned_to}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDistanceToNow(
                                new Date(exception.created_at),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Resolution Notes */}
                        {exception.resolution_notes && (
                          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <MessageSquare className="h-4 w-4" />
                              Resolution Notes
                            </div>
                            <p className="text-sm">{exception.resolution_notes}</p>
                            {exception.resolved_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Resolved on{" "}
                                {format(
                                  new Date(exception.resolved_at),
                                  "MMM d, yyyy 'at' h:mm a"
                                )}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="shrink-0">
                        {exception.status !== "resolved" &&
                          exception.status !== "waived" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedException(exception)
                                setShowResolveModal(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Resolve Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Exception</DialogTitle>
            <DialogDescription>
              Update the status and add resolution notes
            </DialogDescription>
          </DialogHeader>
          {selectedException && (
            <form onSubmit={handleResolve}>
              <div className="space-y-4 py-4">
                {/* Exception Details */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(selectedException.severity)}
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedException.exception_type}
                    </Badge>
                  </div>
                  <p className="text-sm">{selectedException.description}</p>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">New Status</Label>
                    <Select name="status" defaultValue={selectedException.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="waived">Waived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="resolution_notes">Resolution Notes</Label>
                    <Textarea
                      id="resolution_notes"
                      name="resolution_notes"
                      placeholder="Describe the resolution or reason for waiving..."
                      rows={4}
                      defaultValue={selectedException.resolution_notes || ""}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResolveModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
