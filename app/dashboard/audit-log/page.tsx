"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ScrollText,
  Search,
  Filter,
  User,
  Package,
  FileText,
  Shield,
  Settings,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
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
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format, formatDistanceToNow } from "date-fns"
import type { AuditLog } from "@/lib/types"

const ACTION_TYPES = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "view", label: "View" },
  { value: "export", label: "Export" },
  { value: "login", label: "Login" },
]

const ENTITY_TYPES = [
  { value: "all", label: "All Entities" },
  { value: "shipment", label: "Shipments" },
  { value: "product", label: "Products" },
  { value: "document", label: "Documents" },
  { value: "screening", label: "Screenings" },
  { value: "classification", label: "Classifications" },
  { value: "user", label: "User" },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
}

function getActionColor(action: string) {
  if (action.includes("create") || action.includes("add")) {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  } else if (action.includes("update") || action.includes("edit")) {
    return "bg-amber-500/10 text-amber-500 border-amber-500/20"
  } else if (action.includes("delete") || action.includes("remove")) {
    return "bg-red-500/10 text-red-500 border-red-500/20"
  } else if (action.includes("view") || action.includes("read")) {
    return "bg-blue-500/10 text-blue-500 border-blue-500/20"
  } else if (action.includes("export") || action.includes("download")) {
    return "bg-purple-500/10 text-purple-500 border-purple-500/20"
  } else if (action.includes("login") || action.includes("auth")) {
    return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  }
  return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
}

function getEntityIcon(entityType: string) {
  switch (entityType) {
    case "shipment":
      return Package
    case "product":
      return Package
    case "document":
      return FileText
    case "screening":
      return Shield
    case "classification":
      return ScrollText
    case "user":
      return User
    default:
      return Settings
  }
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [entityFilter, setEntityFilter] = useState("all")
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      toast.error("Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction =
      actionFilter === "all" ||
      log.action.toLowerCase().includes(actionFilter.toLowerCase())

    const matchesEntity =
      entityFilter === "all" ||
      log.entity_type.toLowerCase() === entityFilter.toLowerCase()

    return matchesSearch && matchesAction && matchesEntity
  })

  function toggleExpand(logId: string) {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  if (loading) {
    return null
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all activities and changes in your account
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => v && setActionFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={(v) => v && setEntityFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((entity) => (
                <SelectItem key={entity.value} value={entity.value}>
                  {entity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} audit entries
        </p>

        {/* Audit Log List */}
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No activity yet"
            description={
              logs.length === 0
                ? "Your audit log will show all actions taken in your TradeGuard account."
                : "No logs match your current filters."
            }
          />
        ) : (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-border/50"
              >
                {filteredLogs.map((log) => {
                  const EntityIcon = getEntityIcon(log.entity_type)
                  const isExpanded = expandedLogs.has(log.id)

                  return (
                    <motion.div
                      key={log.id}
                      variants={item}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <EntityIcon className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              on
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {log.entity_type}
                            </Badge>
                            {log.entity_id && (
                              <code className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {log.entity_id.slice(0, 8)}...
                              </code>
                            )}
                          </div>

                          {/* Details Preview */}
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground"
                                onClick={() => toggleExpand(log.id)}
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Hide details
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Show details
                                  </>
                                )}
                              </Button>
                              {isExpanded && (
                                <motion.pre
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-2 p-3 rounded-lg bg-muted text-xs overflow-x-auto"
                                >
                                  {JSON.stringify(log.details, null, 2)}
                                </motion.pre>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Timestamp and IP */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                          </p>
                          {log.ip_address && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Globe className="h-3 w-3" />
                              {log.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
