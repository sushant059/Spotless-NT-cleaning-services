import Link from "next/link";
import { QuotesBoard } from "@/components/admin/quotes";
import { getDb } from "@/lib/store";
import { darwinISODate } from "@/lib/utils";

export default async function QuotesPage() {
  const db = await getDb();
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Quotes</h1>
          <p className="mt-1 text-slate">Price a job, send it by email, WhatsApp or text, and see who accepted.</p>
        </div>
        <Link href="/admin/quotes/new" className="inline-flex min-h-12 items-center rounded-full bg-leaf-dark px-6 font-semibold text-white hover:bg-[#1d6a19]">New quote</Link>
      </div>
      <QuotesBoard quotes={db.quotes} customers={db.customers} gstRegistered={db.settings.invoice.gstRegistered} today={darwinISODate()} />
    </div>
  );
}
