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
  Package,
  AlertTriangle,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { SearchDialog } from "@/components/shared/search-dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Notification {
  id: string
  type: "shipment" | "compliance" | "document" | "system"
  title: string
  message: string
  read: boolean
  created_at: string
}

// Demo notifications
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "compliance",
    title: "Compliance Alert",
    message: "Shipment TG-2026-00142 flagged for HS code review",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: "2",
    type: "shipment",
    title: "Shipment Cleared",
    message: "TG-2026-00138 cleared customs in Mumbai",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: "3",
    type: "document",
    title: "Document Generated",
    message: "Certificate of Origin ready for TG-2026-00135",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: "4",
    type: "system",
    title: "Regulatory Update",
    message: "New EU import regulations effective from April 1",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "5",
    type: "compliance",
    title: "Exception Resolved",
    message: "Missing documentation issue resolved for TG-2026-00129",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
]

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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const currentPage = pathNames[pathname] || "Dashboard"
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function getNotificationIcon(type: Notification["type"]) {
    switch (type) {
      case "shipment":
        return <Package className="h-4 w-4 text-indigo-500" />
      case "compliance":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "document":
        return <FileText className="h-4 w-4 text-emerald-500" />
      case "system":
        return <Shield className="h-4 w-4 text-blue-500" />
    }
  }

  function markAsRead(id: string) {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  function markAllAsRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  function dismissNotification(id: string) {
    setNotifications(notifications.filter(n => n.id !== id))
  }

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
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-indigo-500 text-[10px] font-medium text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-popover border border-border shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-500 hover:text-indigo-600"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 cursor-pointer ${
                        !notification.read ? "bg-indigo-500/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              dismissNotification(notification.id)
                            }}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="shrink-0">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 block" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-border">
                <button
                  onClick={() => {
                    setNotificationsOpen(false)
                    router.push("/dashboard/settings?tab=notifications")
                  }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2"
                >
                  Notification Settings
                </button>
              </div>
            </div>
          )}
        </div>

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
