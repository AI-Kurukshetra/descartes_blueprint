"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Globe,
  Scale,
  DollarSign,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Product } from "@/lib/types"

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "pharmaceuticals", label: "Pharmaceuticals" },
  { value: "textiles", label: "Textiles" },
  { value: "electronics", label: "Electronics" },
  { value: "automotive", label: "Automotive" },
  { value: "chemicals", label: "Chemicals" },
  { value: "gems", label: "Gems & Jewelry" },
  { value: "metals", label: "Metals" },
  { value: "food", label: "Food & Agriculture" },
  { value: "machinery", label: "Machinery" },
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [restrictedFilter, setRestrictedFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.hs_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter

    const matchesRestricted =
      restrictedFilter === "all" ||
      (restrictedFilter === "restricted" && product.is_restricted) ||
      (restrictedFilter === "unrestricted" && !product.is_restricted)

    return matchesSearch && matchesCategory && matchesRestricted
  })

  const stats = {
    total: products.length,
    restricted: products.filter((p) => p.is_restricted).length,
    highConfidence: products.filter((p) => p.hs_confidence >= 80).length,
    categories: new Set(products.map((p) => p.category)).size,
  }

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const newProduct = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      hs_code: formData.get("hs_code") as string,
      hs_confidence: parseFloat(formData.get("hs_confidence") as string) || 0,
      country_of_origin: formData.get("country_of_origin") as string,
      weight_kg: parseFloat(formData.get("weight_kg") as string) || 0,
      value_usd: parseFloat(formData.get("value_usd") as string) || 0,
      category: formData.get("category") as string,
      is_restricted: formData.get("is_restricted") === "true",
    }

    try {
      const { error } = await supabase.from("products").insert([newProduct])

      if (error) throw error

      toast.success("Product added successfully")
      setShowAddModal(false)
      fetchProducts()
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Failed to add product")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProduct(productId: string) {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)

      if (error) throw error

      toast.success("Product deleted successfully")
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  function getConfidenceBadge(confidence: number) {
    if (confidence >= 80) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          {confidence}%
        </Badge>
      )
    } else if (confidence >= 60) {
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          {confidence}%
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          {confidence}%
        </Badge>
      )
    }
  }

  if (loading) {
    return null // loading.tsx handles this
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product master data and HS code assignments
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Restricted Items</p>
                  <p className="text-2xl font-bold">{stats.restricted}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Confidence HS</p>
                  <p className="text-2xl font-bold">{stats.highConfidence}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{stats.categories}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, HS codes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={restrictedFilter} onValueChange={(v) => v && setRestrictedFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Restriction Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="restricted">Restricted Only</SelectItem>
              <SelectItem value="unrestricted">Unrestricted Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              products.length === 0
                ? "Add your first product to start building your product catalog."
                : "Try adjusting your search or filters."
            }
            actionLabel={products.length === 0 ? "Add Product" : undefined}
            onAction={products.length === 0 ? () => setShowAddModal(true) : undefined}
          />
        ) : (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Product
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        HS Code
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Confidence
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Origin
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Value (USD)
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-right p-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredProducts.map((product) => (
                      <motion.tr
                        key={product.id}
                        variants={item}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="px-2 py-1 rounded bg-muted text-sm">
                            {product.hs_code}
                          </code>
                        </td>
                        <td className="p-4">
                          {getConfidenceBadge(product.hs_confidence)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {product.country_of_origin}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {product.value_usd.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {product.is_restricted ? (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Restricted
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Clear
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setShowViewModal(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a product to your master data catalog
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Cotton Yarn"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detailed product description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hs_code">HS Code</Label>
                  <Input
                    id="hs_code"
                    name="hs_code"
                    placeholder="e.g., 5205.11"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hs_confidence">Confidence (%)</Label>
                  <Input
                    id="hs_confidence"
                    name="hs_confidence"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="80"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="country_of_origin">Country of Origin</Label>
                  <Input
                    id="country_of_origin"
                    name="country_of_origin"
                    placeholder="e.g., IN"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue="textiles">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight_kg">Weight (kg)</Label>
                  <Input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value_usd">Value (USD)</Label>
                  <Input
                    id="value_usd"
                    name="value_usd"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="is_restricted">Restricted Item</Label>
                <Select name="is_restricted" defaultValue="false">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No - Unrestricted</SelectItem>
                    <SelectItem value="true">Yes - Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">
                    {selectedProduct.category}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">
                  {selectedProduct.description || "No description"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">HS Code</p>
                  <code className="px-2 py-1 rounded bg-muted text-sm">
                    {selectedProduct.hs_code}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  {getConfidenceBadge(selectedProduct.hs_confidence)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Country of Origin
                  </p>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {selectedProduct.country_of_origin}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    {selectedProduct.weight_kg} kg
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Value (USD)</p>
                  <p className="font-medium">
                    ${selectedProduct.value_usd.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {selectedProduct.is_restricted ? (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Restricted
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Clear
                    </Badge>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Created:{" "}
                  {new Date(selectedProduct.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
