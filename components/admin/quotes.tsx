"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { BriefcaseBusiness, Check, Copy, ExternalLink, Mail, MessageCircle, Plus, Printer, Receipt, RotateCcw, Smartphone, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { deleteQuoteAction, quoteToJobAction, saveQuoteAction, sendQuoteAction, setQuoteStatusAction, type QuoteContact } from "@/lib/actions";
import { invoiceTotals, lineTotal, money, parsePrice } from "@/lib/invoice";
import { addDays, isQuoteExpired, QUOTE_STATUS, quoteMessage } from "@/lib/quote";
import type { Customer, InvoiceItem, Quote, Service, Settings } from "@/lib/types";
import { cn, formatDisplayDate, waLink } from "@/lib/utils";

export function QuoteStatusBadge({ quote, today }: { quote: Quote; today: string }) {
  const expired = isQuoteExpired(quote, today);
  const status = QUOTE_STATUS[quote.status];
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", expired ? "bg-sun-soft text-[#7A4E00]" : status.tone)}>{expired ? "Expired" : status.label}</span>;
}

/** Your name at the bottom of quote messages, remembered on this device. */
function useSignOff() {
  const [signOff, setSignOff] = useState("");
  useEffect(() => {
    try {
      setSignOff(localStorage.getItem("quote-sign-off") || "");
    } catch {}
  }, []);
  const save = (value: string) => {
    setSignOff(value);
    try {
      localStorage.setItem("quote-sign-off", value);
    } catch {}
  };
  return [signOff, save] as const;
}

/* ---------------------------------- List ---------------------------------- */

export function QuotesBoard({ quotes, customers, gstRegistered, today }: { quotes: Quote[]; customers: Customer[]; gstRegistered: boolean; today: string }) {
  const [filter, setFilter] = useState<"all" | Quote["status"]>("all");
  const total = (quote: Quote) => invoiceTotals(quote, gstRegistered).total;
  const count = (status: Quote["status"]) => quotes.filter((item) => item.status === status);
  const visible = quotes.filter((item) => filter === "all" || item.status === filter);
  const tiles = [
    { id: "sent" as const, label: "Waiting for an answer", items: count("sent") },
    { id: "accepted" as const, label: "Accepted", items: count("accepted") },
    { id: "draft" as const, label: "Drafts", items: count("draft") },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <button key={tile.id} type="button" onClick={() => setFilter(filter === tile.id ? "all" : tile.id)} className={cn("rounded-card bg-white p-4 text-left shadow-card", filter === tile.id && "ring-2 ring-navy")}>
            <p className="text-sm text-slate">{tile.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{money(tile.items.reduce((sum, item) => sum + total(item), 0))}</p>
            <p className="text-xs text-slate">{tile.items.length} quote{tile.items.length === 1 ? "" : "s"}</p>
          </button>
        ))}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(["all", "draft", "sent", "accepted", "declined"] as const).map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold", filter === item ? "bg-navy text-white" : "bg-white text-navy shadow-card")}>
            {item === "all" ? "All" : QUOTE_STATUS[item].label}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {visible.map((quote) => {
          const customer = customers.find((item) => item.id === quote.customerId);
          return (
            <li key={quote.id}>
              <Link href={`/admin/quotes/${quote.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card bg-white p-4 shadow-card hover:ring-2 hover:ring-brand/30">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-navy">{quote.number} · {customer ? customer.companyName || customer.name : "Customer removed"}</span>
                  <span className="block truncate text-sm text-slate">{formatDisplayDate(quote.issueDate)} · {quote.items.map((item) => item.description).join(", ")}</span>
                </span>
                <span className="text-lg font-extrabold text-navy">{money(total(quote))}</span>
                <QuoteStatusBadge quote={quote} today={today} />
              </Link>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className="rounded-card bg-white p-6 text-slate shadow-card">{quotes.length ? "No quotes in this filter." : "No quotes yet. Tap “New quote”, or use the Quote button on a customer, job or enquiry."}</p>}
    </div>
  );
}

/* --------------------------------- Builder -------------------------------- */

const NOTE_IDEAS = [
  "Price includes pre-treatment of stains and hot-water extraction.",
  "Allow 4–8 hours drying time (longer in the wet season).",
  "Moving heavy furniture is not included unless listed above.",
  "Some old stains may be permanent; we’ll tell you honestly on the day.",
  "Safe for kids and pets once dry.",
];

const blankItem = (): InvoiceItem => ({ description: "", quantity: 1, unitPrice: 0 });
const step = "flex items-center gap-3 text-lg font-bold text-navy";
const num = "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-extrabold text-white";

/**
 * Step by step: who it's for (asks for anything missing), what's being cleaned with prices,
 * details, then the ready-to-send message. Saving creates the customer if they're new.
 */
export function QuoteBuilder({ initial, contact: initialContact, settings, services, link }: { initial: Quote; contact: QuoteContact; settings: Settings; services: Pick<Service, "title" | "priceFrom">[]; link: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [quote, setQuote] = useState<Quote>(initial);
  const [contact, setContact] = useState<QuoteContact>(initialContact);
  const [custom, setCustom] = useState<string | null>(initial.message.trim() ? initial.message : null);
  const [signOff, setSignOff] = useSignOff();
  const isNew = !initial.number;
  const tax = settings.invoice.gstRegistered;
  const totals = invoiceTotals(quote, tax);
  const auto = useMemo(() => quoteMessage(settings, { ...quote, number: quote.number || "(number added when saved)" }, { name: contact.name }, link || "(your quote link is added when you send it)", signOff), [settings, quote, contact.name, link, signOff]);
  const message = custom ?? auto;
  const missing = [!contact.phone.trim() && "phone", !contact.email.trim() && "email"].filter(Boolean) as string[];

  const setItem = (index: number, patch: Partial<InvoiceItem>) => setQuote((value) => ({ ...value, items: value.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) }));
  const toNumber = (text: string) => (text === "" ? 0 : Number(text));
  const addService = (service: Pick<Service, "title" | "priceFrom">) => setQuote((value) => {
    const line = { description: service.title, quantity: 1, unitPrice: parsePrice(service.priceFrom) };
    const items = value.items.length === 1 && !value.items[0].description.trim() ? [line] : [...value.items, line];
    return { ...value, items };
  });
  const validDays = quote.validUntil && quote.issueDate ? Math.round((Date.parse(quote.validUntil) - Date.parse(quote.issueDate)) / 864e5) : 0;

  function save() {
    start(async () => {
      const result = await saveQuoteAction({ ...quote, message: custom ?? "" }, contact);
      toast(result.ok ? result.message || "Saved" : result.error, result.ok ? "ok" : "error");
      if (!result.ok) return;
      if (isNew && result.id) router.push(`/admin/quotes/${result.id}`);
      else router.refresh();
    });
  }

  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); save(); }}>
      {/* 1. Customer */}
      <section className="rounded-card bg-white p-4 shadow-card sm:p-6">
        <h2 className={step}><span className={num}>1</span> Who is the quote for?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="q-name">Name *</Label><Input id="q-name" required value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} autoComplete="off" /></div>
          <div><Label htmlFor="q-company">Company (optional)</Label><Input id="q-company" value={contact.companyName} onChange={(event) => setContact({ ...contact, companyName: event.target.value })} /></div>
          <div><Label htmlFor="q-phone">Mobile</Label><Input id="q-phone" inputMode="tel" placeholder="04xx xxx xxx" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} className={cn(!contact.phone.trim() && "ring-2 ring-sun")} /></div>
          <div><Label htmlFor="q-email">Email</Label><Input id="q-email" type="email" placeholder="name@example.com" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} className={cn(!contact.email.trim() && "ring-2 ring-sun")} /></div>
          <div><Label htmlFor="q-address">Address</Label><Input id="q-address" value={contact.address} onChange={(event) => setContact({ ...contact, address: event.target.value })} /></div>
          <div><Label htmlFor="q-suburb">Suburb</Label><Input id="q-suburb" value={contact.suburb} onChange={(event) => setContact({ ...contact, suburb: event.target.value })} /></div>
        </div>
        {missing.length > 0 && <p className="mt-3 rounded-2xl bg-sun-soft p-3 text-sm text-[#7A4E00]">No {missing.join(" or ")} saved for this customer yet. Add {missing.length > 1 ? "them" : "it"} above so you can send the quote{missing.includes("email") ? " by email" : " by text or WhatsApp"}. It’s saved to their customer record.</p>}
      </section>

      {/* 2. Items */}
      <section className="rounded-card bg-white p-4 shadow-card sm:p-6">
        <h2 className={step}><span className={num}>2</span> What needs cleaning, and the price</h2>
        <p className="mt-1 text-sm text-slate">Tap a service to add it, then set the quantity and price{tax ? " (GST inclusive)" : ""}.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {services.map((service) => (
            <button key={service.title} type="button" onClick={() => addService(service)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-mist px-3 text-sm font-semibold text-navy ring-1 ring-line transition hover:bg-brand-light active:scale-95"><Plus className="h-4 w-4" aria-hidden /> {service.title}</button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {quote.items.map((item, index) => (
            <li key={index} className="rounded-2xl border border-line p-3">
              <Label htmlFor={`q-desc-${index}`} className="sr-only">Description</Label>
              <Textarea id={`q-desc-${index}`} className="min-h-14" placeholder="e.g. Carpet steam clean – 3 bedrooms, hallway and lounge" value={item.description} onChange={(event) => setItem(index, { description: event.target.value })} />
              <div className="mt-2 grid grid-cols-[1fr_1.4fr_auto] items-end gap-2 sm:grid-cols-[120px_170px_1fr_auto]">
                <div><Label htmlFor={`q-qty-${index}`}>Qty</Label><Input id={`q-qty-${index}`} type="number" inputMode="decimal" min="0" step="any" value={item.quantity || ""} onChange={(event) => setItem(index, { quantity: toNumber(event.target.value) })} /></div>
                <div><Label htmlFor={`q-price-${index}`}>Price each ($)</Label><Input id={`q-price-${index}`} type="number" inputMode="decimal" min="0" step="0.01" value={item.unitPrice || ""} onChange={(event) => setItem(index, { unitPrice: toNumber(event.target.value) })} /></div>
                <p className="hidden pb-3 text-right font-bold text-navy sm:block">{money(lineTotal(item))}</p>
                <Button type="button" size="icon" variant="ghost" aria-label="Remove line" disabled={quote.items.length === 1} onClick={() => setQuote({ ...quote, items: quote.items.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" aria-hidden /></Button>
              </div>
            </li>
          ))}
        </ul>
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => setQuote({ ...quote, items: [...quote.items, blankItem()] })}><Plus className="h-4 w-4" aria-hidden /> Add a line</Button>
        <dl className="mt-4 ml-auto max-w-xs space-y-1 rounded-2xl bg-mist p-4">
          <div className="flex justify-between"><dt className="text-slate">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          {totals.discount > 0 && <div className="flex justify-between"><dt className="text-slate">Discount</dt><dd>−{money(totals.discount)}</dd></div>}
          <div className="flex justify-between border-t border-line pt-2 text-xl font-extrabold text-navy"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
          {tax && <div className="flex justify-between text-sm"><dt className="text-slate">GST included</dt><dd>{money(totals.gst)}</dd></div>}
        </dl>
      </section>

      {/* 3. Details */}
      <section className="rounded-card bg-white p-4 shadow-card sm:p-6">
        <h2 className={step}><span className={num}>3</span> Details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div><Label htmlFor="q-date">Quote date</Label><Input id="q-date" type="date" value={quote.issueDate} onChange={(event) => setQuote({ ...quote, issueDate: event.target.value, validUntil: validDays > 0 ? addDays(event.target.value, validDays) : quote.validUntil })} /></div>
          <div><Label htmlFor="q-valid">Price valid for</Label>
            <Select id="q-valid" value={[7, 14, 30, 60].includes(validDays) ? String(validDays) : ""} onChange={(event) => setQuote({ ...quote, validUntil: event.target.value ? addDays(quote.issueDate, Number(event.target.value)) : "" })}>
              <option value="">No expiry</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
            </Select>
          </div>
          <div><Label htmlFor="q-discount">Discount ($)</Label><Input id="q-discount" type="number" inputMode="decimal" min="0" step="0.01" value={quote.discount || ""} onChange={(event) => setQuote({ ...quote, discount: toNumber(event.target.value) })} /></div>
        </div>
        <Label htmlFor="q-notes" className="mt-4">What’s included and notes (printed on the quote)</Label>
        <Textarea id="q-notes" className="min-h-24" value={quote.notes} onChange={(event) => setQuote({ ...quote, notes: event.target.value })} placeholder="What the price includes, access, parking, conditions…" />
        <div className="mt-2 flex flex-wrap gap-2">
          {NOTE_IDEAS.filter((idea) => !quote.notes.includes(idea)).map((idea) => (
            <button key={idea} type="button" onClick={() => setQuote({ ...quote, notes: [quote.notes.trim(), idea].filter(Boolean).join("\n") })} className="rounded-full bg-mist px-3 py-1.5 text-left text-xs font-semibold text-navy ring-1 ring-line hover:bg-brand-light">+ {idea}</button>
          ))}
        </div>
      </section>

      {/* 4. Message */}
      <section className="rounded-card bg-white p-4 shadow-card sm:p-6">
        <h2 className={step}><span className={num}>4</span> The message</h2>
        <p className="mt-1 text-sm text-slate">Written for you from the details above. Edit it if you like. It’s used for email, WhatsApp, text and copy/paste.</p>
        <div className="mt-3 max-w-sm"><Label htmlFor="q-sign">Your name (sign-off)</Label><Input id="q-sign" placeholder="e.g. Kishan" value={signOff} onChange={(event) => setSignOff(event.target.value)} /></div>
        <Textarea aria-label="Quote message" className="mt-3 min-h-72 font-[inherit] leading-relaxed" value={message} onChange={(event) => setCustom(event.target.value)} />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(message).then(() => toast("Message copied", "ok"))}><Copy className="h-4 w-4" aria-hidden /> Copy message</Button>
          {custom !== null && <Button type="button" size="sm" variant="ghost" onClick={() => setCustom(null)}><RotateCcw className="h-4 w-4" aria-hidden /> Back to automatic message</Button>}
        </div>
      </section>

      <div className="sticky bottom-20 z-10 flex flex-wrap items-center gap-3 rounded-card bg-white/95 p-3 shadow-soft backdrop-blur md:bottom-4">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : isNew ? "Save quote" : "Save changes"}</Button>
        <span className="text-sm text-slate">Total <b className="text-navy">{money(totals.total)}</b>{isNew ? " · after saving you can email, WhatsApp, text or print it" : ""}</span>
      </div>
    </form>
  );
}

/* ---------------------------------- Send ---------------------------------- */

export function QuoteSendPanel({ quote, customer, settings, link, emailReady, smsReady }: { quote: Quote; customer?: Customer; settings: Settings; link: string; emailReady: boolean; smsReady: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [signOff] = useSignOff();
  const [to, setTo] = useState(customer?.email ?? "");
  const message = quote.message.trim() || quoteMessage(settings, quote, customer, link, signOff);
  const total = money(invoiceTotals(quote, settings.invoice.gstRegistered).total);

  function run(work: () => Promise<{ ok: boolean; error?: string; message?: string; customerId?: string }>, after?: (result: { customerId?: string }) => void) {
    start(async () => {
      const result = await work();
      toast(result.ok ? result.message || "Done" : result.error || "Something went wrong", result.ok ? "ok" : "error");
      if (result.ok) {
        after?.(result);
        router.refresh();
      }
    });
  }
  const markSent = () => {
    if (quote.status === "draft") run(() => setQuoteStatusAction(quote.id, "sent"));
  };
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(`Your quote ${quote.number} from ${settings.shortName} – ${total}`)}&body=${encodeURIComponent(message)}`;

  return (
    <section className="space-y-4 rounded-card bg-white p-4 shadow-card sm:p-5">
      <h2 className="text-xl font-bold text-navy">Send the quote</h2>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div><Label htmlFor="q-to">Email to (you can add more, separated by commas)</Label><Input id="q-to" type="text" inputMode="email" value={to} onChange={(event) => setTo(event.target.value)} placeholder="customer@example.com" /></div>
        {emailReady ? (
          <Button type="button" variant="navy" className="self-end" disabled={pending || !to.trim()} onClick={() => run(() => sendQuoteAction(quote.id, "email", to, message))}><Mail className="h-4 w-4" aria-hidden /> Email quote</Button>
        ) : (
          <a href={mailto} onClick={markSent} className="inline-flex min-h-12 items-center justify-center gap-2 self-end rounded-full bg-navy px-5 font-semibold text-white"><Mail className="h-4 w-4" aria-hidden /> Email quote</a>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {customer?.phone && <a href={waLink(customer.phone, message)} target="_blank" rel="noopener noreferrer" onClick={markSent} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-5 font-semibold text-white"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>}
        {customer?.phone && (smsReady
          ? <Button type="button" variant="outline" disabled={pending} onClick={() => run(() => sendQuoteAction(quote.id, "sms", "", message))}><Smartphone className="h-4 w-4" aria-hidden /> Text (SMS)</Button>
          : <a href={`sms:${customer.phone}?&body=${encodeURIComponent(message)}`} onClick={markSent} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-navy/15 px-5 font-semibold text-navy"><Smartphone className="h-4 w-4" aria-hidden /> Text (SMS)</a>)}
        <Button type="button" variant="outline" onClick={() => navigator.clipboard?.writeText(message).then(() => { toast("Message copied. Paste it anywhere.", "ok"); markSent(); })}><Copy className="h-4 w-4" aria-hidden /> Copy message</Button>
        <a href={`/admin/quote-print/${quote.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-navy/15 px-5 font-semibold text-navy hover:border-brand"><Printer className="h-4 w-4" aria-hidden /> Print / PDF</a>
        {quote.status !== "draft" && <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-brand hover:bg-brand-light"><ExternalLink className="h-4 w-4" aria-hidden /> Customer’s view</a>}
      </div>
      <p className="text-sm text-slate">The customer gets a link to view, print and <b>accept</b> the quote online. You’ll get an email when they accept.{quote.sentAt && ` Last sent ${formatDisplayDate(quote.sentAt.slice(0, 10))}.`}</p>

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {quote.status === "draft" && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run(() => setQuoteStatusAction(quote.id, "sent"))}>Mark as sent</Button>}
        {quote.status !== "accepted" && <Button type="button" size="sm" disabled={pending} onClick={() => run(() => setQuoteStatusAction(quote.id, "accepted"))}><Check className="h-4 w-4" aria-hidden /> Mark accepted</Button>}
        {quote.status !== "declined" && quote.status !== "accepted" && <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setQuoteStatusAction(quote.id, "declined"))}><X className="h-4 w-4" aria-hidden /> Declined</Button>}
        {quote.jobId ? (
          <Link href={`/admin/customers/${quote.customerId}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-leaf-soft px-4 text-sm font-semibold text-leaf-dark"><BriefcaseBusiness className="h-4 w-4" aria-hidden /> Job booked</Link>
        ) : (
          <Button type="button" size="sm" variant="navy" disabled={pending} onClick={() => run(() => quoteToJobAction(quote.id), (result) => result.customerId && router.push(`/admin/customers/${result.customerId}`))}><BriefcaseBusiness className="h-4 w-4" aria-hidden /> Book job</Button>
        )}
        <Link href={`/admin/invoices/new?quote=${quote.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-navy/15 px-4 text-sm font-semibold text-navy hover:border-brand"><Receipt className="h-4 w-4" aria-hidden /> Create invoice</Link>
        <ConfirmDialog title="Delete this quote?" body="It’s removed for good and the customer’s link stops working." confirmLabel="Delete" onConfirm={() => start(async () => { const result = await deleteQuoteAction(quote.id); toast(result.ok ? result.message || "Deleted" : result.error, result.ok ? "ok" : "error"); if (result.ok) router.push("/admin/quotes"); })} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
      </div>
    </section>
  );
}
