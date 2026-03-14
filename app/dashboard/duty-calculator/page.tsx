"use client"

import { Calculator } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DutyCalculatorPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Duty Calculator</h1>
            <p className="text-muted-foreground">
              Calculate landed costs for any shipment
            </p>
          </div>
          <Button variant="outline">View History</Button>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Calculate Duties & Taxes</CardTitle>
            <CardDescription>
              Enter shipment details to calculate landed costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin Country</Label>
                <Input id="origin" placeholder="Select country" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination Country</Label>
                <Input id="destination" placeholder="Select country" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsCode">HS Code</Label>
                <Input id="hsCode" placeholder="XXXX.XX.XX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Declared Value</Label>
                <Input id="value" type="number" placeholder="10000" />
              </div>
              <div className="col-span-full">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Duties
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <EmptyState
          icon={Calculator}
          title="No calculations yet"
          description="Use the calculator above to estimate duties and taxes for your shipments."
        />
      </div>
    </PageWrapper>
  )
}
