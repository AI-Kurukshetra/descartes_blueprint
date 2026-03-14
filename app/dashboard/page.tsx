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

// Generate 30 days of shipment data
const generateChartData = () => {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseShipments = 80 + Math.floor((29 - i) * 2.1) // Growth from 80 to ~142
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

const chartData = generateChartData()

// Duty by country data
const dutyByCountry = [
  { country: "USA", amount: 245000 },
  { country: "Germany", amount: 189000 },
  { country: "UAE", amount: 156000 },
  { country: "UK", amount: 134000 },
  { country: "Singapore", amount: 98000 },
]

// Recent shipments mock data
const recentShipments = [
  {
    id: "1",
    reference: "TG-2026-00142",
    origin: "IN",
    destination: "US",
    status: "in_transit" as const,
    value: "$45,000",
    date: "Mar 14, 2026",
  },
  {
    id: "2",
    reference: "TG-2026-00141",
    origin: "IN",
    destination: "DE",
    status: "pending_clearance" as const,
    value: "$32,500",
    date: "Mar 13, 2026",
  },
  {
    id: "3",
    reference: "TG-2026-00140",
    origin: "CN",
    destination: "IN",
    status: "cleared" as const,
    value: "$78,200",
    date: "Mar 13, 2026",
  },
  {
    id: "4",
    reference: "TG-2026-00139",
    origin: "IN",
    destination: "AE",
    status: "delivered" as const,
    value: "$125,000",
    date: "Mar 12, 2026",
  },
  {
    id: "5",
    reference: "TG-2026-00138",
    origin: "IN",
    destination: "GB",
    status: "flagged" as const,
    value: "$56,800",
    date: "Mar 12, 2026",
  },
  {
    id: "6",
    reference: "TG-2026-00137",
    origin: "IN",
    destination: "SG",
    status: "cleared" as const,
    value: "$89,400",
    date: "Mar 11, 2026",
  },
  {
    id: "7",
    reference: "TG-2026-00136",
    origin: "IN",
    destination: "JP",
    status: "in_transit" as const,
    value: "$67,200",
    date: "Mar 11, 2026",
  },
  {
    id: "8",
    reference: "TG-2026-00135",
    origin: "IN",
    destination: "US",
    status: "delivered" as const,
    value: "$234,500",
    date: "Mar 10, 2026",
  },
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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
            value={142}
            icon={Package}
            trend={{ value: 12, label: "vs last month", isPositive: true }}
            index={0}
          />
          <StatCard
            title="Compliance Rate"
            value={94.2}
            suffix="%"
            decimals={1}
            icon={ShieldCheck}
            trend={{ value: -1.1, label: "vs last month", isPositive: false }}
            index={1}
          />
          <StatCard
            title="Duty Savings (FTA)"
            value={842000}
            prefix="₹"
            separator=","
            icon={TrendingDown}
            trend={{ value: 23, label: "vs last month", isPositive: true }}
            index={2}
          />
          <StatCard
            title="Open Exceptions"
            value={7}
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
                  {mounted && (
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
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
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
                          `₹${Number(value).toLocaleString()}`,
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
                      {recentShipments.map((shipment) => (
                        <motion.tr
                          key={shipment.id}
                          variants={item}
                          className="group border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-mono text-sm text-indigo-500">
                            {shipment.reference}
                          </TableCell>
                          <TableCell>
                            <RouteDisplay
                              origin={shipment.origin}
                              destination={shipment.destination}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={shipment.status} />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {shipment.value}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
