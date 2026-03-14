"use client"

import { useState, forwardRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Forward ref button for dropdown trigger
const ProfileButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { initials: string }
>(({ initials, ...props }, ref) => (
  <button
    ref={ref}
    className="inline-flex items-center justify-center rounded-full h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-colors"
    {...props}
  >
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-sm">
        {initials}
      </AvatarFallback>
    </Avatar>
  </button>
))
ProfileButton.displayName = "ProfileButton"

// Forward ref button for mobile menu trigger
const MobileMenuButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => (
  <button
    ref={ref}
    className="inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-colors md:hidden"
    {...props}
  >
    <Menu className="h-5 w-5" />
    <span className="sr-only">Toggle menu</span>
  </button>
))
MobileMenuButton.displayName = "MobileMenuButton"

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
  const [searchOpen, setSearchOpen] = useState(false)

  const currentPage = pathNames[pathname] || "Dashboard"
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const companyName = user?.user_metadata?.company_name || "TradeGuard"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
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
        <SheetTrigger render={<MobileMenuButton />} />
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search... (Cmd+K)"
            className="pl-9 bg-muted/50 border-transparent focus:border-border"
          />
        </div>
      </div>

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

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<ProfileButton initials={initials} />} />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Building2 className="mr-2 h-4 w-4" />
              Company Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
