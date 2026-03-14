"use client"

import { Package, Plus } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export default function ShipmentsPage() {
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

        <EmptyState
          icon={Package}
          title="No shipments yet"
          description="Track your first international shipment to get started with TradeGuard."
          actionLabel="Create Shipment"
          onAction={() => {}}
        />
      </div>
    </PageWrapper>
  )
}
