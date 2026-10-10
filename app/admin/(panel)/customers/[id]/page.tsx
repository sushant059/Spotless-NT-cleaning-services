import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerHeader, JobsPanel } from "@/components/admin/customers";
import { getDb } from "@/lib/store";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const customer = db.customers.find((item) => item.id === id);
  if (!customer) notFound();
  const jobs = db.jobs.filter((job) => job.customerId === id);
  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="text-sm font-semibold text-brand">← All customers</Link>
      <CustomerHeader customer={customer} />
      <JobsPanel customer={customer} jobs={jobs} />
    </div>
  );
}
