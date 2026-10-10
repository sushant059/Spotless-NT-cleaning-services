import { CustomersBoard } from "@/components/admin/customers";
import { getDb } from "@/lib/store";

export default async function CustomersPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Customers & jobs</h1>
      <p className="mb-5 mt-1 text-slate">Every confirmed customer and job, with status, photos, complaints and redos. Saved to Supabase and your Google Sheet.</p>
      <CustomersBoard customers={db.customers} jobs={db.jobs} />
    </div>
  );
}
