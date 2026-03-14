"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Package,
  FileText,
  Calculator,
  Shield,
  Settings,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"

const searchItems = [
  { name: "Dashboard", href: "/dashboard", icon: Package, category: "Pages" },
  { name: "Shipments", href: "/dashboard/shipments", icon: Package, category: "Pages" },
  { name: "HS Classifier", href: "/dashboard/hs-classifier", icon: FileText, category: "Pages" },
  { name: "Duty Calculator", href: "/dashboard/duty-calculator", icon: Calculator, category: "Pages" },
  { name: "Denied Party Screening", href: "/dashboard/denied-party", icon: Shield, category: "Pages" },
  { name: "Documents", href: "/dashboard/documents", icon: FileText, category: "Pages" },
  { name: "Compliance", href: "/dashboard/compliance", icon: Shield, category: "Pages" },
  { name: "Audit Log", href: "/dashboard/audit-log", icon: FileText, category: "Pages" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, category: "Pages" },
]

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const filteredItems = searchItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = useCallback((href: string) => {
    onClose()
    setQuery("")
    router.push(href)
  }, [onClose, router])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages..."
                className="flex-1 h-14 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border bg-muted/50">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↵</kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
