"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuditLogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {error.message || "Failed to load audit log. Please try again."}
      </p>
      <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700">
        Try again
      </Button>
    </div>
  )
}
