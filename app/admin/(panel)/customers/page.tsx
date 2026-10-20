import { CustomersBoard } from "@/components/admin/customers";
import { AddJobButton } from "@/components/admin/add-job";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const { add } = await searchParams;
  const db = await getDb();
  const services = byOrder(db.services).map(({ slug, title, category }) => ({ slug, title, category }));
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Customers</h1>
          <p className="mt-1 text-slate">Everyone you’ve cleaned for, with their jobs. Saved to Supabase and your Google Sheet.</p>
        </div>
        <AddJobButton customers={db.customers} services={services} label="Add job" />
      </div>
      <CustomersBoard customers={db.customers} jobs={db.jobs} services={services} startAdding={add === "1"} />
    </div>
  );
}
