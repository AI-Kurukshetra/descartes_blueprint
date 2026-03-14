"use client"

import { FileText, Plus } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export default function DocumentsPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage your customs documents
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Generate Document
          </Button>
        </div>

        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Generate customs documents for your shipments including commercial invoices, packing lists, and certificates of origin."
          actionLabel="Generate Document"
          onAction={() => {}}
        />
      </div>
    </PageWrapper>
  )
}
