"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Loader2,
  Shield,
  ShieldCheck,
  UserCog,
  Eye,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUser, UserRole } from "@/types";

function UsersPageContent() {
  const supabase = createClient();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [accessDenied, setAccessDenied] = React.useState(false);

  // Add user dialog state
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newFullName, setNewFullName] = React.useState("");
  const [newPhoneNumber, setNewPhoneNumber] = React.useState("");
  const [newRole, setNewRole] = React.useState<UserRole>("viewer");
  const [addingUser, setAddingUser] = React.useState(false);
  const [addError, setAddError] = React.useState<string | null>(null);

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.ok) {
        setUsers(json.users);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if current user is super admin
  React.useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      console.log("=== USERS PAGE: User ===", user);
      
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        
        console.log("=== USERS PAGE: Profile ===", profile);
        console.log("=== USERS PAGE: Profile Error ===", profileError);
        
        const userIsSuperAdmin = profile?.role === "super_admin";
        console.log("=== USERS PAGE: Is Super Admin ===", userIsSuperAdmin);
        
        setIsSuperAdmin(userIsSuperAdmin);
        
        // لو المستخدم مش سوبر أدمن، ميشوفش الصفحة
        if (!userIsSuperAdmin) {
          console.log("=== USERS PAGE: Setting access denied to TRUE ===");
          setAccessDenied(true);
        } else {
          console.log("=== USERS PAGE: User IS super admin, access allowed ===");
          setAccessDenied(false);
        }
      }
    }
    checkRole();
    fetchUsers();
  }, [supabase, fetchUsers]);

  // Add user handler
  const handleAddUser = async () => {
    setAddingUser(true);
    setAddError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newFullName,
          phone_number: newPhoneNumber || undefined,
          role: newRole,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setAddError(json.error || "Failed to create user");
        setAddingUser(false);
        return;
      }

      // Reset form
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewPhoneNumber("");
      setNewRole("viewer");
      setAddDialogOpen(false);
      await fetchUsers();
    } catch (e: any) {
      setAddError(e?.message || "An error occurred");
    } finally {
      setAddingUser(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.phone_number && u.phone_number.includes(q))
    );
  }, [users, searchQuery]);

  const roleIcon = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <ShieldCheck className="h-4 w-4 text-amber-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-emerald-500" />;
      case "operator":
        return <UserCog className="h-4 w-4 text-blue-500" />;
      default:
        return <Eye className="h-4 w-4 text-slate-400" />;
    }
  };

  const roleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "admin":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "operator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // عرض رسالة رفض الوصول لو المستخدم مش سوبر أدمن
  if (accessDenied) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <Shield className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-xl font-semibold text-red-800">Access Denied</h2>
        <p className="mb-4 text-sm text-red-600">
          هذه الصفحة متاحة للسوبر أدمن فقط. ليس لديك الصلاحية للوصول إلى هذا القسم.
        </p>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">
            Manage user accounts and permissions
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. The user will be able to sign in with their email and password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {addError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {addError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+20 123 456 7890"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newRole}
                    onValueChange={(v) => setNewRole(v as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                  disabled={addingUser}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={
                    addingUser ||
                    !newEmail ||
                    !newPassword ||
                    !newFullName ||
                    newPassword.length < 6
                  }
                >
                  {addingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search users by name, email, role, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <p className="text-sm text-slate-500">
                    {searchQuery ? "No users match your search" : "No users found"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <span className="text-sm font-medium text-slate-600">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.full_name}
                          {user.id === currentUserId && (
                            <span className="ml-2 text-xs text-slate-400">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail className="h-3.5 w-3.5" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.phone_number ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone className="h-3.5 w-3.5" />
                        {user.phone_number}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {roleIcon(user.role)}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          roleBadgeVariant(user.role)
                        )}
                      >
                        {user.role.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        user.is_active
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      )}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          <p className="text-xs text-slate-500">Total Users</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">
            {users.filter((u) => u.is_active).length}
          </p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">
            {users.filter((u) => u.role === "super_admin").length}
          </p>
          <p className="text-xs text-slate-500">Super Admins</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === "operator" || u.role === "admin").length}
          </p>
          <p className="text-xs text-slate-500">Staff</p>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <UsersPageContent />
    </DashboardLayout>
  );
}