"use client"

import { AlertTriangle } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"

export default function CompliancePage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
            <p className="text-muted-foreground">
              Review and resolve compliance exceptions
            </p>
          </div>
        </div>

        <EmptyState
          icon={AlertTriangle}
          title="No compliance exceptions"
          description="Great job! You have no open compliance exceptions to resolve."
        />
      </div>
    </PageWrapper>
  )
}
