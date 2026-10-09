import { SettingsEditor } from "@/components/admin/editors";
import { getDb, usingSupabase } from "@/lib/store";

export default async function SettingsPage() {
  const db = await getDb();
  return <div><h1 className="mb-4 text-3xl font-bold">Settings</h1><SettingsEditor settings={db.settings} localMode={!usingSupabase()} /></div>;
}
