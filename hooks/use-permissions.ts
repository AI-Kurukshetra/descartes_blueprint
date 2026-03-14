"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserRole } from "@/lib/types"
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getFilteredNavItems,
  canCreate,
  canEdit,
  canDelete,
  canView,
  NavItem,
} from "@/lib/permissions"

interface UsePermissionsReturn {
  role: UserRole | null
  isLoading: boolean
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  canCreate: (resource: string) => boolean
  canEdit: (resource: string) => boolean
  canDelete: (resource: string) => boolean
  canView: (resource: string) => boolean
  navItems: NavItem[]
  isAdmin: boolean
  isManager: boolean
  isAnalyst: boolean
  isViewer: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role) {
          setRole(profile.role as UserRole)
        } else {
          // Default to viewer if no role found
          setRole("viewer")
        }
      }
      setIsLoading(false)
    }

    fetchRole()
  }, [])

  return {
    role,
    isLoading,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    canCreate: (resource: string) => canCreate(role, resource),
    canEdit: (resource: string) => canEdit(role, resource),
    canDelete: (resource: string) => canDelete(role, resource),
    canView: (resource: string) => canView(role, resource),
    navItems: getFilteredNavItems(role),
    isAdmin: role === "admin",
    isManager: role === "manager",
    isAnalyst: role === "analyst",
    isViewer: role === "viewer",
  }
}
