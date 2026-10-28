import Link from "next/link";
import { QuoteBuilder } from "@/components/admin/quotes";
import type { QuoteContact } from "@/lib/actions";
import { addDays } from "@/lib/quote";
import { getDb } from "@/lib/store";
import type { InvoiceItem, Quote } from "@/lib/types";
import { byOrder, darwinISODate } from "@/lib/utils";

/**
 * A new quote, filled in from wherever the Quote button was pressed:
 * a customer (?customer=), a job (?job=), or a website enquiry (?lead= or ?booking=).
 */
export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ customer?: string; job?: string; lead?: string; booking?: string }> }) {
  const params = await searchParams;
  const db = await getDb();
  const job = db.jobs.find((item) => item.id === params.job);
  const customer = db.customers.find((item) => item.id === (job?.customerId || params.customer));
  const lead = db.leads.find((item) => item.id === params.lead);
  const booking = db.bookings.find((item) => item.id === params.booking);
  const enquiry = lead || booking;
  const contact: QuoteContact = customer
    ? { name: customer.name, companyName: customer.companyName, phone: customer.phone, email: customer.email, address: customer.address, suburb: customer.suburb }
    : { name: enquiry?.name ?? "", companyName: "", phone: enquiry?.phone ?? "", email: enquiry?.email ?? "", address: booking?.address ?? "", suburb: enquiry?.suburb ?? "" };
  const described = job?.services || enquiry?.summary || "";
  const items: InvoiceItem[] = described
    ? described.split("\n").map((line) => line.trim()).filter(Boolean).map((description) => ({ description, quantity: 1, unitPrice: 0 }))
    : [{ description: "", quantity: 1, unitPrice: 0 }];
  const today = darwinISODate();
  const initial: Quote = {
    id: "",
    number: "",
    token: "",
    customerId: customer?.id ?? "",
    jobId: job?.id ?? "",
    issueDate: today,
    validUntil: addDays(today, 14),
    items,
    discount: 0,
    notes: "",
    message: "",
    status: "draft",
    sentAt: "",
    acceptedAt: "",
    createdAt: "",
    updatedAt: "",
  };
  const services = byOrder(db.services).filter((item) => item.visible).map(({ title, priceFrom }) => ({ title, priceFrom }));
  return (
    <div className="space-y-5">
      <Link href="/admin/quotes" className="text-sm font-semibold text-brand">← All quotes</Link>
      <div>
        <h1 className="text-3xl font-bold text-navy">New quote</h1>
        <p className="mt-1 text-slate">{customer ? `For ${customer.companyName || customer.name}. ` : enquiry ? `From enquiry ${enquiry.reference}. ` : ""}Fill in the four steps, save, then send it.</p>
      </div>
      {enquiry && (lead?.message || booking?.notes) && <p className="rounded-2xl bg-mist p-3 text-sm text-slate"><b className="text-navy">What they asked for:</b> {lead?.message || booking?.notes}</p>}
      <QuoteBuilder initial={initial} contact={contact} settings={db.settings} services={services} link="" />
    </div>
  );
}
