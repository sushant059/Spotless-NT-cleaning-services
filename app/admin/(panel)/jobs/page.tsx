import { AddJobButton } from "@/components/admin/add-job";
import { JobsTable } from "@/components/admin/jobs-table";
import { categoriesFor } from "@/lib/categories";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/store";
import { byOrder, darwinISODate } from "@/lib/utils";

export default async function JobsPage() {
  const db = await getDb();
  const services = byOrder(db.services).map(({ slug, title, category }) => ({ slug, title, category }));
  const rows = db.jobs.map((job) => {
    const invoice = db.invoices.find((item) => item.jobId === job.id && item.status !== "void");
    return {
      job,
      customer: db.customers.find((customer) => customer.id === job.customerId),
      categories: categoriesFor(services, [], job.services),
      invoice: invoice ? { id: invoice.id, number: invoice.number, status: invoice.status } : null,
    };
  });
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Jobs</h1>
          <p className="mt-1 text-slate">Every job in one table, by day, status and type of clean. Change a status right in the row.</p>
        </div>
        <AddJobButton customers={db.customers} services={services} />
      </div>
      <JobsTable rows={rows} categories={SERVICE_CATEGORIES.map((item) => ({ id: item.id, label: item.short }))} today={darwinISODate()} />
    </div>
  );
}
