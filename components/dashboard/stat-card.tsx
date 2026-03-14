"use client"

import { motion } from "framer-motion"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import CountUp from "react-countup"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  separator?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  icon: LucideIcon
  index?: number
}

export function StatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  separator = ",",
  trend,
  icon: Icon,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">
                {prefix}
                <CountUp
                  end={value}
                  decimals={decimals}
                  separator={separator}
                  duration={1.5}
                  delay={0.2}
                />
                {suffix}
              </p>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  {trend.isPositive ? (
                    <TrendingUp
                      className={cn(
                        "h-4 w-4",
                        trend.value >= 0 ? "text-emerald-500" : "text-red-500"
                      )}
                    />
                  ) : (
                    <TrendingDown
                      className={cn(
                        "h-4 w-4",
                        trend.value >= 0 ? "text-emerald-500" : "text-amber-500"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend.isPositive
                        ? trend.value >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                        : trend.value >= 0
                        ? "text-emerald-500"
                        : "text-amber-500"
                    )}
                  >
                    {trend.value >= 0 ? "+" : ""}
                    {trend.value}
                    {trend.label.includes("%") ? "" : "%"}
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Icon className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
