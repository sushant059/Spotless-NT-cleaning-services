import { AddJobButton } from "@/components/admin/add-job";
import { EnquiriesTable } from "@/components/admin/enquiries";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { enquiryRows } from "@/lib/enquiry-rows";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export default async function LeadsPage() {
  const db = await getDb();
  const services = byOrder(db.services).map(({ slug, title, category }) => ({ slug, title, category }));
  const rows = enquiryRows(db);
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">New enquiries</h1>
          <p className="mt-1 text-slate">Quotes, chats and bookings from the website. Book the job or add the customer in one tap.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a className="text-sm font-semibold text-brand" href="/api/admin/export?type=leads">Leads CSV</a>
          <a className="text-sm font-semibold text-brand" href="/api/admin/export?type=bookings">Bookings CSV</a>
          <AddJobButton customers={db.customers} services={services} />
        </div>
      </div>
      <EnquiriesTable rows={rows} categories={SERVICE_CATEGORIES.map((item) => ({ id: item.id, label: item.short }))} />
    </div>
  );
}
