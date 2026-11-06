"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitQuote, checkPromoAction } from "@/lib/actions";
import { quoteSchema, type QuoteInput } from "@/lib/validators";
import { ServiceDetails } from "@/components/forms/service-details";
import { ServiceIcon } from "@/components/icons";
import { defaultDetails, validateDetails } from "@/lib/constants";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/fields";
import type { Service, Settings } from "@/lib/types";
import { cn, waLink } from "@/lib/utils";

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

export function QuoteForm({ services, areas, settings, initialService = "" }: { services: Service[]; areas: string[]; settings: Settings; initialService?: string }) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [result, setResult] = useState<{ reference: string; name: string } | null>(null);
  const form = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { services: initialService && initialService !== "not-sure" ? [initialService] : [], details: initialService ? defaultDetails([initialService]) : {}, suburb: "", name: "", phone: "", email: "", notes: "", promo: "", company_website: "" },
  });

  const chosen = form.watch("services");
  const details = form.watch("details");
  function toggle(slug: string) {
    const next = chosen.includes(slug) ? chosen.filter((item) => item !== slug) : [...chosen, slug];
    form.setValue("services", next, { shouldValidate: form.formState.isSubmitted });
    form.setValue("details", { ...defaultDetails(next), ...form.getValues("details") });
  }

  async function onSubmit(values: QuoteInput) {
    const problem = validateDetails(values.services, values.details);
    if (problem) return form.setError("root", { message: problem });
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.set(key, typeof value === "object" ? JSON.stringify(value) : String(value ?? "")));
    photos.forEach((photo) => data.append("photos", photo));
    const response = await submitQuote(data);
    if (!response.ok) {
      if (response.fields) {
        Object.entries(response.fields).forEach(([key, message]) => form.setError(key as keyof QuoteInput, { message }));
      }
      form.setError("root", { message: response.error });
      return;
    }
    setResult({ reference: response.reference || "", name: values.name });
    setPromoMessage(response.message || "");
  }

  if (result) {
    return (
      <div className="rounded-card bg-white p-6 shadow-card" role="status">
        <h2 className="text-2xl font-bold">Thanks {result.name}</h2>
        <p className="mt-2 text-slate">We saved your quote request. Your reference is <strong className="text-ink">{result.reference}</strong>.</p>
        {promoMessage && <p className="mt-2 text-brand">{promoMessage}</p>}
        <p className="mt-2 text-slate">{"We'll call to confirm a fixed price. This is not a confirmed booking yet."}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(result.reference)}>Copy reference</Button>
          <a className="inline-flex min-h-12 items-center justify-center rounded-full bg-whatsapp px-6 font-semibold text-white" href={waLink(settings.phoneTel, `Hi Territory Spotless, my quote reference is ${result.reference}.`)}>WhatsApp</a>
          <a className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand px-6 font-semibold text-brand" href={`tel:${settings.phoneTel}`}>Call</a>
        </div>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="h-0 overflow-hidden" aria-hidden>
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" tabIndex={-1} autoComplete="off" {...form.register("company_website")} />
      </div>
      <div>
        <p className="text-[15px] font-bold text-navy">1. What would you like cleaned?</p>
        <p className="text-sm text-slate">Choose one or more. We’ll ask a few questions for each.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {services.filter((service) => service.visible).map((service) => {
            const on = chosen.includes(service.slug);
            return (
              <button key={service.id} type="button" aria-pressed={on} onClick={() => toggle(service.slug)} className={cn("flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 text-left font-semibold transition", on ? "border-brand bg-brand-light text-navy ring-2 ring-brand/20" : "border-line bg-white text-navy hover:border-brand")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", on ? "bg-brand text-white" : "bg-mist text-brand")}>{on ? <Check className="h-5 w-5" aria-hidden /> : <ServiceIcon name={service.icon} className="h-5 w-5" />}</span>
                <span className="leading-tight">{service.title}</span>
              </button>
            );
          })}
        </div>
        <FieldError message={form.formState.errors.services?.message} />
      </div>
      {chosen.length > 0 && (
        <div>
          <p className="text-[15px] font-bold text-navy">2. Tell us about the job</p>
          <div className="mt-3"><ServiceDetails services={chosen} details={details} onChange={(key, value) => form.setValue("details", { ...form.getValues("details"), [key]: value })} /></div>
        </div>
      )}
      <p className="pt-2 text-[15px] font-bold text-navy">{chosen.length ? "3." : "2."} Your details</p>
      <div>
        <Label htmlFor="suburb">Suburb</Label>
        <Input id="suburb" list="suburbs" {...form.register("suburb")} />
        <datalist id="suburbs">{areas.map((area) => <option key={area} value={area} />)}</datalist>
        <FieldError message={form.formState.errors.suburb?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" autoComplete="tel" inputMode="tel" placeholder="0401 647 545" {...form.register("phone")} />
          <FieldError message={form.formState.errors.phone?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" {...form.register("notes")} />
      </div>
      <div>
        <Label htmlFor="photos">Photos (optional, up to 5)</Label>
        <Input id="photos" type="file" accept="image/*" multiple onChange={async (event) => {
          const files = Array.from(event.target.files || []).slice(0, 5);
          if ((event.target.files?.length || 0) > 5) setPhotoError("Only the first 5 photos will be sent.");
          else setPhotoError("");
          setPhotos(await Promise.all(files.map(compressImage)));
        }} />
        <FieldError message={photoError} />
      </div>
      <div>
        <Label htmlFor="promo">Promo code (optional)</Label>
        <div className="flex gap-2">
          <Input id="promo" {...form.register("promo")} />
          <Button type="button" variant="outline" size="sm" onClick={async () => {
            const result = await checkPromoAction(form.getValues("promo"));
            setPromoMessage(result.message);
          }}>Check</Button>
        </div>
        {promoMessage && <p className="mt-1 text-sm text-brand">{promoMessage}</p>}
      </div>
      {form.formState.errors.root?.message && <p className="text-sm font-medium text-danger" role="alert">{form.formState.errors.root.message}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Request my quote"}</Button>
    </form>
  );
}
