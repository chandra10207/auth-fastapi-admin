import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import * as api from "../api/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(user?.email || "");
    setFullName(user?.full_name || "");
    setError("");
  }, [user]);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // NOTE: This calls /users/me — backend needs a superadmin PATCH /users/{id} endpoint
      // for editing other users. Wire this up when that endpoint is added.
      // For now the UI shape is complete and ready.
      const payload = {};
      if (email !== user.email) payload.email = email;
      if (fullName !== (user.full_name || "")) payload.full_name = fullName;
      if (Object.keys(payload).length === 0) { onClose(); return; }

      const updated = await api.request_internal(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update profile fields for <span className="font-medium text-foreground">{user.username}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
          <Avatar name={user.username} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user.username}</div>
            <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}…</div>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSave} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PasswordModal({ user, onClose }) {
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (newPw !== confirm) { setError("Passwords do not match"); return; }
    setSaving(true);
    setError("");
    try {
      await api.adminResetPassword(user.id, newPw);
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for <span className="font-medium text-foreground">{user.username}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
          <Avatar name={user.username} color="text-amber-300" bg="bg-amber-500/10 border border-amber-500/30" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user.username}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Password updated!
          </div>
        ) : null}

        <form onSubmit={handleSave} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={show ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                minLength={8}
                required
                placeholder="Min 8 chars, upper + lower + digit"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShow((p) => !p)}
                tabIndex={-1}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <StrengthMeter password={newPw} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={saving || success} className="bg-amber-500 text-black hover:opacity-90">
              {saving ? "Resetting…" : "Reset password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteModal({ user, onClose, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const handleDelete = async () => {
    setConfirming(true);
    setError("");
    try {
      await api.deleteUser(user.id);
      onDeleted(user.id);
      onClose();
    } catch (err) {
      setError(err.message);
      setConfirming(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete user?
          </DialogTitle>
          <DialogDescription>
            This will permanently delete <span className="font-medium text-foreground">{user.username}</span>. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="confirmDelete">{`Type "${user.username}" to confirm`}</Label>
          <Input
            id="confirmDelete"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={user.username}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={typed !== user.username || confirming}
            onClick={handleDelete}
          >
            {confirming ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Avatar({
  name = "?",
  color = "text-primary",
  bg = "bg-primary/10 border border-primary/30",
}) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg} ${color} text-sm font-bold`}>
      {initials}
    </div>
  );
}

function StrengthMeter({ password }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const colors = ["bg-zinc-700", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-600"];
  const color = colors[score] || "bg-zinc-700";

  if (!password) return null;
  return (
    <div className="-mt-1">
      <div className="mb-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i <= score ? color : "bg-zinc-800"} transition-colors`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{labels[score]}</span>
    </div>
  );
}
