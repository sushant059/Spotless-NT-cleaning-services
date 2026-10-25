import Image from "next/image";
import { invoiceTotals, lineTotal, money } from "@/lib/invoice";
import type { Customer, Invoice, Job, Settings } from "@/lib/types";
import { cn, formatDisplayDate } from "@/lib/utils";

const label = "text-[11px] font-bold uppercase tracking-[0.14em] text-slate";

/**
 * The invoice itself, as the customer sees and prints it. Used by the public link and the admin preview.
 * Laid out to the ATO tax invoice rules: the words "Tax invoice", the seller's name and ABN, issue date,
 * what was supplied with quantity and price, and the GST included (or a clear "no GST" line when not registered).
 */
export function InvoiceDocument({ invoice, customer, job, settings, className }: { invoice: Invoice; customer?: Customer; job?: Job; settings: Settings; className?: string }) {
  const tax = settings.invoice.gstRegistered;
  const totals = invoiceTotals(invoice, tax);
  const pay = settings.invoice;
  const hasBank = Boolean(pay.bsb || pay.accountNumber);
  const paid = invoice.status === "paid";
  const due = paid ? 0 : totals.total;
  const terms = pay.termsDays > 0 ? `Payment due within ${pay.termsDays} days` : "Payment due on receipt";
  const serviceAddress = job?.address || [customer?.address, customer?.suburb].filter(Boolean).join(", ");

  return (
    <article className={cn("relative mx-auto w-full max-w-[820px] overflow-hidden bg-white text-[15px] text-ink print:max-w-none print:text-[13px]", className)}>
      <div className="h-2 bg-gradient-to-r from-navy via-brand to-leaf print:h-1.5" aria-hidden />
      <div className="p-5 sm:p-10 print:p-8">
        {paid && <span className="absolute right-6 top-28 rotate-[-10deg] rounded-xl border-4 border-leaf-dark px-4 py-1 text-3xl font-extrabold uppercase text-leaf-dark opacity-80 sm:right-12">Paid</span>}
        {invoice.status === "void" && <span className="absolute right-6 top-28 rotate-[-10deg] rounded-xl border-4 border-danger px-4 py-1 text-3xl font-extrabold uppercase text-danger opacity-80 sm:right-12">Cancelled</span>}

        {/* Seller and title */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Image src="/territory-spotless-mark.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="text-xl font-extrabold leading-tight text-navy">{settings.businessName}</p>
              {settings.abn && <p className="font-semibold text-ink">ABN {settings.abn}</p>}
              {settings.address && <p className="text-slate">{settings.address}</p>}
              <p className="text-slate">{[settings.phoneDisplay, settings.email].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-3xl font-extrabold uppercase tracking-wide text-navy">{tax ? "Tax invoice" : "Invoice"}</p>
            <p className="mt-1 text-slate">No. <span className="font-bold text-ink">{invoice.number}</span></p>
          </div>
        </header>

        {/* Key facts */}
        <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-line sm:grid-cols-4 print:rounded-lg">
          <div className="border-b border-r border-line p-3 sm:border-b-0"><dt className={label}>Invoice date</dt><dd className="mt-1 font-semibold">{formatDisplayDate(invoice.issueDate)}</dd></div>
          <div className="border-b border-line p-3 sm:border-b-0 sm:border-r"><dt className={label}>Due date</dt><dd className="mt-1 font-semibold">{invoice.dueDate ? formatDisplayDate(invoice.dueDate) : "On receipt"}</dd></div>
          <div className="border-r border-line p-3"><dt className={label}>Reference</dt><dd className="mt-1 font-semibold">{job?.reference || invoice.number}</dd></div>
          <div className="bg-navy p-3 text-white print:bg-navy"><dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Amount due</dt><dd className="mt-1 text-xl font-extrabold">{money(due)}</dd></div>
        </dl>

        {/* Buyer and job */}
        <section className="grid gap-6 py-8 sm:grid-cols-2">
          <div>
            <p className={label}>Bill to</p>
            {customer ? (
              <div className="mt-1.5 leading-relaxed">
                <p className="font-bold text-navy">{customer.companyName || customer.name}</p>
                {customer.companyName && <p>Attn: {customer.name}</p>}
                {(customer.address || customer.suburb) && <p>{[customer.address, customer.suburb].filter(Boolean).join(", ")}</p>}
                <p className="text-sm text-slate">{[customer.phone, customer.email].filter(Boolean).join(" · ")}</p>
              </div>
            ) : <p className="mt-1.5 text-slate">Customer removed</p>}
          </div>
          {(job || serviceAddress) && (
            <div>
              <p className={label}>Service details</p>
              <div className="mt-1.5 leading-relaxed">
                {serviceAddress && <p>{serviceAddress}</p>}
                {(job?.completedDate || job?.scheduledDate) && <p>Service date: {formatDisplayDate(job.completedDate || job.scheduledDate)}</p>}
                {job && <p className="text-sm text-slate">Job {job.reference}</p>}
              </div>
            </div>
          )}
        </section>

        {/* Lines. Phones: one block per line. Wider screens and print: a table. */}
        <ul className="divide-y divide-line border-y border-line sm:hidden print:hidden">
          {invoice.items.map((item, index) => (
            <li key={index} className="py-3">
              <p className="whitespace-pre-wrap font-medium">{item.description}</p>
              <p className="mt-1 flex justify-between text-sm text-slate">
                <span>{item.quantity} × {money(item.unitPrice)}{tax ? ` · GST ${money(lineTotal(item) / 11)}` : ""}</span>
                <span className="font-semibold text-ink">{money(lineTotal(item))}</span>
              </p>
            </li>
          ))}
        </ul>
        <table className="hidden w-full border-collapse text-left sm:table print:table">
          <thead>
            <tr className="border-b-2 border-navy text-[12px] uppercase tracking-wider text-slate">
              <th className="py-2 pr-3 font-bold">Description</th>
              <th className="px-3 py-2 text-right font-bold">Qty</th>
              <th className="px-3 py-2 text-right font-bold">Unit price</th>
              {tax && <th className="px-3 py-2 text-right font-bold">GST</th>}
              <th className="py-2 pl-3 text-right font-bold">Amount{tax ? " inc. GST" : ""}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-line align-top">
                <td className="whitespace-pre-wrap py-3 pr-3">{item.description}</td>
                <td className="px-3 py-3 text-right tabular-nums">{item.quantity}</td>
                <td className="px-3 py-3 text-right tabular-nums">{money(item.unitPrice)}</td>
                {tax && <td className="px-3 py-3 text-right tabular-nums text-slate">{money(lineTotal(item) / 11)}</td>}
                <td className="py-3 pl-3 text-right font-semibold tabular-nums">{money(lineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <section className="mt-6 flex justify-end">
          <dl className="w-full max-w-sm space-y-1.5 tabular-nums">
            <Row term={tax ? "Subtotal (inc. GST)" : "Subtotal"} value={money(totals.subtotal)} />
            {totals.discount > 0 && <Row term="Discount" value={`−${money(totals.discount)}`} />}
            {tax && <Row term="Total ex. GST" value={money(totals.total - totals.gst)} />}
            {tax && <Row term="GST (10%)" value={money(totals.gst)} />}
            <div className="flex justify-between border-t-2 border-navy pt-2 text-lg font-extrabold text-navy"><dt>Total{tax ? " (inc. GST)" : ""}</dt><dd>{money(totals.total)}</dd></div>
            {paid && <Row term={`Paid${invoice.paidAt ? ` ${formatDisplayDate(invoice.paidAt.slice(0, 10))}` : ""}`} value={`−${money(totals.total)}`} />}
            <div className="flex justify-between rounded-xl bg-mist px-3 py-2 font-extrabold text-navy print:bg-white print:ring-1 print:ring-line"><dt>Amount due</dt><dd>{money(due)}</dd></div>
            {!tax && <p className="pt-1 text-right text-xs text-slate">No GST has been charged on this invoice.</p>}
          </dl>
        </section>

        {/* Payment and notes */}
        <section className="mt-8 grid gap-6 rounded-2xl border border-line p-5 sm:grid-cols-2 print:rounded-lg">
          <div>
            <p className={label}>How to pay</p>
            {hasBank || pay.payId ? (
              <div className="mt-1.5 space-y-2 leading-relaxed">
                {hasBank && (
                  <p>
                    <span className="font-semibold text-navy">Bank transfer (EFT)</span><br />
                    {pay.bankAccountName && <>Account name: {pay.bankAccountName}<br /></>}
                    {pay.bsb && <>BSB: {pay.bsb}<br /></>}
                    {pay.accountNumber && <>Account no: {pay.accountNumber}</>}
                  </p>
                )}
                {pay.payId && <p><span className="font-semibold text-navy">PayID:</span> {pay.payId}</p>}
                <p className="text-sm">Please use <b>{invoice.number}</b> as the payment reference.</p>
              </div>
            ) : <p className="mt-1.5">Please contact us on {settings.phoneDisplay} to arrange payment. Reference: <b>{invoice.number}</b>.</p>}
          </div>
          <div>
            <p className={label}>Terms</p>
            <p className="mt-1.5">{terms}.</p>
            {invoice.notes && (
              <>
                <p className={cn(label, "mt-4")}>Notes</p>
                <p className="mt-1.5 whitespace-pre-wrap">{invoice.notes}</p>
              </>
            )}
          </div>
        </section>

        <footer className="mt-8 border-t border-line pt-4 text-center text-sm text-slate">
          {pay.footer && <p className="font-medium text-navy">{pay.footer}</p>}
          <p className="mt-1">{[settings.businessName, settings.abn && `ABN ${settings.abn}`, settings.phoneDisplay, settings.email].filter(Boolean).join(" · ")}</p>
        </footer>
      </div>
    </article>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate">{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}
