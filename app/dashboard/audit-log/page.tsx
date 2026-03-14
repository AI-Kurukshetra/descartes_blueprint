"use client"

import { ScrollText } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"

export default function AuditLogPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all activities and changes in your account
          </p>
        </div>

        <EmptyState
          icon={ScrollText}
          title="No activity yet"
          description="Your audit log will show all actions taken in your TradeGuard account."
        />
      </div>
    </PageWrapper>
  )
}
