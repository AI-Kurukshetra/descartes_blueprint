import { UserRole } from "./types"

// Permission types for granular access control
export type Permission =
  | "dashboard.view"
  | "shipments.view"
  | "shipments.create"
  | "shipments.edit"
  | "shipments.delete"
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "documents.view"
  | "documents.create"
  | "documents.delete"
  | "compliance.view"
  | "compliance.manage"
  | "hs_classifier.use"
  | "duty_calculator.use"
  | "denied_party.use"
  | "audit_log.view"
  | "settings.view"
  | "settings.edit"
  | "team.view"
  | "team.manage"
  | "reports.view"
  | "reports.export"

// Full permission matrix by role
export const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "dashboard.view",
    "shipments.view",
    "shipments.create",
    "shipments.edit",
    "shipments.delete",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "documents.view",
    "documents.create",
    "documents.delete",
    "compliance.view",
    "compliance.manage",
    "hs_classifier.use",
    "duty_calculator.use",
    "denied_party.use",
    "audit_log.view",
    "settings.view",
    "settings.edit",
    "team.view",
    "team.manage",
    "reports.view",
    "reports.export",
  ],
  manager: [
    "dashboard.view",
    "shipments.view",
    "shipments.create",
    "shipments.edit",
    "shipments.delete",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "documents.view",
    "documents.create",
    "documents.delete",
    "compliance.view",
    "compliance.manage",
    "hs_classifier.use",
    "duty_calculator.use",
    "denied_party.use",
    "audit_log.view",
    "settings.view",
    "team.view",
    "reports.view",
    "reports.export",
  ],
  analyst: [
    "dashboard.view",
    "shipments.view",
    "shipments.create",
    "shipments.edit",
    "products.view",
    "products.create",
    "products.edit",
    "documents.view",
    "documents.create",
    "hs_classifier.use",
    "duty_calculator.use",
    "denied_party.use",
    "settings.view",
    "reports.view",
    "reports.export",
  ],
  viewer: [
    "dashboard.view",
    "settings.view",
    "reports.view",
  ],
}

// Navigation items with required permissions
export interface NavItem {
  name: string
  href: string
  icon: string
  permission: Permission
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", permission: "dashboard.view" },
  { name: "Shipments", href: "/dashboard/shipments", icon: "Ship", permission: "shipments.view" },
  { name: "HS Classifier", href: "/dashboard/hs-classifier", icon: "Search", permission: "hs_classifier.use" },
  { name: "Duty Calculator", href: "/dashboard/duty-calculator", icon: "Calculator", permission: "duty_calculator.use" },
  { name: "Denied Party", href: "/dashboard/denied-party", icon: "ShieldAlert", permission: "denied_party.use" },
  { name: "Documents", href: "/dashboard/documents", icon: "FileText", permission: "documents.view" },
  { name: "Compliance", href: "/dashboard/compliance", icon: "CheckCircle", permission: "compliance.view" },
  { name: "Audit Log", href: "/dashboard/audit-log", icon: "History", permission: "audit_log.view" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings", permission: "settings.view" },
]

// Check if a role has a specific permission
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false
  return PERMISSIONS[role]?.includes(permission) ?? false
}

// Check if a role has any of the given permissions
export function hasAnyPermission(role: UserRole | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.some(p => hasPermission(role, p))
}

// Check if a role has all of the given permissions
export function hasAllPermissions(role: UserRole | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.every(p => hasPermission(role, p))
}

// Get filtered navigation items based on role
export function getFilteredNavItems(role: UserRole | undefined | null): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter(item => hasPermission(role, item.permission))
}

// Check if user can perform CRUD operations
export function canCreate(role: UserRole | undefined | null, resource: string): boolean {
  return hasPermission(role, `${resource}.create` as Permission)
}

export function canEdit(role: UserRole | undefined | null, resource: string): boolean {
  return hasPermission(role, `${resource}.edit` as Permission)
}

export function canDelete(role: UserRole | undefined | null, resource: string): boolean {
  return hasPermission(role, `${resource}.delete` as Permission)
}

export function canView(role: UserRole | undefined | null, resource: string): boolean {
  return hasPermission(role, `${resource}.view` as Permission)
}
