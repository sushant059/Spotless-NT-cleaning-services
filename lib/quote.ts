import { invoiceTotals, lineTotal, money } from "@/lib/invoice";
import type { Customer, Quote, Settings } from "@/lib/types";
import { formatDisplayDate } from "@/lib/utils";

export const QUOTE_STATUS: Record<Quote["status"], { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-mist text-slate" },
  sent: { label: "Sent", tone: "bg-brand-light text-brand" },
  accepted: { label: "Accepted", tone: "bg-leaf-soft text-leaf-dark" },
  declined: { label: "Declined", tone: "bg-red-50 text-danger" },
};

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isQuoteExpired(quote: Pick<Quote, "status" | "validUntil">, today: string) {
  return quote.status === "sent" && Boolean(quote.validUntil) && quote.validUntil < today;
}

/**
 * The ready-to-send message: greeting, each line with its price, the total, what's included,
 * how long the price holds and how to accept. Used for copy/paste, WhatsApp, SMS and the email body.
 */
export function quoteMessage(settings: Settings, quote: Quote, customer: Pick<Customer, "name"> | undefined, link: string, signOff = "") {
  const first = customer?.name.trim().split(/\s+/)[0] || "there";
  const totals = invoiceTotals(quote, settings.invoice.gstRegistered);
  const lines = quote.items.filter((item) => item.description.trim()).map((item) => {
    const qty = item.quantity && item.quantity !== 1 ? ` × ${item.quantity}` : "";
    return `• ${item.description.trim()}${qty}: ${money(lineTotal(item))}`;
  });
  const gst = settings.invoice.gstRegistered ? " (incl. GST)" : "";
  return [
    `Hi ${first},`,
    `Thanks for getting in touch with ${settings.businessName}. Here's your quote ${quote.number || ""}:`.replace(" :", ":"),
    [...lines, ...(totals.discount > 0 ? [`Discount: −${money(totals.discount)}`] : []), `Total: ${money(totals.total)}${gst}`].join("\n"),
    quote.notes.trim(),
    quote.validUntil ? `This price is valid until ${formatDisplayDate(quote.validUntil)}.` : "",
    link ? `View, print or accept your quote here: ${link}` : "",
    "Reply to this message or call us to book a time that suits you.",
    ["Kind regards,", signOff.trim(), settings.businessName, [settings.phoneDisplay, settings.email].filter(Boolean).join(" | ")].filter(Boolean).join("\n"),
  ].filter(Boolean).join("\n\n");
}
