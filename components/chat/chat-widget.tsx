"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MapPin, Minus, Plus, X } from "lucide-react";
import { botReplyAction, checkPromoAction, submitChat } from "@/lib/actions";
import { CHAT_OPTIONS, PREFERRED_TIMES, SERVICE_FIELDS, SERVICE_TITLES, defaultDetails, summariseJob, validateDetails } from "@/lib/constants";
import { ServiceIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Textarea } from "@/components/ui/fields";
import type { Faq, Settings } from "@/lib/types";
import { normalizeAuPhone } from "@/lib/validators";
import { cn, waLink } from "@/lib/utils";

type Step = "services" | "details" | "suburb" | "name" | "phone" | "time" | "summary" | "success";
const STEPS: Step[] = ["services", "details", "suburb", "name", "phone", "time", "summary"];

type Draft = {
  step: Step;
  services: string[];
  details: Record<string, string | number | boolean>;
  suburb: string;
  name: string;
  phone: string;
  time: string;
  promo: string;
  promoMessage: string;
  promoOk: boolean | null;
  reference: string;
};

const EMPTY: Draft = {
  step: "services",
  services: [],
  details: {},
  suburb: "",
  name: "",
  phone: "",
  time: "",
  promo: "",
  promoMessage: "",
  promoOk: null,
  reference: "",
};

const STORAGE = "snt-chat-v1";

export function ChatWidget({ settings, faqs, open, onOpenChange }: { settings: Settings; faqs: Faq[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(STORAGE);
    if (saved) {
      try {
        setDraft({ ...EMPTY, ...JSON.parse(saved) });
      } catch {
        setDraft(EMPTY);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.sessionStorage.setItem(STORAGE, JSON.stringify(draft));
  }, [draft, ready]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const progress = useMemo(() => {
    const index = Math.max(0, STEPS.indexOf(draft.step === "success" ? "summary" : draft.step));
    return ((index + 1) / STEPS.length) * 100;
  }, [draft.step]);

  function go(step: Step) {
    setError("");
    setTyping(true);
    window.setTimeout(() => {
      setDraft((current) => ({ ...current, step }));
      setTyping(false);
    }, 280);
  }

  function back() {
    const index = STEPS.indexOf(draft.step as Step);
    if (index > 0) go(STEPS[index - 1]);
  }

  async function nextFromServices() {
    if (!draft.services.length) return setError("Choose at least one service.");
    setDraft((current) => ({ ...current, details: { ...defaultDetails(current.services), ...current.details } }));
    go("details");
  }

  async function nextFromDetails() {
    const message = validateDetails(draft.services, draft.details);
    if (message) return setError(message);
    go("suburb");
  }

  async function locate() {
    if (!navigator.geolocation) return setError("Location is not available on this device. Type the suburb instead.");
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        const data = await response.json();
        const suburb = data.address?.suburb || data.address?.town || data.address?.village || data.address?.city || "";
        if (!suburb) return setError("We could not read a suburb from that location. Type it instead.");
        setDraft((current) => ({ ...current, suburb }));
        setError("");
      } catch {
        setError("We could not look up that location. Type the suburb instead.");
      }
    }, () => setError("Location permission was blocked. Type the suburb instead."));
  }

  async function submit() {
    setBusy(true);
    const result = await submitChat({
      services: draft.services,
      details: draft.details,
      suburb: draft.suburb,
      name: draft.name,
      phone: draft.phone,
      preferredTime: draft.time,
      promo: draft.promo,
      company_website: "",
    });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setDraft((current) => ({ ...current, step: "success", reference: result.reference || "", promoMessage: result.message || current.promoMessage }));
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    const reply = await botReplyAction(question);
    setAnswer(reply.reply);
    setQuestion("");
  }

  if (!open) return null;
  const summary = summariseJob(draft.services, draft.details);
  const whatsappText = `Hi Spotless NT, I'd like a free quote.\nReference: ${draft.reference}\n${summary.join("\n")}\nSuburb: ${draft.suburb}\nName: ${draft.name}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white md:inset-auto md:bottom-6 md:right-6 md:h-[min(680px,calc(100vh-3rem))] md:w-[400px] md:overflow-hidden md:rounded-card md:shadow-soft" role="dialog" aria-label="Spotless NT chat">
      <header className="bg-gradient-to-r from-teal-deep to-teal px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="relative grid h-3 w-3 place-items-center">
            <span className="h-3 w-3 rounded-full bg-mint" />
          </span>
          <div className="flex-1">
            <p className="font-bold">Spotless NT</p>
            <p className="text-sm text-white/90">We reply during opening hours</p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Close chat" onClick={() => onOpenChange(false)}>
            <X aria-hidden />
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25" aria-hidden>
          <div className="h-full bg-sun" style={{ width: `${progress}%` }} />
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <p className="max-w-[90%] rounded-2xl rounded-tl-sm bg-sky px-4 py-3 text-ink">Hi! How can I help you today?</p>
        {typing && <p className="w-16 rounded-full bg-sky px-4 py-3 text-slate" aria-live="polite">···</p>}
        {!typing && draft.step === "services" && (
          <div>
            <div className="grid grid-cols-2 gap-2">
              {CHAT_OPTIONS.map((option) => {
                const selected = draft.services.includes(option.slug);
                return (
                  <button key={option.slug} type="button" aria-pressed={selected} onClick={() => setDraft((current) => ({ ...current, services: selected ? current.services.filter((slug) => slug !== option.slug) : [...current.services, option.slug] }))} className={cn("min-h-16 rounded-2xl border px-3 py-2 text-left text-sm font-semibold", selected ? "border-teal bg-sky text-teal-deep" : "border-[#d5e6ea] bg-white")}>
                    <ServiceIcon name={option.icon} className="mb-1 h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
            <FieldError message={error} />
          </div>
        )}
        {!typing && draft.step === "details" && (
          <div className="space-y-4">
            {draft.services.map((slug) => (
              <fieldset key={slug} className="rounded-2xl border border-[#d5e6ea] p-3">
                <legend className="px-1 text-sm font-bold">{SERVICE_TITLES[slug]}</legend>
                <div className="space-y-3">
                  {(SERVICE_FIELDS[slug] ?? []).map((field) => (
                    <FieldControl key={field.key} field={field} value={draft.details[field.key]} onChange={(value) => setDraft((current) => ({ ...current, details: { ...current.details, [field.key]: value } }))} />
                  ))}
                </div>
              </fieldset>
            ))}
            <FieldError message={error} />
          </div>
        )}
        {!typing && draft.step === "suburb" && (
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="chat-suburb">Suburb or address</label>
            <Input id="chat-suburb" value={draft.suburb} onChange={(event) => setDraft((current) => ({ ...current, suburb: event.target.value }))} placeholder="e.g. Parap" />
            <button type="button" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-teal-deep" onClick={locate}><MapPin className="h-4 w-4" aria-hidden /> Use my location</button>
            <FieldError message={error} />
          </div>
        )}
        {!typing && draft.step === "name" && (
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="chat-name">Your name</label>
            <Input id="chat-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} autoComplete="name" />
            <FieldError message={error} />
          </div>
        )}
        {!typing && draft.step === "phone" && (
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="chat-phone">Mobile number</label>
            <Input id="chat-phone" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} inputMode="tel" autoComplete="tel" placeholder="0401 647 545" />
            <FieldError message={error} />
          </div>
        )}
        {!typing && draft.step === "time" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PREFERRED_TIMES.map((time) => (
                <button key={time} type="button" aria-pressed={draft.time === time} className={cn("rounded-full px-3 py-2 text-sm font-semibold", draft.time === time ? "bg-teal text-white" : "bg-sky text-ink")} onClick={() => setDraft((current) => ({ ...current, time }))}>{time}</button>
              ))}
            </div>
            <label className="block text-sm font-semibold" htmlFor="chat-promo">Do you have a promo code?</label>
            <div className="flex gap-2">
              <Input id="chat-promo" value={draft.promo} onChange={(event) => setDraft((current) => ({ ...current, promo: event.target.value, promoOk: null }))} />
              <Button type="button" variant="outline" size="sm" onClick={async () => {
                const result = await checkPromoAction(draft.promo);
                setDraft((current) => ({ ...current, promoOk: result.ok, promoMessage: result.message }));
              }}>Check</Button>
            </div>
            {draft.promoMessage && <p className={draft.promoOk ? "text-sm font-medium text-teal-deep" : "text-sm font-medium text-[#9e2a2a]"}>{draft.promoMessage}</p>}
          </div>
        )}
        {!typing && draft.step === "summary" && (
          <div className="rounded-2xl border border-[#d5e6ea] p-3 text-sm">
            <SummaryRow label="Services" value={summary.join("; ")} onEdit={() => go("services")} />
            <SummaryRow label="Suburb" value={draft.suburb} onEdit={() => go("suburb")} />
            <SummaryRow label="Name" value={draft.name} onEdit={() => go("name")} />
            <SummaryRow label="Phone" value={draft.phone} onEdit={() => go("phone")} />
            <SummaryRow label="Time" value={draft.time || "No preference"} onEdit={() => go("time")} />
            {draft.promoMessage && <p className="mt-2 text-teal-deep">{draft.promoMessage}</p>}
            <FieldError message={error} />
          </div>
        )}
        {draft.step === "success" && (
          <div className="rounded-2xl bg-sky p-4">
            <p className="text-lg font-bold">Thanks {draft.name}! {"We'll be in touch soon."}</p>
            <p className="mt-2">Your reference is <strong>{draft.reference}</strong></p>
            <button type="button" className="mt-2 text-sm font-semibold text-teal-deep" onClick={() => navigator.clipboard.writeText(draft.reference)}>Copy reference</button>
            <div className="mt-4 flex flex-col gap-2">
              <a className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-whatsapp px-4 font-semibold text-ink" href={waLink(settings.phoneTel, whatsappText)}>WhatsApp the summary</a>
              <a className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-teal-deep px-4 font-semibold text-teal-deep" href={`tel:${settings.phoneTel}`}>Call {settings.phoneDisplay}</a>
            </div>
          </div>
        )}
        {answer && <p className="rounded-2xl bg-cream px-4 py-3 text-sm">{answer} You can keep going with the quote buttons whenever you are ready.</p>}
      </div>
      <div className="border-t border-[#e4f2f4] p-3">
        {draft.step !== "success" && (
          <div className="mb-3 flex gap-2">
            {draft.step !== "services" && <Button type="button" variant="ghost" size="sm" onClick={back}>Back</Button>}
            {draft.step === "services" && <Button type="button" className="flex-1" onClick={nextFromServices}>Continue</Button>}
            {draft.step === "details" && <Button type="button" className="flex-1" onClick={nextFromDetails}>Continue</Button>}
            {draft.step === "suburb" && <Button type="button" className="flex-1" onClick={() => draft.suburb.trim().length < 2 ? setError("Enter your suburb.") : go("name")}>Continue</Button>}
            {draft.step === "name" && <Button type="button" className="flex-1" onClick={() => draft.name.trim().length < 2 ? setError("Enter your name.") : go("phone")}>Continue</Button>}
            {draft.step === "phone" && <Button type="button" className="flex-1" onClick={() => normalizeAuPhone(draft.phone) ? go("time") : setError("Enter an Australian phone number, like 0401 647 545.")}>Continue</Button>}
            {draft.step === "time" && <Button type="button" className="flex-1" onClick={() => go("summary")}>Continue</Button>}
            {draft.step === "summary" && <Button type="button" className="flex-1" disabled={busy} onClick={submit}>{busy ? "Sending…" : "Request my call back"}</Button>}
          </div>
        )}
        <form onSubmit={ask} className="flex gap-2">
          <label className="sr-only" htmlFor="chat-question">Ask a question</label>
          <Input id="chat-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about drying, pets, stains…" />
          <Button type="submit" variant="teal" size="sm" aria-label="Send question"><Check className="h-4 w-4" /></Button>
        </form>
        <p className="mt-2 text-xs text-slate">FAQs loaded: {faqs.length}. A person calls you back. This chat does not confirm a booking by itself.</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#e7f3f5] py-2 last:border-0">
      <p><span className="font-semibold">{label}. </span>{value}</p>
      <button type="button" className="shrink-0 font-semibold text-teal-deep" onClick={onEdit}>Edit</button>
    </div>
  );
}

function FieldControl({ field, value, onChange }: { field: (typeof SERVICE_FIELDS)[string][number]; value: string | number | boolean | undefined; onChange: (value: string | number | boolean) => void }) {
  if (field.kind === "stepper") {
    const current = Number(value ?? field.defaultValue);
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{field.label}</span>
        <div className="flex items-center gap-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-sky" aria-label={`Fewer ${field.label}`} onClick={() => onChange(Math.max(field.min, current - 1))}><Minus className="h-4 w-4" /></button>
          <span className="w-6 text-center font-bold">{current}</span>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-sky" aria-label={`More ${field.label}`} onClick={() => onChange(Math.min(field.max, current + 1))}><Plus className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }
  if (field.kind === "toggle") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        {field.label}
      </label>
    );
  }
  if (field.kind === "choice") {
    return (
      <div>
        <p className="mb-1 text-sm font-semibold">{field.label}</p>
        <div className="flex flex-wrap gap-2">
          {field.options.map((option) => (
            <button key={option} type="button" aria-pressed={value === option} className={cn("rounded-full px-3 py-2 text-sm", value === option ? "bg-teal text-white" : "bg-sky")} onClick={() => onChange(option)}>{option}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{field.label}</label>
      <Textarea value={String(value ?? "")} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
