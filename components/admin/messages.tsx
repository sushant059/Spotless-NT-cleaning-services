"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, Smartphone } from "lucide-react";
import { logCampaignAction } from "@/lib/actions";
import { displayName } from "@/components/admin/customers";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import type { Campaign, Customer, Offer, Promo } from "@/lib/types";
import { cn, formatDisplayDateTime, waLink } from "@/lib/utils";

function personalise(message: string, customer: Customer) {
  return message.replace(/\{name\}/gi, customer.name.split(" ")[0] || "there");
}

function smsLink(phone: string, text: string) {
  return `sms:${phone}?&body=${encodeURIComponent(text)}`;
}

export function MessagesComposer({ customers, offers, promos, campaigns, siteUrl }: { customers: Customer[]; offers: Offer[]; promos: Promo[]; campaigns: Campaign[]; siteUrl: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const optedIn = customers.filter((customer) => customer.marketingOptIn && customer.phone);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("Hi {name}, it's Spotless NT! ");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState<string[]>([]);
  const recipients = useMemo(() => optedIn.filter((customer) => selected.includes(customer.id)), [optedIn, selected]);
  const activePromos = promos.filter((promo) => promo.active);

  function applyOffer(id: string) {
    const offer = offers.find((item) => item.id === id);
    if (!offer) return;
    setTitle(offer.title);
    setMessage(`Hi {name}, it's Spotless NT! ${offer.title}. ${offer.description} Book or get a quote: ${siteUrl}${offer.href || "/free-quote"}\nReply STOP to opt out.`);
  }

  function addPromo(code: string) {
    const promo = promos.find((item) => item.code === code);
    if (promo) setMessage((value) => `${value.trimEnd()}\nUse code ${promo.code} for ${promo.type === "percent" ? `${promo.amount}% off` : `$${promo.amount} off`}.`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-card bg-white p-5 shadow-card">
        <h2 className="text-xl font-bold text-navy">1. Write the message</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="m-offer">Start from an offer (optional)</Label>
            <Select id="m-offer" defaultValue="" onChange={(event) => applyOffer(event.target.value)}>
              <option value="">Choose an offer…</option>
              {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.title}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="m-promo">Add a promo code (optional)</Label>
            <Select id="m-promo" defaultValue="" onChange={(event) => { addPromo(event.target.value); event.target.value = ""; }}>
              <option value="">Choose a code…</option>
              {activePromos.map((promo) => <option key={promo.id} value={promo.code}>{promo.code}</option>)}
            </Select>
          </div>
          <div className="sm:col-span-2"><Label htmlFor="m-title">Name for your records</Label><Input id="m-title" value={title} placeholder="e.g. Wet season carpet special" onChange={(event) => setTitle(event.target.value)} /></div>
        </div>
        <Label htmlFor="m-message" className="mt-4">Message <span className="font-normal text-slate">({"{name}"} becomes each customer’s first name)</span></Label>
        <Textarea id="m-message" className="min-h-32" value={message} onChange={(event) => setMessage(event.target.value)} />
        <p className="mt-1 text-xs text-slate">Keep “Reply STOP to opt out” in offers. Australian law requires an easy way to unsubscribe.</p>
        <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Send with">
          {(["whatsapp", "sms"] as const).map((item) => (
            <button key={item} type="button" role="radio" aria-checked={channel === item} onClick={() => setChannel(item)} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold", channel === item ? "bg-navy text-white" : "bg-mist text-navy")}>
              {item === "whatsapp" ? <MessageCircle className="h-4 w-4" aria-hidden /> : <Smartphone className="h-4 w-4" aria-hidden />} {item === "whatsapp" ? "WhatsApp" : "Text message (SMS)"}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-card bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-navy">2. Choose who gets it</h2>
          {optedIn.length > 0 && <Button type="button" size="sm" variant="outline" onClick={() => setSelected(selected.length === optedIn.length ? [] : optedIn.map((item) => item.id))}>{selected.length === optedIn.length ? "Clear all" : `Select all (${optedIn.length})`}</Button>}
        </div>
        <p className="mt-1 text-sm text-slate">Only customers who agreed to receive offers are listed ({customers.length - optedIn.length} others hidden). Tick “agreed to receive offers” on a customer to add them.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {optedIn.map((customer) => (
            <li key={customer.id}>
              <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3", selected.includes(customer.id) ? "border-brand bg-brand-light" : "border-line")}>
                <input type="checkbox" checked={selected.includes(customer.id)} onChange={(event) => setSelected((value) => (event.target.checked ? [...value, customer.id] : value.filter((id) => id !== customer.id)))} />
                <span className="min-w-0"><span className="block font-semibold text-navy">{displayName(customer)}</span><span className="block text-sm text-slate">{customer.phone}{customer.suburb && ` · ${customer.suburb}`}</span></span>
              </label>
            </li>
          ))}
        </ul>
        {optedIn.length === 0 && <p className="mt-3 rounded-2xl bg-mist p-4 text-sm text-slate">No customers have agreed to receive offers yet.</p>}
      </section>

      {recipients.length > 0 && (
        <section className="rounded-card bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-navy">3. Send</h2>
          <p className="mt-1 text-sm text-slate">Each button opens {channel === "whatsapp" ? "WhatsApp" : "your phone’s messages app"} with the message ready. Tap send there, then come back for the next one. {channel === "whatsapp" && "WhatsApp doesn’t allow websites to send in bulk automatically without a paid WhatsApp Business API account."}</p>
          <ul className="mt-4 divide-y divide-line">
            {recipients.map((customer) => {
              const text = personalise(message, customer);
              const href = channel === "whatsapp" ? waLink(customer.phone, text) : smsLink(customer.phone, text);
              const done = sent.includes(customer.id);
              return (
                <li key={customer.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="min-w-0 flex-1"><span className="block font-semibold text-navy">{displayName(customer)}</span><span className="block truncate text-sm text-slate">{text.split("\n")[0]}</span></span>
                  <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setSent((value) => (value.includes(customer.id) ? value : [...value, customer.id]))} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold", done ? "bg-leaf-soft text-leaf-dark" : channel === "whatsapp" ? "bg-whatsapp text-white" : "bg-navy text-white")}>
                    {done ? <><Check className="h-4 w-4" aria-hidden /> Opened</> : channel === "whatsapp" ? "Send on WhatsApp" : "Send text"}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" disabled={pending || sent.length === 0} onClick={() => start(async () => {
              const result = await logCampaignAction({ title, message, channel, recipientIds: sent });
              toast(result.ok ? result.message || "Saved" : result.error, result.ok ? "ok" : "error");
              if (result.ok) {
                setSent([]);
                setSelected([]);
                router.refresh();
              }
            })}>Save to history ({sent.length} sent)</Button>
            <span className="text-sm text-slate">Saves who you sent this message to.</span>
          </div>
        </section>
      )}

      <section className="rounded-card bg-white p-5 shadow-card">
        <h2 className="text-xl font-bold text-navy">Message history</h2>
        {campaigns.length === 0 && <p className="mt-2 text-sm text-slate">Nothing sent yet.</p>}
        <ul className="mt-3 divide-y divide-line">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="py-3">
              <p className="font-semibold text-navy">{campaign.title} <span className="text-sm font-normal text-slate">· {campaign.channel === "whatsapp" ? "WhatsApp" : "SMS"} · {campaign.recipientIds.length} people · {formatDisplayDateTime(campaign.createdAt)}</span></p>
              <p className="whitespace-pre-wrap text-sm text-slate">{campaign.message}</p>
              <p className="mt-1 text-xs text-slate">To: {campaign.recipientIds.map((id) => customers.find((item) => item.id === id)).filter(Boolean).map((item) => displayName(item as Customer)).join(", ") || "—"}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
