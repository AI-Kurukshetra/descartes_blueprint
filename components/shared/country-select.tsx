"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Search, Check, X } from "lucide-react"
import { COUNTRIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface CountrySelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  allowClear?: boolean
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  className,
  disabled = false,
  allowClear = false,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedCountry = COUNTRIES.find((c) => c.code === value)

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleSelect = (code: string) => {
    onChange(code)
    setOpen(false)
    setSearch("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors",
          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <div className="flex items-center gap-1">
          {allowClear && value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-muted"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg"
          >
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto p-1">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm",
                      "hover:bg-accent transition-colors",
                      value === country.code && "bg-indigo-500/10 text-indigo-500"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                    {value === country.code && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
