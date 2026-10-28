import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/invoice/print-button";
import { QuoteDocument } from "@/components/quote/document";
import { QuoteRespond } from "@/components/quote/respond";
import { getDb } from "@/lib/store";

export const metadata: Metadata = { title: "Your quote", robots: { index: false, follow: false } };

/** The customer's private quote link: view, print or save as PDF, and accept. */
export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) notFound();
  const db = await getDb();
  const quote = db.quotes.find((item) => item.token === token);
  if (!quote || quote.status === "draft") notFound();
  const customer = db.customers.find((item) => item.id === quote.customerId);
  return (
    <main className="min-h-screen bg-mist px-3 py-6 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate">Your quote from {db.settings.businessName}</p>
        <PrintButton />
      </div>
      <div className="mx-auto mb-4 max-w-[820px]"><QuoteRespond token={token} status={quote.status} phone={db.settings.phoneDisplay} /></div>
      <QuoteDocument quote={quote} customer={customer} settings={db.settings} className="rounded-card shadow-card print:rounded-none print:shadow-none" />
    </main>
  );
}
