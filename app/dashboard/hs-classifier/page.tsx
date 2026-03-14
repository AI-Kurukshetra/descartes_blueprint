"use client"

import { Cpu } from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function HSClassifierPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI HS Code Classifier</h1>
            <p className="text-muted-foreground">
              Classify products instantly using AI
            </p>
          </div>
          <Button variant="outline">View History</Button>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Classify Your Product</CardTitle>
            <CardDescription>
              Enter product details for AI-powered HS code classification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input id="productName" placeholder="e.g., Pharmaceutical Tablets" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the product including materials, use, manufacturing process..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country of Origin</Label>
                <Input id="country" placeholder="Select country" />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Cpu className="mr-2 h-4 w-4" />
                Classify with AI
              </Button>
            </form>
          </CardContent>
        </Card>

        <EmptyState
          icon={Cpu}
          title="No classifications yet"
          description="Try the classifier above to get started with AI-powered HS code classification."
        />
      </div>
    </PageWrapper>
  )
}
