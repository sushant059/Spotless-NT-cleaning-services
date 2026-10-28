"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { respondToQuoteAction } from "@/lib/actions";

/** Accept / decline buttons on the customer's quote page. */
export function QuoteRespond({ token, status, phone }: { token: string; status: string; phone: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<{ ok: boolean; text: string } | null>(null);
  if (status === "accepted" && !done) return <p className="rounded-2xl bg-leaf-soft p-4 font-semibold text-leaf-dark print:hidden">✅ You’ve accepted this quote. We’ll be in touch to book a time. Questions? Call {phone}.</p>;
  if (done) return <p className={`rounded-2xl p-4 font-semibold print:hidden ${done.ok ? "bg-leaf-soft text-leaf-dark" : "bg-red-50 text-danger"}`}>{done.text}</p>;
  const respond = (accept: boolean) => start(async () => {
    const result = await respondToQuoteAction(token, accept);
    setDone({ ok: result.ok, text: result.ok ? result.message || "Thanks!" : result.error });
  });
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center print:hidden">
      <p className="flex-1 font-semibold text-navy">Happy with this quote?</p>
      <button type="button" disabled={pending} onClick={() => respond(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-leaf-dark px-6 font-bold text-white hover:bg-leaf disabled:opacity-60"><Check className="h-5 w-5" aria-hidden /> Accept quote</button>
      {status !== "declined" && <button type="button" disabled={pending} onClick={() => respond(false)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-line px-6 font-bold text-navy hover:border-navy disabled:opacity-60"><X className="h-5 w-5" aria-hidden /> No thanks</button>}
    </div>
  );
}
