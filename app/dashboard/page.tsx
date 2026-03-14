"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Package,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

import { PageWrapper } from "@/components/shared/page-wrapper"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { RouteDisplay } from "@/components/shared/country-flag"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format, subDays } from "date-fns"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Shipment } from "@/lib/types"

// Generate 30 days of shipment data for chart
const generateChartData = () => {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseShipments = 80 + Math.floor((29 - i) * 2.1)
    const variation = Math.floor(Math.random() * 15) - 7
    const weekendDip = isWeekend ? -20 : 0
    const shipments = Math.max(60, baseShipments + variation + weekendDip)
    const compliant = Math.floor(shipments * (0.92 + Math.random() * 0.06))

    data.push({
      date: format(date, "MMM dd"),
      shipments,
      compliant,
    })
  }
  return data
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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [stats, setStats] = useState({
    totalShipments: 0,
    complianceRate: 0,
    dutySavings: 0,
    openExceptions: 0,
  })
  const [dutyByCountry, setDutyByCountry] = useState<{ country: string; amount: number }[]>([])
  const [chartData] = useState(generateChartData())

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    const supabase = createClient()

    // Fetch recent shipments
    const { data: shipmentsData } = await supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8)

    if (shipmentsData) {
      setShipments(shipmentsData)
    }

    // Fetch all shipments for stats
    const { data: allShipments } = await supabase
      .from("shipments")
      .select("*")

    if (allShipments) {
      const total = allShipments.length
      const compliant = allShipments.filter(s => s.compliance_status === "compliant").length
      const complianceRate = total > 0 ? (compliant / total) * 100 : 0

      // Calculate duty by country
      const dutyMap: Record<string, number> = {}
      allShipments.forEach(s => {
        const country = s.destination_country
        dutyMap[country] = (dutyMap[country] || 0) + Number(s.duty_amount || 0)
      })
      const dutyData = Object.entries(dutyMap)
        .map(([country, amount]) => ({ country, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      setDutyByCountry(dutyData)
      setStats(prev => ({
        ...prev,
        totalShipments: total,
        complianceRate: Math.round(complianceRate * 10) / 10,
      }))
    }

    // Fetch duty calculations for savings
    const { data: dutyCalcs } = await supabase
      .from("duty_calculations")
      .select("savings_vs_standard")
      .not("savings_vs_standard", "is", null)

    if (dutyCalcs) {
      const totalSavings = dutyCalcs.reduce((sum, d) => sum + Number(d.savings_vs_standard || 0), 0)
      setStats(prev => ({ ...prev, dutySavings: totalSavings }))
    }

    // Fetch open exceptions
    const { data: exceptions } = await supabase
      .from("compliance_exceptions")
      .select("id")
      .in("status", ["open", "in_review"])

    if (exceptions) {
      setStats(prev => ({ ...prev, openExceptions: exceptions.length }))
    }

    setLoading(false)
  }

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your trade compliance activities
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Shipments This Month"
            value={loading ? 0 : stats.totalShipments}
            icon={Package}
            trend={{ value: 12, label: "vs last month", isPositive: true }}
            index={0}
          />
          <StatCard
            title="Compliance Rate"
            value={loading ? 0 : stats.complianceRate}
            suffix="%"
            decimals={1}
            icon={ShieldCheck}
            trend={{ value: -1.1, label: "vs last month", isPositive: false }}
            index={1}
          />
          <StatCard
            title="Duty Savings (FTA)"
            value={loading ? 0 : stats.dutySavings}
            prefix="$"
            separator=","
            icon={TrendingDown}
            trend={{ value: 23, label: "vs last month", isPositive: true }}
            index={2}
          />
          <StatCard
            title="Open Exceptions"
            value={loading ? 0 : stats.openExceptions}
            icon={AlertTriangle}
            trend={{ value: -3, label: "vs last week", isPositive: false }}
            index={3}
          />
        </div>

        {/* Primary chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Shipments Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="shipments"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorShipments)"
                      name="Total Shipments"
                    />
                    <Area
                      type="monotone"
                      dataKey="compliant"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={0}
                      name="Compliant"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Duty by country chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Duty Cost by Destination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {mounted && dutyByCountry.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dutyByCountry} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      />
                      <YAxis
                        type="category"
                        dataKey="country"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Duty Amount",
                        ]}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#6366f1"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                  {mounted && dutyByCountry.length === 0 && !loading && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No duty data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent shipments table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Recent Shipments
                </CardTitle>
                <Link href="/dashboard/shipments">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : shipments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No shipments yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Value</TableHead>
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
                            className="group border-b border-border/50 hover:bg-muted/50 transition-colors"
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
                              <StatusBadge status={shipment.status as "in_transit" | "pending_clearance" | "cleared" | "flagged" | "delivered"} />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(Number(shipment.declared_value), shipment.currency)}
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
        </div>
      </div>
    </PageWrapper>
  )
}
