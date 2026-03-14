"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  User,
  Settings,
  LogOut,
  Building2,
  ChevronRight,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { SearchDialog } from "@/components/shared/search-dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const pathNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/shipments": "Shipments",
  "/dashboard/hs-classifier": "HS Classifier",
  "/dashboard/duty-calculator": "Duty Calculator",
  "/dashboard/denied-party": "Denied Party",
  "/dashboard/documents": "Documents",
  "/dashboard/compliance": "Compliance",
  "/dashboard/audit-log": "Audit Log",
  "/dashboard/settings": "Settings",
}

interface NavbarProps {
  user?: {
    email?: string
    user_metadata?: {
      full_name?: string
      company_name?: string
    }
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentPage = pathNames[pathname] || "Dashboard"
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cmd+K / Ctrl+K shortcut for search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-colors md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[260px]">
          <Sidebar user={user} />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground hidden sm:inline">TradeGuard</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:inline" />
        <span className="font-medium">{currentPage}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto mr-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex ml-auto px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User dropdown - custom implementation */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center justify-center rounded-full h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-popover border border-border shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setDropdownOpen(false); router.push("/dashboard/settings"); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); router.push("/dashboard/settings"); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  Company Settings
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); router.push("/dashboard/settings"); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>

              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
