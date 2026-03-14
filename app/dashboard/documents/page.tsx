"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Plus,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  FileCheck,
  FileWarning,
  FileClock,
  Package,
  ScrollText,
  Award,
  Ship,
  Leaf,
  X,
  Loader2,
  CheckCircle,
  History,
  GitBranch,
  Copy,
  RotateCcw,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

interface DocumentVersion {
  version: number
  content_json: Record<string, unknown>
  status: string
  created_at: string
  created_by: string
  change_notes: string
}

interface TradeDocument {
  id: string
  user_id: string
  shipment_id: string | null
  doc_type: string
  doc_number: string
  status: string
  content_json: Record<string, unknown>
  created_at: string
  updated_at: string
  version: number
  version_history: DocumentVersion[]
  shipment?: {
    reference_no: string
    product_name: string
    shipper_name: string
    consignee_name: string
    origin_country: string
    destination_country: string
  }
}

interface Shipment {
  id: string
  reference_no: string
  product_name: string
  shipper_name: string
  consignee_name: string
  origin_country: string
  destination_country: string
}

const DOCUMENT_TYPES = [
  {
    value: "commercial_invoice",
    label: "Commercial Invoice",
    icon: FileText,
    description: "Required for customs clearance, shows transaction details",
  },
  {
    value: "packing_list",
    label: "Packing List",
    icon: Package,
    description: "Itemized list of package contents and weights",
  },
  {
    value: "certificate_of_origin",
    label: "Certificate of Origin",
    icon: Award,
    description: "Certifies country of manufacture for FTA benefits",
  },
  {
    value: "bill_of_lading",
    label: "Bill of Lading",
    icon: Ship,
    description: "Contract between shipper and carrier",
  },
  {
    value: "phytosanitary",
    label: "Phytosanitary Certificate",
    icon: Leaf,
    description: "Required for plant products, certifies pest-free status",
  },
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<TradeDocument[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<string>("")
  const [selectedShipment, setSelectedShipment] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [viewDocument, setViewDocument] = useState<TradeDocument | null>(null)
  const [versionHistoryDoc, setVersionHistoryDoc] = useState<TradeDocument | null>(null)
  const [creatingVersion, setCreatingVersion] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
    fetchShipments()
  }, [])

  async function fetchDocuments() {
    setLoading(true)
    const { data, error } = await supabase
      .from("trade_documents")
      .select(`
        *,
        shipment:shipments(reference_no, product_name, shipper_name, consignee_name, origin_country, destination_country)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to load documents")
    } else {
      setDocuments(data || [])
    }
    setLoading(false)
  }

  async function fetchShipments() {
    const { data } = await supabase
      .from("shipments")
      .select("id, reference_no, product_name, shipper_name, consignee_name, origin_country, destination_country")
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) {
      setShipments(data)
    }
  }

  async function generateDocument() {
    if (!selectedDocType || !selectedShipment) {
      toast.error("Please select document type and shipment")
      return
    }

    setGenerating(true)
    const shipment = shipments.find((s) => s.id === selectedShipment)

    // Generate document number
    const docNumber = `DOC-${Date.now().toString(36).toUpperCase()}`

    // Create document content based on type
    const contentJson: Record<string, unknown> = {
      generated_at: new Date().toISOString(),
      shipment_reference: shipment?.reference_no,
      document_type: selectedDocType,
    }

    if (selectedDocType === "commercial_invoice") {
      contentJson.invoice_details = {
        shipper: shipment?.shipper_name,
        consignee: shipment?.consignee_name,
        product: shipment?.product_name,
        origin: shipment?.origin_country,
        destination: shipment?.destination_country,
      }
    } else if (selectedDocType === "certificate_of_origin") {
      contentJson.certificate_details = {
        country_of_origin: shipment?.origin_country,
        manufacturer: shipment?.shipper_name,
        product: shipment?.product_name,
        certification_body: "TradeGuard Certification Authority",
      }
    }

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from("trade_documents").insert({
      user_id: userData.user?.id,
      shipment_id: selectedShipment,
      doc_type: selectedDocType,
      doc_number: docNumber,
      status: "generated",
      content_json: contentJson,
      version: 1,
      version_history: [],
    })

    if (error) {
      toast.error("Failed to generate document")
    } else {
      toast.success("Document generated successfully")
      setGenerateModalOpen(false)
      setSelectedDocType("")
      setSelectedShipment("")
      fetchDocuments()
    }
    setGenerating(false)
  }

  async function deleteDocument(id: string) {
    const { error } = await supabase.from("trade_documents").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete document")
    } else {
      toast.success("Document deleted")
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    }
  }

  async function createNewVersion(doc: TradeDocument, changeNotes: string = "Updated document") {
    setCreatingVersion(true)

    const { data: userData } = await supabase.auth.getUser()
    const userName = userData.user?.email?.split("@")[0] || "Unknown"

    // Create version entry for current state
    const newVersionEntry: DocumentVersion = {
      version: (doc.version || 1),
      content_json: doc.content_json,
      status: doc.status,
      created_at: doc.updated_at || doc.created_at,
      created_by: userName,
      change_notes: changeNotes,
    }

    // Append to version history
    const existingHistory = doc.version_history || []
    const updatedHistory = [...existingHistory, newVersionEntry]

    // Update document with new version
    const { error } = await supabase
      .from("trade_documents")
      .update({
        version: (doc.version || 1) + 1,
        version_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doc.id)

    if (error) {
      toast.error("Failed to create new version")
    } else {
      toast.success(`Version ${(doc.version || 1) + 1} created`)
      fetchDocuments()
    }
    setCreatingVersion(false)
  }

  async function restoreVersion(doc: TradeDocument, version: DocumentVersion) {
    const { data: userData } = await supabase.auth.getUser()
    const userName = userData.user?.email?.split("@")[0] || "Unknown"

    // Create version entry for current state before restoring
    const currentVersionEntry: DocumentVersion = {
      version: doc.version || 1,
      content_json: doc.content_json,
      status: doc.status,
      created_at: doc.updated_at || doc.created_at,
      created_by: userName,
      change_notes: `Before restoring to version ${version.version}`,
    }

    const existingHistory = doc.version_history || []
    const updatedHistory = [...existingHistory, currentVersionEntry]

    // Restore to selected version
    const { error } = await supabase
      .from("trade_documents")
      .update({
        content_json: version.content_json,
        status: version.status,
        version: (doc.version || 1) + 1,
        version_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doc.id)

    if (error) {
      toast.error("Failed to restore version")
    } else {
      toast.success(`Restored to version ${version.version}`)
      setVersionHistoryDoc(null)
      fetchDocuments()
    }
  }

  function downloadDocument(doc: TradeDocument) {
    const docTypeInfo = getDocTypeInfo(doc.doc_type)
    const content = `
<!DOCTYPE html>
<html>
<head>
  <title>${docTypeInfo.label} - ${doc.doc_number}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .doc-number { color: #666; font-size: 14px; }
    .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .section h3 { margin-top: 0; color: #374151; }
    .row { display: flex; margin: 8px 0; }
    .label { width: 150px; font-weight: bold; color: #6b7280; }
    .value { color: #111827; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${docTypeInfo.label}</h1>
      <p class="doc-number">Document #: ${doc.doc_number}</p>
    </div>
    <div style="text-align: right;">
      <p><strong>TradeGuard</strong></p>
      <p style="color: #666; font-size: 12px;">Generated: ${new Date(doc.created_at).toLocaleDateString()}</p>
    </div>
  </div>

  ${doc.shipment ? `
  <div class="section">
    <h3>Shipment Details</h3>
    <div class="row"><span class="label">Reference:</span><span class="value">${doc.shipment.reference_no}</span></div>
    <div class="row"><span class="label">Product:</span><span class="value">${doc.shipment.product_name}</span></div>
    <div class="row"><span class="label">Shipper:</span><span class="value">${doc.shipment.shipper_name}</span></div>
    <div class="row"><span class="label">Consignee:</span><span class="value">${doc.shipment.consignee_name}</span></div>
    <div class="row"><span class="label">Origin:</span><span class="value">${doc.shipment.origin_country}</span></div>
    <div class="row"><span class="label">Destination:</span><span class="value">${doc.shipment.destination_country}</span></div>
  </div>
  ` : ''}

  ${doc.content_json && Object.keys(doc.content_json).length > 0 ? `
  <div class="section">
    <h3>Document Content</h3>
    ${Object.entries(doc.content_json).map(([key, value]) => `
      <div class="row">
        <span class="label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
        <span class="value">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>This document was generated by TradeGuard - Global Trade Compliance Platform</p>
    <p>Document ID: ${doc.id}</p>
  </div>
</body>
</html>
    `.trim()

    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${doc.doc_type}_${doc.doc_number}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Document downloaded")
  }

  const getDocTypeInfo = (type: string) => {
    return DOCUMENT_TYPES.find((d) => d.value === type) || {
      value: type,
      label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      icon: FileText,
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <FileCheck className="h-4 w-4 text-emerald-500" />
      case "generated":
        return <FileText className="h-4 w-4 text-indigo-500" />
      case "submitted":
        return <FileClock className="h-4 w-4 text-amber-500" />
      case "draft":
        return <FileWarning className="h-4 w-4 text-zinc-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.doc_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shipment?.reference_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shipment?.product_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || doc.doc_type === filterType
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Stats
  const stats = {
    total: documents.length,
    generated: documents.filter((d) => d.status === "generated").length,
    submitted: documents.filter((d) => d.status === "submitted").length,
    approved: documents.filter((d) => d.status === "approved").length,
  }

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Generate and manage customs documents for your shipments
            </p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setGenerateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ScrollText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.generated}</p>
                  <p className="text-xs text-muted-foreground">Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <FileClock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <FileCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document number, shipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
            >
              <option value="all">All Types</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={FileText}
                  title={documents.length === 0 ? "No documents yet" : "No matching documents"}
                  description={
                    documents.length === 0
                      ? "Generate your first customs document for a shipment"
                      : "Try adjusting your search or filters"
                  }
                  actionLabel="Generate Document"
                  onAction={() => setGenerateModalOpen(true)}
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Shipment</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <motion.tbody
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="contents"
                  >
                    {filteredDocuments.map((doc) => {
                      const typeInfo = getDocTypeInfo(doc.doc_type)
                      const TypeIcon = typeInfo.icon
                      return (
                        <motion.tr
                          key={doc.id}
                          variants={item}
                          className="group border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="font-mono text-sm">{doc.doc_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{typeInfo.label}</span>
                          </TableCell>
                          <TableCell>
                            {doc.shipment ? (
                              <div>
                                <p className="font-mono text-sm text-indigo-500">
                                  {doc.shipment.reference_no}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.shipment.product_name}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => setVersionHistoryDoc(doc)}
                              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors"
                            >
                              <GitBranch className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-sm">v{doc.version || 1}</span>
                              {(doc.version_history?.length || 0) > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({doc.version_history.length} prev)
                                </span>
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(doc.status)}
                              <StatusBadge status={doc.status as "draft" | "generated" | "submitted" | "approved"} />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(doc.updated_at || doc.created_at), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewDocument(doc)}
                                title="View document"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setVersionHistoryDoc(doc)}
                                title="Version history"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => createNewVersion(doc)}
                                disabled={creatingVersion}
                                title="Create new version"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => downloadDocument(doc)} title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => deleteDocument(doc.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </motion.tbody>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Generate Document Modal */}
        <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Document</DialogTitle>
              <DialogDescription>
                Select a document type and shipment to generate customs documentation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Document Type Selection */}
              <div className="space-y-3">
                <Label>Document Type *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOCUMENT_TYPES.map((type) => {
                    const TypeIcon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setSelectedDocType(type.value)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedDocType === type.value
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-border hover:border-indigo-500/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedDocType === type.value
                                ? "bg-indigo-500/20"
                                : "bg-muted"
                            }`}
                          >
                            <TypeIcon
                              className={`h-5 w-5 ${
                                selectedDocType === type.value
                                  ? "text-indigo-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Shipment Selection */}
              <div className="space-y-3">
                <Label>Select Shipment *</Label>
                <select
                  value={selectedShipment}
                  onChange={(e) => setSelectedShipment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                >
                  <option value="">Choose a shipment...</option>
                  {shipments.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.reference_no} - {shipment.product_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected shipment preview */}
              {selectedShipment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <p className="text-sm font-medium mb-2">Shipment Details</p>
                  {(() => {
                    const shipment = shipments.find((s) => s.id === selectedShipment)
                    return shipment ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Reference:</span>{" "}
                          <span className="font-mono">{shipment.reference_no}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Product:</span>{" "}
                          {shipment.product_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Shipper:</span>{" "}
                          {shipment.shipper_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Consignee:</span>{" "}
                          {shipment.consignee_name}
                        </div>
                      </div>
                    ) : null
                  })()}
                </motion.div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={generateDocument}
                disabled={!selectedDocType || !selectedShipment || generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Document
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Document Modal */}
        <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {viewDocument && getStatusIcon(viewDocument.status)}
                Document Details
              </DialogTitle>
            </DialogHeader>

            {viewDocument && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Document Number</p>
                    <p className="font-mono">{viewDocument.doc_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p>{getDocTypeInfo(viewDocument.doc_type).label}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={viewDocument.status as "draft" | "generated" | "submitted" | "approved"} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{format(new Date(viewDocument.created_at), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                </div>

                {viewDocument.shipment && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Linked Shipment</p>
                    <p className="font-mono text-indigo-500">{viewDocument.shipment.reference_no}</p>
                    <p className="text-sm text-muted-foreground">{viewDocument.shipment.product_name}</p>
                  </div>
                )}

                {viewDocument.content_json && Object.keys(viewDocument.content_json).length > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Document Content</p>
                    <pre className="text-xs overflow-auto max-h-48">
                      {JSON.stringify(viewDocument.content_json, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setViewDocument(null)}>
                    Close
                  </Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => downloadDocument(viewDocument)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Version History Modal */}
        <Dialog open={!!versionHistoryDoc} onOpenChange={() => setVersionHistoryDoc(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-indigo-500" />
                Version History
              </DialogTitle>
              <DialogDescription>
                {versionHistoryDoc && (
                  <>
                    {getDocTypeInfo(versionHistoryDoc.doc_type).label} - {versionHistoryDoc.doc_number}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {versionHistoryDoc && (
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {/* Current Version */}
                <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white text-sm font-bold">
                        v{versionHistoryDoc.version || 1}
                      </div>
                      <div>
                        <p className="font-medium">Current Version</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(versionHistoryDoc.updated_at || versionHistoryDoc.created_at), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={versionHistoryDoc.status as "draft" | "generated" | "submitted" | "approved"} />
                  </div>
                </div>

                {/* Version History */}
                {versionHistoryDoc.version_history && versionHistoryDoc.version_history.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Previous Versions</p>
                    {[...versionHistoryDoc.version_history].reverse().map((version, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-muted/50 rounded-lg border border-border hover:border-indigo-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-sm font-mono">
                              v{version.version}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{version.change_notes}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{format(new Date(version.created_at), "MMM dd, yyyy HH:mm")}</span>
                                <span>by {version.created_by}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={version.status as "draft" | "generated" | "submitted" | "approved"} />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => restoreVersion(versionHistoryDoc, version)}
                              className="text-xs"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No previous versions</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is the first version of the document
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => versionHistoryDoc && createNewVersion(versionHistoryDoc)}
                disabled={creatingVersion}
              >
                {creatingVersion ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Create New Version
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setVersionHistoryDoc(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  )
}
