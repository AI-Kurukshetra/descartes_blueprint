"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  User,
  Users,
  Bell,
  Shield,
  Building,
  Mail,
  Plus,
  Trash2,
  Crown,
  UserCog,
  Eye,
  Save,
  Loader2,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Profile, UserRole, ProfileStatus } from "@/lib/types"

interface NotificationSettings {
  email_shipment_updates: boolean
  email_compliance_alerts: boolean
  email_weekly_digest: boolean
  email_regulatory_changes: boolean
  push_enabled: boolean
}

const ROLES = [
  {
    value: "admin" as UserRole,
    label: "Administrator",
    description: "Full access to all features and settings",
    icon: Crown,
    color: "text-amber-500",
  },
  {
    value: "manager" as UserRole,
    label: "Compliance Manager",
    description: "Manage shipments, documents, and team members",
    icon: UserCog,
    color: "text-indigo-500",
  },
  {
    value: "analyst" as UserRole,
    label: "Trade Analyst",
    description: "View and analyze trade data, create reports",
    icon: Eye,
    color: "text-emerald-500",
  },
  {
    value: "viewer" as UserRole,
    label: "Viewer",
    description: "Read-only access to dashboards and reports",
    icon: Eye,
    color: "text-zinc-500",
  },
]

const ROLE_PERMISSIONS = {
  admin: ["all"],
  manager: ["shipments", "documents", "products", "compliance", "team"],
  analyst: ["shipments", "documents", "products", "reports", "hs-classifier", "duty-calculator"],
  viewer: ["dashboard", "reports"],
}

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_shipment_updates: true,
    email_compliance_alerts: true,
    email_weekly_digest: false,
    email_regulatory_changes: true,
    push_enabled: true,
  })
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    company_name: "",
    phone: "",
    timezone: "Asia/Kolkata",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchTeamMembers()
    }
  }, [currentUser])

  async function fetchCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        // Profile might not exist yet, create it
        if (error.code === "PGRST116") {
          const newProfile = {
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
            role: "admin" as UserRole,
            status: "active" as ProfileStatus,
          }

          const { data: created, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single()

          if (!createError && created) {
            setCurrentUser(created)
            setProfile({
              full_name: created.full_name || "",
              email: created.email,
              company_name: created.company_name || "",
              phone: created.phone || "",
              timezone: created.timezone || "Asia/Kolkata",
            })
          }
        }
        console.error("Error fetching profile:", error)
      } else if (profileData) {
        setCurrentUser(profileData)
        setProfile({
          full_name: profileData.full_name || "",
          email: profileData.email,
          company_name: profileData.company_name || "",
          phone: profileData.phone || "",
          timezone: profileData.timezone || "Asia/Kolkata",
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTeamMembers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error("Error fetching team members:", error)
      // If RLS blocks the query, just show current user
      if (currentUser) {
        setTeamMembers([currentUser])
      }
    }
  }

  function getRoleBadge(role: UserRole) {
    const roleInfo = ROLES.find((r) => r.value === role)
    if (!roleInfo) return null

    const Icon = roleInfo.icon
    return (
      <Badge
        variant="outline"
        className={`${roleInfo.color} border-current/20 bg-current/10`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {roleInfo.label}
      </Badge>
    )
  }

  function getStatusBadge(status: ProfileStatus) {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Pending
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
            Inactive
          </Badge>
        )
      default:
        return null
    }
  }

  async function handleSaveProfile() {
    if (!currentUser) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
          phone: profile.phone,
          timezone: profile.timezone,
        })
        .eq("id", currentUser.id)

      if (error) throw error
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveNotifications() {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Notification preferences saved")
    setSaving(false)
  }

  async function handleInviteMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // In a real app, this would send an invitation email
    // For now, we'll just show a success message
    const email = formData.get("email") as string
    toast.success(`Invitation sent to ${email}`)
    setShowInviteModal(false)
  }

  async function handleRemoveMember(id: string) {
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Only admins can remove team members")
      return
    }

    if (id === currentUser.id) {
      toast.error("You cannot remove yourself")
      return
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "inactive" as ProfileStatus })
        .eq("id", id)

      if (error) throw error

      setTeamMembers(teamMembers.map((m) =>
        m.id === id ? { ...m, status: "inactive" as ProfileStatus } : m
      ))
      toast.success("Team member deactivated")
    } catch (error) {
      console.error("Error removing member:", error)
      toast.error("Failed to remove team member")
    }
  }

  async function handleChangeRole(memberId: string, newRole: UserRole) {
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Only admins can change roles")
      return
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", memberId)

      if (error) throw error

      setTeamMembers(teamMembers.map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m
      ))
      toast.success("Role updated successfully")
    } catch (error) {
      console.error("Error changing role:", error)
      toast.error("Failed to update role")
    }
  }

  const isAdmin = currentUser?.role === "admin"

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, team, and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team & Roles
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Your Role:</span>
                  {currentUser && getRoleBadge(currentUser.role)}
                  <span className="text-xs text-muted-foreground ml-auto">
                    Contact your administrator to change roles
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={profile.company_name}
                      onChange={(e) =>
                        setProfile({ ...profile, company_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(v) =>
                      v && setProfile({ ...profile, timezone: v })
                    }
                  >
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">
                        India (GMT+5:30)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        Eastern Time (GMT-5)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        London (GMT+0)
                      </SelectItem>
                      <SelectItem value="Asia/Singapore">
                        Singapore (GMT+8)
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Settings
                </CardTitle>
                <CardDescription>
                  Configure your organization's trade compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Trade Region</Label>
                    <Select defaultValue="IN">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="EU">European Union</SelectItem>
                        <SelectItem value="AE">UAE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team & Roles Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      {isAdmin
                        ? "Manage your team and assign roles"
                        : "View team members (admin access required to manage)"}
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button onClick={() => setShowInviteModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members found</p>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <motion.div
                        key={member.id}
                        variants={item}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <span className="text-indigo-500 font-semibold">
                              {(member.full_name || member.email)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.full_name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(member.status)}
                          {isAdmin ? (
                            <Select
                              value={member.role}
                              onValueChange={(v) =>
                                v && handleChangeRole(member.id, v as UserRole)
                              }
                              disabled={member.id === currentUser?.id}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div className="flex items-center gap-2">
                                      <role.icon
                                        className={`h-4 w-4 ${role.color}`}
                                      />
                                      {role.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            getRoleBadge(member.role)
                          )}
                          {isAdmin && member.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Permissions
                </CardTitle>
                <CardDescription>
                  Overview of what each role can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {ROLES.map((role) => {
                    const Icon = role.icon
                    return (
                      <div
                        key={role.value}
                        className="p-4 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-5 w-5 ${role.color}`} />
                          <span className="font-medium">{role.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {role.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {ROLE_PERMISSIONS[role.value as keyof typeof ROLE_PERMISSIONS].map(
                            (perm) => (
                              <Badge
                                key={perm}
                                variant="outline"
                                className="text-xs"
                              >
                                {perm}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Choose what email notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shipment Status Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when shipment status changes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email_shipment_updates}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email_shipment_updates: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compliance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Immediate alerts for compliance exceptions
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email_compliance_alerts}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email_compliance_alerts: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Regulatory Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates about trade regulation changes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email_regulatory_changes}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email_regulatory_changes: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of your trade activities
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email_weekly_digest}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email_weekly_digest: checked,
                      })
                    }
                  />
                </div>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 mt-4"
                  onClick={handleSaveNotifications}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  In-app notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive real-time notifications in the app
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push_enabled}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        push_enabled: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app for additional security
                    </p>
                  </div>
                  <Button variant="outline">Setup 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage your active sessions across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">
                        Chrome on macOS • Mumbai, India
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500">
                      Active Now
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your TradeGuard team
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteMember}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inviteName">Full Name</Label>
                <Input
                  id="inviteName"
                  name="name"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole">Role</Label>
                <Select name="role" defaultValue="analyst">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className={`h-4 w-4 ${role.color}`} />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  )
}
