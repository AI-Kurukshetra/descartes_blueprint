"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Package, Plus, ArrowUpDown } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { RouteDisplay } from "@/components/shared/country-flag"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import type { Shipment } from "@/lib/types"

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

  useEffect(() => {
    async function fetchShipments() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching shipments:", error)
      } else {
        setShipments(data || [])
      }
      setLoading(false)
    }

    fetchShipments()
  }, [])

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
            <p className="text-muted-foreground">
              Manage your international shipments
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        </div>

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
        ) : shipments.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No shipments yet"
            description="Track your first international shipment to get started with TradeGuard."
            actionLabel="Create Shipment"
            onAction={() => {}}
          />
        ) : (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
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
                    {shipments.map((shipment) => (
                      <motion.tr
                        key={shipment.id}
                        variants={item}
                        className="group border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
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
                        <TableCell className="max-w-[200px] truncate">
                          {shipment.product_name}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={shipment.status as "in_transit" | "pending_clearance" | "cleared" | "flagged" | "delivered"} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(shipment.declared_value), shipment.currency)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(shipment.created_at)}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {shipments.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {shipments.length} shipments
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
