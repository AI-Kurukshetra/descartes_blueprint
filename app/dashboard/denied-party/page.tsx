"use client"

import { ShieldAlert } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DeniedPartyPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Denied Party Screening</h1>
            <p className="text-muted-foreground">
              Screen trading partners against global watchlists
            </p>
          </div>
          <Button variant="outline">View Screening History</Button>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Screen a Party</CardTitle>
            <CardDescription>
              Check companies or individuals against OFAC, BIS, EU, and UN watchlists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partyName">Party Name</Label>
                <Input id="partyName" placeholder="Enter company or individual name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country (Optional)</Label>
                <Input id="country" placeholder="Select country" />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Screen Now
              </Button>
            </form>
          </CardContent>
        </Card>

        <EmptyState
          icon={ShieldAlert}
          title="No screenings yet"
          description="Use the form above to screen your trading partners against global watchlists."
        />
      </div>
    </PageWrapper>
  )
}
