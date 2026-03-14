"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  Package,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Filter,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"

import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { RouteDisplay } from "@/components/shared/country-flag"
import { CountrySelect } from "@/components/shared/country-select"
import { CreateShipmentModal } from "@/components/shipments/create-shipment-modal"
import { ShipmentDetailPanel } from "@/components/shipments/shipment-detail-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import type { Shipment, ShipmentStatus } from "@/lib/types"
import type { CreateShipmentInput } from "@/lib/validations"

const ITEMS_PER_PAGE = 20

const statusTabs = [
  { value: "all", label: "All" },
  { value: "in_transit", label: "In Transit" },
  { value: "pending_clearance", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "flagged", label: "Flagged" },
  { value: "delivered", label: "Delivered" },
] as const

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [originFilter, setOriginFilter] = useState("")
  const [destinationFilter, setDestinationFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editData, setEditData] = useState<(CreateShipmentInput & { id: string }) | undefined>()
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null)

  useEffect(() => {
    fetchShipments()
  }, [])

  async function fetchShipments() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching shipments:", error)
      toast.error("Failed to load shipments")
    } else {
      setShipments(data || [])
    }
    setLoading(false)
  }

  // Filter shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      // Status filter
      if (statusFilter !== "all" && shipment.status !== statusFilter) {
        return false
      }

      // Origin filter
      if (originFilter && shipment.origin_country !== originFilter) {
        return false
      }

      // Destination filter
      if (destinationFilter && shipment.destination_country !== destinationFilter) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          shipment.reference_no.toLowerCase().includes(query) ||
          shipment.shipper_name.toLowerCase().includes(query) ||
          shipment.consignee_name.toLowerCase().includes(query) ||
          shipment.product_name.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [shipments, statusFilter, originFilter, destinationFilter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE)
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, originFilter, destinationFilter, searchQuery])

  const formatCurrency = (value: number, currency: string = "USD") => {
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

  const handleViewShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setDetailPanelOpen(true)
  }

  const handleEditShipment = (shipment: Shipment) => {
    setEditData({
      id: shipment.id,
      reference_no: shipment.reference_no,
      origin_country: shipment.origin_country,
      destination_country: shipment.destination_country,
      shipper_name: shipment.shipper_name,
      consignee_name: shipment.consignee_name,
      product_name: shipment.product_name,
      hs_code: shipment.hs_code || "",
      declared_value: Number(shipment.declared_value),
      currency: shipment.currency,
      weight_kg: Number(shipment.weight_kg),
      incoterm: shipment.incoterm,
      customs_broker: shipment.customs_broker || "",
      freight_forwarder: shipment.freight_forwarder || "",
      estimated_delivery: shipment.estimated_delivery || "",
      notes: shipment.notes || "",
    })
    setDetailPanelOpen(false)
    setCreateModalOpen(true)
  }

  const handleDeleteClick = (shipment: Shipment) => {
    setShipmentToDelete(shipment)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!shipmentToDelete) return

    const supabase = createClient()
    const { error } = await supabase
      .from("shipments")
      .delete()
      .eq("id", shipmentToDelete.id)

    if (error) {
      toast.error("Failed to delete shipment")
    } else {
      toast.success("Shipment deleted successfully")
      fetchShipments()
      setDetailPanelOpen(false)
    }

    setDeleteConfirmOpen(false)
    setShipmentToDelete(null)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setOriginFilter("")
    setDestinationFilter("")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || originFilter || destinationFilter

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
            <p className="text-muted-foreground">
              Manage your international shipments
            </p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              setEditData(undefined)
              setCreateModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="space-y-4">
          {/* Status Tabs + Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    statusFilter === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reference, shipper, consignee, product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Advanced Filters</span>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-indigo-500 hover:text-indigo-400"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Origin Country</label>
                      <CountrySelect
                        value={originFilter}
                        onChange={setOriginFilter}
                        placeholder="Any origin"
                        allowClear
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Destination Country</label>
                      <CountrySelect
                        value={destinationFilter}
                        onChange={setDestinationFilter}
                        placeholder="Any destination"
                        allowClear
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="text-sm text-muted-foreground">
            Showing {paginatedShipments.length} of {filteredShipments.length} shipments
            {hasActiveFilters && ` (filtered from ${shipments.length} total)`}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : paginatedShipments.length === 0 ? (
          <EmptyState
            icon={Package}
            title={hasActiveFilters ? "No shipments match your filters" : "No shipments yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your filters or search query."
                : "Track your first international shipment to get started with TradeGuard."
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : "Create Shipment"}
            onAction={hasActiveFilters ? clearFilters : () => setCreateModalOpen(true)}
          />
        ) : (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Product / HS Code</TableHead>
                      <TableHead>Shipper → Consignee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <motion.tbody
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="contents"
                    >
                      {paginatedShipments.map((shipment) => (
                        <motion.tr
                          key={shipment.id}
                          variants={item}
                          className="group border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewShipment(shipment)}
                        >
                          <TableCell className="font-mono text-sm text-indigo-500">
                            {shipment.reference_no}
                          </TableCell>
                          <TableCell>
                            <RouteDisplay
                              origin={shipment.origin_country}
                              destination={shipment.destination_country}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="truncate">{shipment.product_name}</div>
                              {shipment.hs_code && (
                                <div className="text-xs font-mono text-muted-foreground">
                                  {shipment.hs_code}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="truncate text-sm">{shipment.shipper_name}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                → {shipment.consignee_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={
                                shipment.status as
                                  | "in_transit"
                                  | "pending_clearance"
                                  | "cleared"
                                  | "flagged"
                                  | "delivered"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={
                                shipment.compliance_status as
                                  | "compliant"
                                  | "review_required"
                                  | "flagged"
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(shipment.declared_value), shipment.currency)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(shipment.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewShipment(shipment)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditShipment(shipment)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(shipment)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-indigo-500 text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateShipmentModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          setEditData(undefined)
        }}
        onSuccess={fetchShipments}
        editData={editData}
      />

      {/* Detail Panel */}
      <ShipmentDetailPanel
        shipment={selectedShipment}
        open={detailPanelOpen}
        onClose={() => {
          setDetailPanelOpen(false)
          setSelectedShipment(null)
        }}
        onEdit={handleEditShipment}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setDeleteConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
            >
              <div className="bg-card border border-border rounded-xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold mb-2">Delete Shipment</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to delete shipment{" "}
                  <span className="font-mono text-indigo-500">
                    {shipmentToDelete?.reference_no}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
