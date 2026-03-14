import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"
import { createClient } from "@/lib/supabase/server"
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        {/* Sidebar - desktop only */}
        <Sidebar user={user} />

        {/* Main content area */}
        <div className="md:pl-[260px] transition-all duration-200">
          <Navbar user={user} />
          <main className="p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />

        <Toaster position="top-right" richColors />
      </div>
    </ThemeProvider>
  )
}
