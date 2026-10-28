import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteBuilder, QuoteSendPanel, QuoteStatusBadge } from "@/components/admin/quotes";
import { QuoteDocument } from "@/components/quote/document";
import { emailEnabled } from "@/lib/email";
import { invoiceTotals, money } from "@/lib/invoice";
import { smsEnabled } from "@/lib/sms";
import { getDb } from "@/lib/store";
import { byOrder, darwinISODate, siteUrl } from "@/lib/utils";

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const quote = db.quotes.find((item) => item.id === id);
  if (!quote) notFound();
  const customer = db.customers.find((item) => item.id === quote.customerId);
  const link = `${siteUrl()}/quote/${quote.token}`;
  const services = byOrder(db.services).filter((item) => item.visible).map(({ title, priceFrom }) => ({ title, priceFrom }));
  const contact = { name: customer?.name ?? "", companyName: customer?.companyName ?? "", phone: customer?.phone ?? "", email: customer?.email ?? "", address: customer?.address ?? "", suburb: customer?.suburb ?? "" };
  return (
    <div className="space-y-5">
      <Link href="/admin/quotes" className="text-sm font-semibold text-brand">← All quotes</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-navy">{quote.number}</h1>
        <QuoteStatusBadge quote={quote} today={darwinISODate()} />
        <span className="text-2xl font-extrabold text-navy">{money(invoiceTotals(quote, db.settings.invoice.gstRegistered).total)}</span>
        {customer && <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-brand">{customer.companyName || customer.name} →</Link>}
      </div>
      <QuoteSendPanel quote={quote} customer={customer} settings={db.settings} link={link} emailReady={emailEnabled()} smsReady={smsEnabled()} />
      <details className="group rounded-card bg-mist/60" open={quote.status === "draft"}>
        <summary className="cursor-pointer list-none rounded-card bg-white p-4 text-lg font-bold text-navy shadow-card sm:p-5 [&::-webkit-details-marker]:hidden">Edit quote <span className="text-sm font-normal text-slate group-open:hidden">(tap to open)</span></summary>
        <div className="pt-4">
          <QuoteBuilder key={quote.updatedAt} initial={quote} contact={contact} settings={db.settings} services={services} link={link} />
        </div>
      </details>
      <section>
        <h2 className="mb-3 text-xl font-bold text-navy">What the customer sees</h2>
        <QuoteDocument quote={quote} customer={customer} settings={db.settings} className="rounded-card shadow-card" />
      </section>
    </div>
  );
}
