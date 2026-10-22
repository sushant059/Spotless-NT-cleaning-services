import type { EnquiryRow } from "@/components/admin/enquiries";
import { categoriesFor } from "@/lib/categories";
import { timeWindowLabel } from "@/lib/constants";
import type { Database } from "@/lib/types";
import { byOrder, formatDisplayDate } from "@/lib/utils";

/** Website leads and bookings as one list of enquiries, newest first, each with its job if one was booked. */
export function enquiryRows(db: Database): EnquiryRow[] {
  const services = byOrder(db.services).map(({ slug, title, category }) => ({ slug, title, category }));
  const jobFor = (reference: string) => {
    const job = db.jobs.find((item) => item.sourceRef === reference);
    return job ? { id: job.id, reference: job.reference, status: job.status, customerId: job.customerId } : null;
  };
  return [
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
}
