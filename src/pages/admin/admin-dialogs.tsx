import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Loader1 from "@/components/ui/loader1";
import type { AdminSubscriptionInfo, AdminUser } from "@/types/AdminTypes";

const PLAN_OPTIONS = ["free", "starter", "pro", "team"] as const;
const PAID_STATUSES = ["active", "trialing", "past_due", "cancelled", "paused"] as const;

export type PlanEditTarget = {
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: string;
  billingCycle?: string | null;
  seats?: number;
};

export function EditPlanDialog({
  open,
  target,
  onClose,
  onSaved,
}: {
  open: boolean;
  target: PlanEditTarget | null;
  onClose: () => void;
  onSaved: (userId: string, subscription: AdminSubscriptionInfo) => void;
}) {
  const [plan, setPlan] = useState("free");
  const [status, setStatus] = useState("active");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [seats, setSeats] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !target) return;
    setPlan(target.plan || "free");
    setStatus(target.status && target.status !== "free" ? target.status : "active");
    setBillingCycle(target.billingCycle === "annual" ? "annual" : "monthly");
    setSeats(target.seats && target.seats > 0 ? target.seats : 1);
    setNote("");
    setError(null);
  }, [open, target]);

  const handleSave = async () => {
    if (!target) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminApi.updateUserSubscription(target.userId, {
        plan,
        status: plan === "free" ? "free" : status,
        billingCycle: plan === "free" ? null : billingCycle,
        seats: plan === "team" ? seats : undefined,
        note: note.trim() || undefined,
      });
      onSaved(target.userId, res.subscription);
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !saving) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit subscription</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                Grant or override the plan for{" "}
                <span className="font-medium text-foreground">{target.userName}</span> (
                {target.userEmail}). This skips checkout and does not charge Flutterwave.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-plan">Plan</Label>
            <Select id="admin-plan" value={plan} onChange={(e) => setPlan(e.target.value)}>
              {PLAN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>

          {plan !== "free" && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="admin-status">Status</Label>
                <Select
                  id="admin-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {PAID_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="admin-cycle">Billing cycle</Label>
                <Select
                  id="admin-cycle"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </Select>
              </div>
            </>
          )}

          {plan === "team" && (
            <div className="grid gap-1.5">
              <Label htmlFor="admin-seats">Seats</Label>
              <Input
                id="admin-seats"
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="admin-note">Internal note (optional)</Label>
            <Textarea
              id="admin-note"
              rows={2}
              placeholder="Why this grant or override…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader1 className="h-4 w-4" /> : "Save plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditUserDialog({
  open,
  user,
  currentUserId,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: AdminUser | null;
  currentUserId: string;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
}) {
  const [role, setRole] = useState<"user" | "super-admin">("user");
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = user?._id === currentUserId;

  useEffect(() => {
    if (!open || !user) return;
    setRole(user.role === "super-admin" ? "super-admin" : "user");
    setVerified(!!user.isEmailVerified);
    setError(null);
  }, [open, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const payload: { role?: "user" | "super-admin"; isEmailVerified?: boolean } = {};
      if (!isSelf && role !== user.role) payload.role = role;
      if (verified !== !!user.isEmailVerified) payload.isEmailVerified = verified;
      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }
      const res = await adminApi.updateUser(user._id, payload);
      onSaved({ ...user, ...res.user });
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (!user) return;
    setSigningOut(true);
    setError(null);
    try {
      const res = await adminApi.updateUser(user._id, { revokeSessions: true });
      onSaved({ ...user, ...res.user });
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to sign out sessions");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !saving && !signingOut) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage user</DialogTitle>
          <DialogDescription>
            {user ? (
              <>
                {user.name} ({user.email})
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-role">Role</Label>
            <Select
              id="admin-role"
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value as "user" | "super-admin")}
            >
              <option value="user">User</option>
              <option value="super-admin">Super-admin</option>
            </Select>
            {isSelf && (
              <p className="text-xs text-muted-foreground">You cannot change your own role.</p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
            />
            Email verified
          </label>

          <div className="rounded-md border border-border p-3 space-y-2">
            <p className="text-sm font-medium">Sessions</p>
            <p className="text-xs text-muted-foreground">
              Clears their refresh token so they must sign in again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut || saving}
            >
              {signingOut ? <Loader1 className="h-3.5 w-3.5" /> : "Sign them out"}
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving || signingOut}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || signingOut}>
            {saving ? <Loader1 className="h-4 w-4" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
