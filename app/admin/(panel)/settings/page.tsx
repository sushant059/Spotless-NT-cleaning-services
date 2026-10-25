import { AdminUsersPanel } from "@/components/admin/admin-users";
import { DataStatus } from "@/components/admin/data-status";
import { SettingsEditor } from "@/components/admin/editors";
import { listAdmins } from "@/lib/admin-users";
import { requireAdmin } from "@/lib/auth";
import { sheetsEnabled } from "@/lib/sheets";
import { getDb, usingSupabase } from "@/lib/store";

export default async function SettingsPage() {
  const session = await requireAdmin();
  const [db, admins] = await Promise.all([getDb(), listAdmins()]);
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-navy">Settings</h1>
      <DataStatus supabase={usingSupabase()} sheets={sheetsEnabled()} />
      <AdminUsersPanel admins={admins} ownerEmail={db.settings.email} isOwner={session.owner} />
      <SettingsEditor settings={db.settings} localMode={!usingSupabase()} />
    </div>
  );
}
