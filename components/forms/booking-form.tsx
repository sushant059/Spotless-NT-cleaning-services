"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { availabilityAction, checkPromoAction, submitBooking } from "@/lib/actions";
import { SERVICE_FIELDS, SERVICE_TITLES, TIME_WINDOWS, defaultDetails, summariseJob, timeWindowLabel, validateDetails } from "@/lib/constants";
import { bookingSchema, type BookingInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/fields";
import type { BlockedDate, Service, Settings } from "@/lib/types";
import { cn, darwinISODate, waLink } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

const STEPS = ["Services", "Details", "Date", "Address", "Contact", "Review"];

export function BookingForm({ services, areas, blocked, settings, initialService = "" }: { services: Service[]; areas: string[]; blocked: BlockedDate[]; settings: Settings; initialService?: string }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const visible = services.filter((service) => service.visible);
  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      services: initialService ? [initialService] : [],
      details: initialService ? defaultDetails([initialService]) : {},
      date: "",
      timeWindow: "",
      address: "",
      suburb: "",
      name: "",
      phone: "",
      email: "",
      notes: "",
      promo: "",
      company_website: "",
    },
  });
  const [promoStatus, setPromoStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [confirmedPromo, setConfirmedPromo] = useState("");
  const [availability, setAvailability] = useState<{ date: string; blocked: boolean; full: string[]; allFull: boolean } | null>(null);
  const selectedDate = form.watch("date");

  // Look up which time slots are already taken whenever the date changes.
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate || "")) return setAvailability(null);
    let cancelled = false;
    availabilityAction(selectedDate).then((result) => {
      if (cancelled) return;
      setAvailability({ date: selectedDate, ...result });
      if (result.full.includes(form.getValues("timeWindow"))) form.setValue("timeWindow", "");
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, form]);

  async function checkPromo() {
    const code = form.getValues("promo").trim();
    if (!code) return setPromoStatus(null);
    setCheckingPromo(true);
    const result = await checkPromoAction(code);
    setCheckingPromo(false);
    setPromoStatus({ ok: result.ok, message: result.message });
  }
  const values = form.watch();
  const summary = useMemo(() => summariseJob(values.services, values.details), [values.services, values.details]);
  const today = darwinISODate();

  function toggleService(slug: string) {
    const current = form.getValues("services");
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    form.setValue("services", next);
    form.setValue("details", { ...defaultDetails(next), ...form.getValues("details") });
  }

  function setDetail(key: string, value: string | number | boolean) {
    form.setValue("details", { ...form.getValues("details"), [key]: value });
  }

  function continueStep() {
    setError("");
    if (step === 0 && values.services.length === 0) return setError("Choose at least one service.");
    if (step === 1) {
      const message = validateDetails(values.services, values.details);
      if (message) return setError(message);
    }
    if (step === 2) {
      if (!values.date || values.date < today) return setError("Choose today or a later date.");
      if (blocked.some((item) => item.date === values.date) || (availability?.date === values.date && availability.blocked)) return setError("That date is unavailable. Please choose another day.");
      if (availability?.date === values.date && availability.allFull) return setError("That day is fully booked. Please choose another day.");
      if (!values.timeWindow) return setError("Choose a time window.");
      if (availability?.date === values.date && availability.full.includes(values.timeWindow)) return setError("That time is already booked. Please choose another time.");
    }
    if (step === 3 && (values.address.trim().length < 5 || values.suburb.trim().length < 2)) return setError("Enter the street address and suburb.");
    if (step === 4) {
      form.trigger(["name", "phone", "email"]).then(async (valid) => {
        if (!valid) return;
        // Check a typed promo code before the review step, so the customer knows if it's valid.
        if (form.getValues("promo").trim() && !promoStatus) await checkPromo();
        setStep(5);
      });
      return;
    }
    setStep((current) => Math.min(5, current + 1));
  }

  async function onSubmit(data: BookingInput) {
    const result = await submitBooking(data);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirmedPromo(result.message || "");
    setReference(result.reference || "");
  }

  if (reference) {
    return (
      <div className="rounded-card bg-white p-6 shadow-card" role="status">
        <h2 className="text-3xl font-bold">Request received</h2>
        <p className="mt-3">Thanks {values.name}. Your reference is <strong>{reference}</strong>.</p>
        {confirmedPromo && <p className="mt-2 rounded-2xl bg-leaf-soft p-3 font-semibold text-leaf-dark">✅ Promo code applied: {confirmedPromo}</p>}
        <p className="mt-2 text-slate">{"We'll call to confirm the time and the fixed price. The clean is not locked in until we speak with you."}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(reference)}>Copy reference</Button>
          <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-whatsapp px-6 font-semibold text-white" href={waLink(settings.phoneTel, `Hi Territory Spotless, my booking reference is ${reference}.`)}>WhatsApp</a>
          <a className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand px-6 font-semibold text-brand" href={`tel:${settings.phoneTel}`}>Call</a>
        </div>
      </div>
    );
  }

  return (
    <form className="rounded-card bg-white p-4 shadow-card sm:p-5 md:p-8" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {/* Phones: "Step 2 of 6" and a progress bar. Larger screens: every step as a pill. */}
      <div className="mb-6 sm:hidden" aria-hidden>
        <p className="flex items-baseline justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span className="font-display text-lg normal-case tracking-normal text-navy">{STEPS[step]}</span>
        </p>
        <div className="mt-2 grid grid-cols-6 gap-1">
          {STEPS.map((label, index) => <span key={label} className={cn("h-1.5 rounded-full transition-colors", index < step ? "bg-leaf" : index === step ? "bg-brand" : "bg-brand-light")} />)}
        </div>
      </div>
      <ol className="mb-6 hidden flex-wrap gap-2 sm:flex" aria-label="Booking progress">
        {STEPS.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined} className={cn("rounded-full px-3 py-1 text-sm font-semibold", index === step ? "bg-brand text-white" : index < step ? "bg-leaf text-ink" : "bg-brand-light text-slate")}>{index + 1}. {label}</li>
        ))}
      </ol>
      <div className="h-0 overflow-hidden" aria-hidden>
        <label htmlFor="booking-company">Company website</label>
        <input id="booking-company" tabIndex={-1} autoComplete="off" {...form.register("company_website")} />
      </div>
      {step === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((service) => {
            const selected = values.services.includes(service.slug);
            return <button type="button" key={service.id} aria-pressed={selected} onClick={() => toggleService(service.slug)} className={cn("rounded-card border p-4 text-left", selected ? "border-brand bg-brand-light" : "border-line")}><span className="font-bold">{service.title}</span><span className="mt-1 block text-sm text-slate">{service.summary}</span></button>;
          })}
        </div>
      )}
      {step === 1 && (
        <div className="space-y-5">
          {values.services.map((slug) => (
            <fieldset key={slug} className="rounded-2xl border border-line p-4">
              <legend className="px-1 font-bold">{SERVICE_TITLES[slug] || slug}</legend>
              <div className="space-y-3">
                {(SERVICE_FIELDS[slug] ?? []).map((field) => {
                  const value = values.details[field.key];
                  if (field.kind === "stepper") {
                    const current = Number(value ?? field.defaultValue);
                    return <div key={field.key} className="flex items-center justify-between"><span>{field.label}</span><span className="flex items-center gap-2"><button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-brand-light" aria-label={`Fewer ${field.label}`} onClick={() => setDetail(field.key, Math.max(field.min, current - 1))}><Minus className="h-4 w-4" /></button><strong>{current}</strong><button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-brand-light" aria-label={`More ${field.label}`} onClick={() => setDetail(field.key, Math.min(field.max, current + 1))}><Plus className="h-4 w-4" /></button></span></div>;
                  }
                  if (field.kind === "toggle") return <label key={field.key} className="flex gap-2"><input type="checkbox" checked={Boolean(value)} onChange={(event) => setDetail(field.key, event.target.checked)} />{field.label}</label>;
                  if (field.kind === "choice") return <div key={field.key}><p className="mb-2 font-semibold">{field.label}</p><div className="flex flex-wrap gap-2">{field.options.map((option) => <button type="button" key={option} aria-pressed={value === option} className={cn("rounded-full px-3 py-2 text-sm font-semibold", value === option ? "bg-brand text-white" : "bg-brand-light")} onClick={() => setDetail(field.key, option)}>{option}</button>)}</div></div>;
                  return <div key={field.key}><Label>{field.label}</Label><Textarea value={String(value ?? "")} placeholder={field.placeholder} onChange={(event) => setDetail(field.key, event.target.value)} /></div>;
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="grid gap-4">
          <div>
            <Label htmlFor="date">Preferred date</Label>
            <Input id="date" type="date" min={today} {...form.register("date")} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Time window</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIME_WINDOWS.map((window) => {
                const taken = availability?.date === values.date && (availability.full.includes(window.id) || availability.blocked);
                return (
                  <button
                    type="button"
                    key={window.id}
                    disabled={taken}
                    aria-pressed={values.timeWindow === window.id}
                    className={cn("min-h-12 rounded-full px-4 font-semibold", taken ? "cursor-not-allowed bg-mist text-slate/60 line-through" : values.timeWindow === window.id ? "bg-brand text-white" : "bg-brand-light")}
                    onClick={() => form.setValue("timeWindow", window.id)}
                  >
                    {window.label}{taken && <span className="ml-2 text-xs font-bold uppercase no-underline">Booked</span>}
                  </button>
                );
              })}
            </div>
            {availability?.date === values.date && availability.blocked && <p className="mt-2 text-sm font-semibold text-danger">We’re not available on this day. Please choose another date.</p>}
            {availability?.date === values.date && !availability.blocked && availability.allFull && <p className="mt-2 text-sm font-semibold text-danger">This day is fully booked. Please choose another date.</p>}
          </div>
          {blocked.length > 0 && <p className="text-sm text-slate">Unavailable: {blocked.map((item) => item.date).join(", ")}.</p>}
        </div>
      )}
      {step === 3 && (
        <div className="grid gap-4">
          <div><Label htmlFor="address">Street address</Label><Input id="address" autoComplete="street-address" {...form.register("address")} /></div>
          <div><Label htmlFor="booking-suburb">Suburb</Label><Input id="booking-suburb" list="booking-suburbs" {...form.register("suburb")} /><datalist id="booking-suburbs">{areas.map((area) => <option key={area} value={area} />)}</datalist></div>
        </div>
      )}
      {step === 4 && (
        <div className="grid gap-4">
          <div><Label htmlFor="booking-name">Name</Label><Input id="booking-name" autoComplete="name" {...form.register("name")} /><FieldError message={form.formState.errors.name?.message} /></div>
          <div><Label htmlFor="booking-phone">Phone</Label><Input id="booking-phone" autoComplete="tel" {...form.register("phone")} /><FieldError message={form.formState.errors.phone?.message} /></div>
          <div><Label htmlFor="booking-email">Email</Label><Input id="booking-email" type="email" autoComplete="email" {...form.register("email")} /><FieldError message={form.formState.errors.email?.message} /></div>
          <div><Label htmlFor="booking-notes">Access notes (optional)</Label><Textarea id="booking-notes" {...form.register("notes")} /></div>
          <div>
            <Label htmlFor="booking-promo">Promo code (optional)</Label>
            <div className="flex gap-2">
              <Input id="booking-promo" autoComplete="off" className="uppercase" {...form.register("promo", { onChange: () => setPromoStatus(null) })} />
              <Button type="button" variant="outline" size="sm" className="shrink-0" disabled={checkingPromo} onClick={checkPromo}>{checkingPromo ? "Checking…" : "Check"}</Button>
            </div>
            {promoStatus?.message && <p className={cn("mt-2 text-sm font-semibold", promoStatus.ok ? "text-leaf-dark" : "text-danger")} role="status">{promoStatus.ok ? "✅ " : ""}{promoStatus.message}</p>}
          </div>
        </div>
      )}
      {step === 5 && (
        <div className="space-y-3 text-sm">
          <p><strong>Services. </strong>{summary.join("; ")}</p>
          <p><strong>When. </strong>{values.date} · {timeWindowLabel(values.timeWindow)}</p>
          <p><strong>Where. </strong>{values.address}, {values.suburb}</p>
          <p><strong>Contact. </strong>{values.name}, {values.phone}, {values.email}</p>
          {values.notes && <p><strong>Notes. </strong>{values.notes}</p>}
          {values.promo.trim() && (
            <p><strong>Promo code. </strong>{values.promo.trim().toUpperCase()}{" "}
              {promoStatus && <span className={promoStatus.ok ? "font-semibold text-leaf-dark" : "font-semibold text-danger"}>({promoStatus.ok ? promoStatus.message : `${promoStatus.message} It won’t be applied.`})</span>}
            </p>
          )}
          <p className="text-slate">{"We'll call to confirm. Sending this request does not lock the time until we say so."}</p>
        </div>
      )}
      {error && <p className="mt-4 text-sm font-medium text-danger" role="alert">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 && <Button type="button" variant="ghost" onClick={() => { setError(""); setStep((current) => current - 1); }}>Back</Button>}
        {step < 5 && <Button type="button" onClick={continueStep}>Continue</Button>}
        {step === 5 && <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Send booking request"}</Button>}
      </div>
    </form>
  );
}
