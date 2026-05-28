import { useState, useMemo } from "react";
import {
  LayoutGrid,
  Users as UsersIcon,
  RefreshCcw,
  LogOut,
  Pencil,
  KeyRound,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import { toast } from "../hooks/useToast";
import EditUserModal, { PasswordModal, DeleteModal } from "./Modals";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";

const TABS = ["All", "Active", "Inactive", "Superusers"];

export default function Dashboard() {
  const { user: adminUser, signOut } = useAuth();
  const { users, loading, error, fetchUsers, toggleActive, removeUser } = useUsers();

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const [editUser, setEditUser] = useState(null);
  const [pwUser, setPwUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const filtered = useMemo(() => {
    let list = [...users];
    if (tab === 'Active') list = list.filter(u => u.is_active);
    if (tab === 'Inactive') list = list.filter(u => !u.is_active);
    if (tab === 'Superusers') list = list.filter(u => u.is_superuser);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va = a[sortBy] ?? '';
      let vb = b[sortBy] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, tab, search, sortBy, sortDir]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    superusers: users.filter(u => u.is_superuser).length,
  }), [users]);

  const handleToggleActive = async (u) => {
    const res = await toggleActive(u.id, u.is_active);
    if (res.ok) toast({ title: "Updated", description: `${u.username} ${u.is_active ? "deactivated" : "activated"}` });
    else toast({ title: "Error", description: res.error || "Request failed", variant: "destructive" });
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const sortIcon = (col) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Admin Console</div>
              <div className="text-xs text-muted-foreground">Superuser only</div>
            </div>
          </div>
          <Separator />
          <nav className="flex flex-1 flex-col gap-1 p-4">
            <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <LayoutGrid className="h-4 w-4" />
              Overview
            </div>
            <div className="flex items-center gap-3 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground">
              <UsersIcon className="h-4 w-4" />
              Users
            </div>
          </nav>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                {(adminUser?.username || "A").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{adminUser?.username}</div>
                <div className="text-xs text-muted-foreground">Superuser</div>
              </div>
            </div>
            <Button variant="outline" className="mt-3 w-full justify-start" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
              <p className="text-sm text-muted-foreground">Manage all registered accounts</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchUsers}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </header>

          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Total users</div>
              <div className="mt-1 text-3xl font-semibold">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Active</div>
              <div className="mt-1 text-3xl font-semibold text-emerald-400">{stats.active}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Inactive</div>
              <div className="mt-1 text-3xl font-semibold text-rose-400">{stats.inactive}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Superusers</div>
              <div className="mt-1 text-3xl font-semibold text-amber-400">{stats.superusers}</div>
            </Card>
          </div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t} value={t}>
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Input
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-lg border bg-card">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading users…</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background/50">
                    <tr className="border-b">
                      {[
                        { key: "username", label: "User" },
                        { key: "email", label: "Email" },
                        { key: "is_active", label: "Status" },
                        { key: "created_at", label: "Joined" },
                        { key: "last_login", label: "Last login" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 hover:text-foreground"
                            onClick={() => handleSort(col.key)}
                          >
                            {col.label}
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                            <span className="sr-only">{sortIcon(col.key)}</span>
                          </button>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b last:border-b-0 hover:bg-background/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={
                                "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold " +
                                (u.is_superuser
                                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                  : "border-primary/30 bg-primary/10 text-primary")
                              }
                            >
                              {u.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 font-semibold">
                                <span className="truncate">{u.username}</span>
                                {u.is_superuser ? (
                                  <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                                    admin
                                  </span>
                                ) : null}
                              </div>
                              {u.full_name ? (
                                <div className="truncate text-xs text-muted-foreground">{u.full_name}</div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold " +
                              (u.is_active
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                : "border-zinc-700 bg-zinc-900/40 text-zinc-300")
                            }
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(u.created_at)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {u.last_login ? fmtDate(u.last_login) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setEditUser(u)} title="Edit user">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setPwUser(u)}
                              title="Reset password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleActive(u)}
                              title={u.is_active ? "Deactivate" : "Activate"}
                            >
                              {u.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setDeleteUser(u)}
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t px-4 py-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {users.length} users
            </div>
          </div>

          {/* Modals */}
          {editUser ? (
            <EditUserModal
              user={editUser}
              onClose={() => setEditUser(null)}
              onUpdated={(u) => {
                toast({ title: "Saved", description: `${u.username} updated` });
                setEditUser(null);
                fetchUsers();
              }}
            />
          ) : null}
          {pwUser ? <PasswordModal user={pwUser} onClose={() => setPwUser(null)} /> : null}
          {deleteUser ? (
            <DeleteModal
              user={deleteUser}
              onClose={() => setDeleteUser(null)}
              onDeleted={(id) => {
                removeUser(id);
                toast({ title: "Deleted", description: "User deleted" });
              }}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
