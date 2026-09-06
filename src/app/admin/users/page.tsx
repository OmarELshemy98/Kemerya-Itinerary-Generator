"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  Shield,
  UserCheck,
  Eye,
  Loader2,
  Search,
  ArrowLeft,
  ChevronDown,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDateShort } from "@/lib/utils";
import type { AdminUser, CreateUserRequest, UpdateUserRequest, UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "super_admin",
    label: "Super Admin",
    description: "Full access + user management",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage tours + bookings",
    icon: <Shield className="h-3.5 w-3.5" />,
  },
  {
    value: "operator",
    label: "Operator",
    description: "Create itineraries",
    icon: <UserCheck className="h-3.5 w-3.5" />,
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access",
    icon: <Eye className="h-3.5 w-3.5" />,
  },
];

const ROLE_STYLES: Record<UserRole, string> = {
  super_admin: "bg-[#C9A962]/15 text-[#8b7435] border-[#C9A962]/40",
  admin: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
  operator: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  viewer: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label])) as Record<
  UserRole,
  string
>;

function getRoleIcon(role: UserRole) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.icon ?? <Eye className="h-3.5 w-3.5" />;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editUserId, setEditUserId] = React.useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);
  const [roleEditingId, setRoleEditingId] = React.useState<string | null>(null);

  const pushToast = React.useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load users");
      setUsers(json.users || []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const counts = React.useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const byRole = (role: UserRole) => users.filter((u) => u.role === role).length;
    return {
      total,
      active,
      super_admin: byRole("super_admin"),
      admin: byRole("admin"),
      operator: byRole("operator"),
      viewer: byRole("viewer"),
    };
  }, [users]);

  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to create user");
      pushToast("success", `User ${json.user.email} created successfully`);
      setAddOpen(false);
      await loadUsers();
    } catch (e: any) {
      pushToast("error", String(e?.message || e));
    }
  };

  const handlePatchUser = async (
    id: string,
    patch: UpdateUserRequest & { password?: string }
  ) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to update user");
      pushToast("success", "User updated");
      setEditUserId(null);
      setRoleEditingId(null);
      await loadUsers();
    } catch (e: any) {
      pushToast("error", String(e?.message || e));
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete user");
      pushToast("success", "User deleted");
      setDeleteUserId(null);
      await loadUsers();
    } catch (e: any) {
      pushToast("error", String(e?.message || e));
    }
  };

  const editingUser = editUserId ? users.find((u) => u.id === editUserId) : null;
  const deletingUser = deleteUserId ? users.find((u) => u.id === deleteUserId) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <header className="kemerya-gradient text-white shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="h-9 rounded-md border-white/20 bg-white/5 px-3 text-xs text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Dashboard
              </Button>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl kemerya-gold-gradient shadow-lg">
                <Users className="h-5 w-5 text-[#0F172A]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">User Management</h1>
                <p className="text-xs text-[#C9A962] uppercase tracking-[0.2em]">
                  Super Admin Console
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or role…"
                  className="w-64 border-white/20 bg-white/10 pl-9 text-sm text-white placeholder:text-slate-400 focus:bg-white/15"
                />
              </div>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold" size="sm" className="h-9 px-4 text-xs">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add User
                  </Button>
                </DialogTrigger>
                <AddUserDialogContent onSubmit={handleCreateUser} />
              </Dialog>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total Users" value={String(counts.total)} accent="#C9A962" />
            <StatCard label="Active" value={String(counts.active)} accent="#10B981" />
            <StatCard label="Super Admin" value={String(counts.super_admin)} accent="#C9A962" />
            <StatCard label="Admins" value={String(counts.admin)} accent="#6366F1" />
            <StatCard label="Operators" value={String(counts.operator)} accent="#10B981" />
            <StatCard label="Viewers" value={String(counts.viewer)} accent="#64748B" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Failed to load users</p>
                <p className="mt-0.5 opacity-80">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={loadUsers}>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
                  <Th className="w-12">&nbsp;</Th>
                  <Th>Full Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th className="text-center">Active</Th>
                  <Th>Created</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#C9A962]" />
                      <p className="mt-2 text-xs">Loading users…</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Users className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {search ? "No users match your search" : "No users yet"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {search ? "Try a different keyword" : "Click Add User to create the first account"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={cn(
                        "transition-colors hover:bg-[#C9A962]/5",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      )}
                    >
                      <Td>
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold",
                            user.is_active
                              ? "border-[#C9A962]/30 bg-[#C9A962]/10 text-[#8b7435]"
                              : "border-slate-200 bg-slate-100 text-slate-400 line-through"
                          )}
                        >
                          {user.full_name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((s) => s[0]?.toUpperCase())
                            .join("") || "U"}
                        </div>
                      </Td>
                      <Td>
                        <p
                          className={cn(
                            "font-semibold text-slate-900",
                            !user.is_active && "text-slate-400 line-through"
                          )}
                        >
                          {user.full_name || "—"}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-400">
                          ID: {user.id.slice(0, 8)}…
                        </p>
                      </Td>
                      <Td>
                        <p className="font-mono text-xs text-slate-700">{user.email}</p>
                      </Td>
                      <Td>
                        <RoleCell
                          user={user}
                          editingId={roleEditingId}
                          setEditingId={setRoleEditingId}
                          onChange={(role) => handlePatchUser(user.id, { role })}
                        />
                      </Td>
                      <Td className="text-center">
                        <div className="inline-flex items-center gap-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={(v) => handlePatchUser(user.id, { is_active: v })}
                          />
                          <span
                            className={cn(
                              "text-[11px] font-medium uppercase tracking-wider",
                              user.is_active ? "text-emerald-600" : "text-slate-400"
                            )}
                          >
                            {user.is_active ? "On" : "Off"}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <p className="text-xs text-slate-600">{formatDateShort(user.created_at)}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(user.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </Td>
                      <Td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Dialog
                            open={editUserId === user.id}
                            onOpenChange={(v) => setEditUserId(v ? user.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:bg-[#C9A962]/10 hover:text-[#8b7435]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            {editingUser?.id === user.id && (
                              <EditUserDialogContent
                                user={editingUser}
                                onSubmit={(patch) => handlePatchUser(user.id, patch)}
                              />
                            )}
                          </Dialog>

                          <Dialog
                            open={deleteUserId === user.id}
                            onOpenChange={(v) => setDeleteUserId(v ? user.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:bg-red-500/10 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            {deletingUser?.id === user.id && (
                              <DeleteUserDialogContent
                                user={deletingUser}
                                onConfirm={() => handleDeleteUser(user.id)}
                              />
                            )}
                          </Dialog>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </Card>
      </main>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur",
              t.type === "success" &&
                "border-emerald-200 bg-emerald-50/95 text-emerald-800",
              t.type === "error" && "border-red-200 bg-red-50/95 text-red-800",
              t.type === "info" && "border-slate-200 bg-white/95 text-slate-800"
            )}
          >
            <div className="flex items-center gap-2">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {t.type === "error" && <XCircle className="h-4 w-4 shrink-0" />}
              <span className="font-medium">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-white/10 px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-slate-100 px-5 py-3.5 align-middle", className)}>
      {children}
    </td>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all hover:border-white/20 hover:bg-white/10">
      <div
        className="absolute -right-6 -top-6 h-14 w-14 rounded-full transition-all group-hover:opacity-30"
        style={{ background: accent, opacity: 0.1 }}
      />
      <div className="relative">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-300">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function RoleCell({
  user,
  editingId,
  setEditingId,
  onChange,
}: {
  user: AdminUser;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onChange: (role: UserRole) => void;
}) {
  const isEditing = editingId === user.id;
  const [pendingRole, setPendingRole] = React.useState<UserRole>(user.role);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (isEditing) setPendingRole(user.role);
  }, [isEditing, user.role]);

  if (!isEditing) {
    return (
      <button
        onClick={() => setEditingId(user.id)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all hover:scale-[1.02] hover:shadow-sm",
          ROLE_STYLES[user.role]
        )}
      >
        {getRoleIcon(user.role)}
        <span>{ROLE_LABEL[user.role]}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
    );
  }

  return (
    <form
      className="inline-flex items-center gap-1"
      onSubmit={async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
          await onChange(pendingRole);
        } finally {
          setSaving(false);
        }
      }}
    >
      <Select
        value={pendingRole}
        onValueChange={(v) => setPendingRole(v as UserRole)}
      >
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Role</SelectLabel>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value} className="text-xs">
                <span className="inline-flex items-center gap-2">
                  {r.icon}
                  <span className="font-medium">{r.label}</span>
                  <span className="text-[10px] text-slate-500">· {r.description}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        disabled={saving || pendingRole === user.role}
        className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10"
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={saving}
        onClick={() => setEditingId(null)}
        className="h-8 w-8 text-slate-500 hover:bg-slate-500/10"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </form>
  );
}

function AddUserDialogContent({
  onSubmit,
}: {
  onSubmit: (data: CreateUserRequest) => Promise<void>;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("operator");
  const [err, setErr] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!fullName.trim()) return setErr("Full name is required");
    if (!email.trim()) return setErr("Email is required");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address");
    if (!password) return setErr("Password is required");
    if (password.length < 6) return setErr("Password must be at least 6 characters");
    setSubmitting(true);
    try {
      await onSubmit({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg kemerya-gold-gradient">
            <Plus className="h-4 w-4 text-[#0F172A]" />
          </div>
          Add New User
        </DialogTitle>
        <DialogDescription>
          Create a new team member account with an access role. Temporary password will be set —
          ask them to change it on first login.
        </DialogDescription>
      </DialogHeader>

      <Separator className="my-1" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ahmed Mahmoud"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ahmed@kemeryatours.com"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Temporary Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Access Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={submitting}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Permission Level</SelectLabel>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 font-medium">
                        {r.icon}
                        {r.label}
                      </div>
                      <span className="text-[11px] text-slate-500">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {err}
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="ghost" type="button" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" variant="gold" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditUserDialogContent({
  user,
  onSubmit,
}: {
  user: AdminUser;
  onSubmit: (patch: UpdateUserRequest & { password?: string }) => Promise<void>;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [fullName, setFullName] = React.useState(user.full_name);
  const [role, setRole] = React.useState<UserRole>(user.role);
  const [isActive, setIsActive] = React.useState(user.is_active);
  const [changePassword, setChangePassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!fullName.trim()) return setErr("Full name is required");
    if (changePassword) {
      if (!newPassword) return setErr("New password is required");
      if (newPassword.length < 6) return setErr("Password must be at least 6 characters");
      if (newPassword !== confirmPassword) return setErr("Passwords do not match");
    }
    setSubmitting(true);
    try {
      const patch: UpdateUserRequest & { password?: string } = {
        full_name: fullName.trim(),
        role,
        is_active: isActive,
      };
      if (changePassword && newPassword) {
        patch.password = newPassword;
      }
      await onSubmit(patch);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#C9A962]/40 bg-[#C9A962]/10 text-[#8b7435]">
            <Pencil className="h-4 w-4" />
          </div>
          Edit User
        </DialogTitle>
        <DialogDescription>
          Update profile details and permissions for{" "}
          <span className="font-mono text-slate-700">{user.email}</span>.
        </DialogDescription>
      </DialogHeader>

      <Separator className="my-1" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_full_name">Full Name</Label>
          <Input
            id="edit_full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
            {user.email}
          </div>
          <p className="text-[11px] text-slate-400">
            Email is managed by Supabase Auth and cannot be edited here.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Access Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={submitting}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Permission Level</SelectLabel>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 font-medium">
                        {r.icon}
                        {r.label}
                      </div>
                      <span className="text-[11px] text-slate-500">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Account Status</p>
            <p className="text-xs text-slate-500">
              Disabled users cannot sign in or access the dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-wider",
                isActive ? "text-emerald-600" : "text-slate-400"
              )}
            >
              {isActive ? "Active" : "Disabled"}
            </span>
            <Switch checked={isActive} onCheckedChange={setIsActive} disabled={submitting} />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Change Password</p>
              <p className="text-xs text-slate-500">
                Set a new temporary password for this user.
              </p>
            </div>
            <Switch
              checked={changePassword}
              onCheckedChange={setChangePassword}
              disabled={submitting}
            />
          </div>
          {changePassword && (
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="edit_new_password">New Password</Label>
                <Input
                  id="edit_new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_confirm_password">Confirm Password</Label>
                <Input
                  id="edit_confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  disabled={submitting}
                />
              </div>
            </div>
          )}
        </div>

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {err}
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="ghost" type="button" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" variant="gold" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function DeleteUserDialogContent({
  user,
  onConfirm,
}: {
  user: AdminUser;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState("");

  const expected = `delete ${user.email}`;
  const canSubmit = !deleting && confirm.trim().toLowerCase() === expected.toLowerCase();

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
            <Trash2 className="h-4 w-4" />
          </div>
          Delete User
        </DialogTitle>
        <DialogDescription>
          This will permanently remove the user account. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <Separator className="my-1" />

      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50/60 p-4">
          <p className="text-sm font-semibold text-red-900">User to delete</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-red-700 shadow-sm">
              {user.full_name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase())
                .join("") || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.full_name || "—"}</p>
              <p className="font-mono text-xs text-slate-600">{user.email}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Role: <span className="font-medium capitalize">{user.role.replace("_", " ")}</span>
                {" · "}Created {formatDateShort(user.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_delete">
            Type <span className="font-mono font-semibold">{expected}</span> to confirm:
          </Label>
          <Input
            id="confirm_delete"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={expected}
            disabled={deleting}
          />
        </div>

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {err}
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="ghost" type="button" disabled={deleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={async () => {
              setErr(null);
              setDeleting(true);
              try {
                await onConfirm();
              } catch (e: any) {
                setErr(String(e?.message || e));
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Permanently Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
