import Image from "next/image";
import { invoiceTotals, lineTotal, money } from "@/lib/invoice";
import type { Customer, Quote, Settings } from "@/lib/types";
import { cn, formatDisplayDate } from "@/lib/utils";

const label = "text-[11px] font-bold uppercase tracking-[0.14em] text-slate";

/** The quote as the customer sees, prints or saves it as PDF. */
export function QuoteDocument({ quote, customer, settings, className }: { quote: Quote; customer?: Customer; settings: Settings; className?: string }) {
  const tax = settings.invoice.gstRegistered;
  const totals = invoiceTotals(quote, tax);
  const address = [customer?.address, customer?.suburb].filter(Boolean).join(", ");
  return (
    <article className={cn("relative mx-auto w-full max-w-[820px] overflow-hidden bg-white text-[15px] text-ink print:max-w-none print:text-[13px]", className)}>
      <div className="h-2 bg-gradient-to-r from-navy via-brand to-leaf print:h-1.5" aria-hidden />
      <div className="p-5 sm:p-10 print:p-8">
        {quote.status === "accepted" && <span className="absolute right-6 top-28 rotate-[-10deg] rounded-xl border-4 border-leaf-dark px-4 py-1 text-2xl font-extrabold uppercase text-leaf-dark opacity-80 sm:right-12">Accepted</span>}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Image src="/territory-spotless-mark.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="text-xl font-extrabold leading-tight text-navy">{settings.businessName}</p>
              {settings.abn && <p className="font-semibold">ABN {settings.abn}</p>}
              <p className="text-slate">{[settings.phoneDisplay, settings.email].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-3xl font-extrabold uppercase tracking-wide text-navy">Quote</p>
            <p className="mt-1 text-slate">No. <span className="font-bold text-ink">{quote.number}</span></p>
          </div>
        </header>

        <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-line sm:grid-cols-3 print:rounded-lg">
          <div className="border-b border-r border-line p-3 sm:border-b-0"><dt className={label}>Quote date</dt><dd className="mt-1 font-semibold">{formatDisplayDate(quote.issueDate)}</dd></div>
          <div className="border-b border-line p-3 sm:border-b-0 sm:border-r"><dt className={label}>Valid until</dt><dd className="mt-1 font-semibold">{quote.validUntil ? formatDisplayDate(quote.validUntil) : "—"}</dd></div>
          <div className="col-span-2 bg-navy p-3 text-white sm:col-span-1 print:bg-navy"><dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Quote total{tax ? " (inc. GST)" : ""}</dt><dd className="mt-1 text-xl font-extrabold">{money(totals.total)}</dd></div>
        </dl>

        <section className="py-8">
          <p className={label}>Prepared for</p>
          {customer ? (
            <div className="mt-1.5 leading-relaxed">
              <p className="font-bold text-navy">{customer.companyName || customer.name}</p>
              {customer.companyName && <p>Attn: {customer.name}</p>}
              {address && <p>{address}</p>}
              <p className="text-sm text-slate">{[customer.phone, customer.email].filter(Boolean).join(" · ")}</p>
            </div>
          ) : <p className="mt-1.5 text-slate">—</p>}
        </section>

        <ul className="divide-y divide-line border-y border-line sm:hidden print:hidden">
          {quote.items.map((item, index) => (
            <li key={index} className="py-3">
              <p className="whitespace-pre-wrap font-medium">{item.description}</p>
              <p className="mt-1 flex justify-between text-sm text-slate"><span>{item.quantity} × {money(item.unitPrice)}</span><span className="font-semibold text-ink">{money(lineTotal(item))}</span></p>
            </li>
          ))}
        </ul>
        <table className="hidden w-full border-collapse text-left sm:table print:table">
          <thead>
            <tr className="border-b-2 border-navy text-[12px] uppercase tracking-wider text-slate">
              <th className="py-2 pr-3 font-bold">Description</th>
              <th className="px-3 py-2 text-right font-bold">Qty</th>
              <th className="px-3 py-2 text-right font-bold">Unit price</th>
              <th className="py-2 pl-3 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => (
              <tr key={index} className="border-b border-line align-top">
                <td className="whitespace-pre-wrap py-3 pr-3">{item.description}</td>
                <td className="px-3 py-3 text-right tabular-nums">{item.quantity}</td>
                <td className="px-3 py-3 text-right tabular-nums">{money(item.unitPrice)}</td>
                <td className="py-3 pl-3 text-right font-semibold tabular-nums">{money(lineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-6 flex justify-end">
          <dl className="w-full max-w-sm space-y-1.5 tabular-nums">
            <div className="flex justify-between"><dt className="text-slate">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between"><dt className="text-slate">Discount</dt><dd>−{money(totals.discount)}</dd></div>}
            {tax && <div className="flex justify-between"><dt className="text-slate">GST included</dt><dd>{money(totals.gst)}</dd></div>}
            <div className="flex justify-between border-t-2 border-navy pt-2 text-lg font-extrabold text-navy"><dt>Total{tax ? " (inc. GST)" : ""}</dt><dd>{money(totals.total)}</dd></div>
            {!tax && <p className="pt-1 text-right text-xs text-slate">No GST applies.</p>}
          </dl>
        </section>

        {quote.notes && (
          <section className="mt-8 rounded-2xl border border-line p-5 print:rounded-lg">
            <p className={label}>What’s included &amp; notes</p>
            <p className="mt-1.5 whitespace-pre-wrap">{quote.notes}</p>
          </section>
        )}

        <footer className="mt-8 border-t border-line pt-4 text-center text-sm text-slate">
          <p className="font-medium text-navy">Thanks for considering {settings.businessName}.</p>
          <p className="mt-1">{quote.validUntil ? `This quote is valid until ${formatDisplayDate(quote.validUntil)}. ` : ""}Prices are based on the details provided and confirmed on arrival.</p>
        </footer>
      </div>
    </article>
  );
}
