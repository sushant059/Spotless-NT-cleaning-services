import { AddJobButton } from "@/components/admin/add-job";
import { EnquiriesTable, type EnquiryRow } from "@/components/admin/enquiries";
import { categoriesFor } from "@/lib/categories";
import { SERVICE_CATEGORIES, timeWindowLabel } from "@/lib/constants";
import { getDb } from "@/lib/store";
import { byOrder, formatDisplayDate } from "@/lib/utils";

export default async function LeadsPage() {
  const db = await getDb();
  const services = byOrder(db.services).map(({ slug, title, category }) => ({ slug, title, category }));
  const jobFor = (reference: string) => {
    const job = db.jobs.find((item) => item.sourceRef === reference);
    return job ? { id: job.id, reference: job.reference, status: job.status, customerId: job.customerId } : null;
  };
  const rows: EnquiryRow[] = [
    ...db.leads.map((lead) => ({
      kind: "lead" as const,
      id: lead.id,
      reference: lead.reference,
      createdAt: lead.createdAt,
      source: lead.source === "chat" ? "Chat" : lead.source === "quote" ? "Quote form" : "Message",
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      suburb: lead.suburb,
      address: "",
      summary: lead.summary || lead.message,
      message: lead.message,
      wanted: lead.preferredTime,
      date: "",
      timeWindow: "",
      status: lead.status,
      categories: categoriesFor(services, lead.services, `${lead.summary} ${lead.message}`),
      internalNotes: lead.internalNotes,
      promo: lead.promoCode ? `Promo ${lead.promoCode}: ${lead.promoMessage}` : "",
      job: jobFor(lead.reference),
    })),
    ...db.bookings.map((booking) => ({
      kind: "booking" as const,
      id: booking.id,
      reference: booking.reference,
      createdAt: booking.createdAt,
      source: "Booking",
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      suburb: booking.suburb,
      address: booking.address,
      summary: booking.summary,
      message: booking.notes,
      wanted: [booking.date && formatDisplayDate(booking.date), booking.timeWindow && timeWindowLabel(booking.timeWindow)].filter(Boolean).join(", "),
      date: booking.date,
      timeWindow: booking.timeWindow,
      status: booking.status,
      categories: categoriesFor(services, booking.services, booking.summary),
      internalNotes: booking.internalNotes,
      promo: booking.promoCode ? `Promo ${booking.promoCode}: ${booking.promoMessage}` : "",
      job: jobFor(booking.reference),
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
