"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { addAdminAction, removeAdminAction, resetAdminPasswordAction } from "@/lib/actions";
import type { AdminUser } from "@/lib/admin-users";
import { formatDisplayDate } from "@/lib/utils";

/** Owner-only: give staff their own email and password for the admin panel. */
export function AdminUsersPanel({ admins, ownerEmail, isOwner }: { admins: AdminUser[]; ownerEmail: string; isOwner: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function run(work: () => Promise<{ ok: boolean; error?: string; message?: string }>, after?: () => void) {
    start(async () => {
      const result = await work();
      toast(result.ok ? result.message || "Done" : result.error || "Something went wrong", result.ok ? "ok" : "error");
      if (result.ok) {
        after?.();
        router.refresh();
      }
    });
  }

  return (
    <section className="mb-6 rounded-card bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold text-navy">Admin logins</h2>
      <p className="mt-1 text-sm text-slate">People who can sign in to this admin panel. Each person gets their own email and password.</p>

      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
        <li className="flex flex-wrap items-center gap-3 p-3">
          <span className="min-w-0 flex-1"><span className="block font-semibold text-navy">{ownerEmail}</span><span className="text-xs text-slate">Owner · the business email in Settings below</span></span>
          <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-bold text-white">Owner</span>
        </li>
        {admins.map((admin) => (
          <li key={admin.id} className="flex flex-wrap items-center gap-2 p-3">
            <span className="min-w-0 flex-1"><span className="block font-semibold text-navy">{admin.name} <span className="font-normal text-slate">· {admin.email}</span></span><span className="text-xs text-slate">Added {formatDisplayDate(admin.createdAt.slice(0, 10))}</span></span>
            {isOwner && (
              <>
                <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => {
                  const password = window.prompt(`New password for ${admin.name} (at least 8 characters)`);
                  if (password) run(() => resetAdminPasswordAction(admin.id, password));
                }}><KeyRound className="h-4 w-4" aria-hidden /> New password</Button>
                <ConfirmDialog title={`Remove ${admin.name}?`} body="They are signed out and can't sign in again." confirmLabel="Remove" onConfirm={() => run(() => removeAdminAction(admin.id))} trigger={<Button type="button" size="sm" variant="ghost" aria-label={`Remove ${admin.name}`}><Trash2 className="h-4 w-4" aria-hidden /></Button>} />
              </>
            )}
          </li>
        ))}
      </ul>

      {isOwner ? (
        <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={(event) => { event.preventDefault(); run(() => addAdminAction(form), () => setForm({ name: "", email: "", password: "" })); }}>
          <div><Label htmlFor="adm-name">Name</Label><Input id="adm-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="off" /></div>
          <div><Label htmlFor="adm-email">Email</Label><Input id="adm-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="off" /></div>
          <div><Label htmlFor="adm-pass">Password</Label><Input id="adm-pass" type="text" required minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" placeholder="At least 8 characters" /></div>
          <div className="sm:col-span-3"><Button type="submit" disabled={pending}><UserPlus className="h-4 w-4" aria-hidden /> Add admin</Button></div>
        </form>
      ) : (
        <p className="mt-3 text-sm text-slate">Only the owner can add or remove admins.</p>
      )}
    </section>
  );
}
