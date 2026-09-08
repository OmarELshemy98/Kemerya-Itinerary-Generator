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
  Pencil,
  Trash2,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUser, UserRole } from "@/types";

interface ItineraryData {
  id: string;
  user_id: string;
  tour_title: string | null;
  custom_tour_title: string | null;
  is_custom_tour: boolean;
  client_name: string | null;
  total_price: number;
  currency: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

function UsersPageContent() {
  const supabase = createClient();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(true); // افتراض إنه super admin لأن الـ middleware حما الصفحة
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // Add user dialog state
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newFullName, setNewFullName] = React.useState("");
  const [newPhoneNumber, setNewPhoneNumber] = React.useState("");
  const [newRole, setNewRole] = React.useState<UserRole>("viewer");
  const [addingUser, setAddingUser] = React.useState(false);
  const [addError, setAddError] = React.useState<string | null>(null);

  // Edit user dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);
  const [editFullName, setEditFullName] = React.useState("");
  const [editRole, setEditRole] = React.useState<UserRole>("viewer");
  const [editIsActive, setEditIsActive] = React.useState(true);
  const [editPassword, setEditPassword] = React.useState("");
  const [editingUser_, setEditingUser_] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  // Delete user dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<AdminUser | null>(null);
  const [deletingUser__, setDeletingUser__] = React.useState(false);

  // View itineraries state
  const [itinerariesDialogOpen, setItinerariesDialogOpen] = React.useState(false);
  const [viewingUser, setViewingUser] = React.useState<AdminUser | null>(null);
  const [userItineraries, setUserItineraries] = React.useState<ItineraryData[]>([]);
  const [loadingItineraries, setLoadingItineraries] = React.useState(false);

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      console.log("=== FETCH USERS: Starting ===");
      const res = await fetch("/api/admin/users", {
        cache: "no-store", // تخطي الـ caching
      });
      console.log("=== FETCH USERS: Response status ===", res.status);
      const json = await res.json();
      console.log("=== FETCH USERS: Response JSON ===", json);
      if (json.ok) {
        console.log("=== FETCH USERS: Users count ===", json.users?.length);
        setUsers(json.users);
      } else {
        console.error("=== FETCH USERS: API error ===", json.error);
      }
    } catch (e) {
      console.error("=== FETCH USERS: Fetch error ===", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب بيانات المستخدم الحالي
  React.useEffect(() => {
    async function fetchCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUserId(user.id);
        // جلب الـ role من قاعدة البيانات
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile?.role) {
          setIsSuperAdmin(profile.role === "super_admin");
        }
      }
    }
    fetchCurrentUser();
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

  // Edit user handler
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditRole(user.role);
    setEditIsActive(user.is_active);
    setEditPassword("");
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setEditingUser_(true);
    setEditError(null);

    try {
      const body: any = {
        full_name: editFullName,
        role: editRole,
        is_active: editIsActive,
      };
      if (editPassword && editPassword.length >= 6) {
        body.password = editPassword;
      }

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setEditError(json.error || "Failed to update user");
        setEditingUser_(false);
        return;
      }

      setEditDialogOpen(false);
      await fetchUsers();
    } catch (e: any) {
      setEditError(e?.message || "An error occurred");
    } finally {
      setEditingUser_(false);
    }
  };

  // Delete user handler
  const handleDeleteUser = (user: AdminUser) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeletingUser__(true);

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok && !json.ok) {
        console.error("Failed to delete user:", json.error);
      }

      setDeleteDialogOpen(false);
      await fetchUsers();
    } catch (e: any) {
      console.error("Delete error:", e);
    } finally {
      setDeletingUser__(false);
    }
  };

  // View itineraries handler
  const handleViewItineraries = async (user: AdminUser) => {
    setViewingUser(user);
    setItinerariesDialogOpen(true);
    setLoadingItineraries(true);

    try {
      // Fetch all itineraries and filter by user
      const res = await fetch("/api/itineraries", { cache: "no-store" });
      const json = await res.json();

      if (json.ok && json.itineraries) {
        const filtered = json.itineraries.filter(
          (i: any) => i.user_id === user.id
        );
        setUserItineraries(filtered);
      } else {
        setUserItineraries([]);
      }
    } catch (e) {
      console.error("Failed to fetch itineraries:", e);
      setUserItineraries([]);
    } finally {
      setLoadingItineraries(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };

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
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
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
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewItineraries(user)}
                        title="View itineraries"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editingUser?.email || ""} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_role">Role</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as UserRole)}
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
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={editIsActive ? "active" : "inactive"}
                onValueChange={(v) => setEditIsActive(v === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_password">New Password (optional)</Label>
              <Input
                id="edit_password"
                type="password"
                placeholder="Leave blank to keep current"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editingUser_}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={editingUser_ || !editFullName}
            >
              {editingUser_ ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="py-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{deletingUser.full_name}</p>
                <p className="text-sm text-slate-500">{deletingUser.email}</p>
                <p className="text-xs text-slate-400 mt-1">Role: {deletingUser.role.replace("_", " ")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingUser__}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingUser__}
            >
              {deletingUser__ ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Itineraries Dialog */}
      <Dialog open={itinerariesDialogOpen} onOpenChange={setItinerariesDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Itineraries for {viewingUser?.full_name}
            </DialogTitle>
            <DialogDescription>
              All itineraries created by this user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingItineraries ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-2 text-sm text-slate-500">Loading itineraries...</span>
              </div>
            ) : userItineraries.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No itineraries found for this user.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userItineraries.map((itinerary) => (
                  <div
                    key={itinerary.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {itinerary.is_custom_tour
                              ? itinerary.custom_tour_title || "Custom Tour"
                              : itinerary.tour_title || "Unknown Tour"}
                          </h4>
                          {itinerary.is_custom_tour && (
                            <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-200 bg-purple-50">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
                          <div>
                            <span className="font-medium">Client:</span>{" "}
                            {itinerary.client_name || "—"}
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>{" "}
                            {formatCurrency(itinerary.total_price, itinerary.currency)}
                          </div>
                          <div>
                            <span className="font-medium">Dates:</span>{" "}
                            {formatDate(itinerary.start_date)} → {formatDate(itinerary.end_date)}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {formatDate(itinerary.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItinerariesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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