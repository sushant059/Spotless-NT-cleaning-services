import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/invoice/print-button";
import { QuoteDocument } from "@/components/quote/document";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";

export const metadata: Metadata = { title: "Print quote", robots: { index: false, follow: false } };

/** Admin-only print view, so a draft quote can be printed or saved as PDF before it is sent. */
export default async function PrintQuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = await getDb();
  const quote = db.quotes.find((item) => item.id === id);
  if (!quote) notFound();
  return (
    <main className="min-h-screen bg-mist px-3 py-6 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[820px] justify-end print:hidden"><PrintButton /></div>
      <QuoteDocument quote={quote} customer={db.customers.find((item) => item.id === quote.customerId)} settings={db.settings} className="rounded-card shadow-card print:rounded-none print:shadow-none" />
    </main>
  );
}
