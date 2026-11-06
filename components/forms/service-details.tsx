"use client";

import { Check, Minus, Plus } from "lucide-react";
import { Label, Textarea } from "@/components/ui/fields";
import { SERVICE_FIELDS, SERVICE_TITLES, fieldQuestion } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Detail = string | number | boolean;

/** One card per chosen service, each asking that service's questions in order. Used by the booking and quote forms. */
export function ServiceDetails({ services, details, onChange }: { services: string[]; details: Record<string, Detail>; onChange: (key: string, value: Detail) => void }) {
  return (
    <div className="space-y-5">
      {services.map((slug, index) => (
        <fieldset key={slug} className="rounded-[22px] border border-line bg-white p-4 shadow-card sm:p-6">
          <legend className="flex items-center gap-2 rounded-full bg-navy px-3.5 py-1.5 text-sm font-bold text-white">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs">{index + 1}</span>
            {SERVICE_TITLES[slug] || slug}
          </legend>
          <div className="mt-2 divide-y divide-line">
            {(SERVICE_FIELDS[slug] ?? []).map((field) => {
              const value = details[field.key];
              const question = <p className="text-[15px] font-semibold text-navy">{fieldQuestion(field)}</p>;
              if (field.kind === "stepper") {
                const current = Number(value ?? field.defaultValue);
                return (
                  <div key={field.key} className="flex flex-col gap-2.5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {question}
                    <span className="flex shrink-0 items-center gap-2.5 self-end sm:self-auto">
                      <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-brand-light text-brand transition hover:bg-brand hover:text-white disabled:opacity-40" aria-label={`Fewer: ${field.label}`} disabled={current <= field.min} onClick={() => onChange(field.key, Math.max(field.min, current - 1))}><Minus className="h-4 w-4" /></button>
                      <strong className="w-6 text-center text-lg text-navy">{current}</strong>
                      <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-brand-light text-brand transition hover:bg-brand hover:text-white disabled:opacity-40" aria-label={`More: ${field.label}`} disabled={current >= field.max} onClick={() => onChange(field.key, Math.min(field.max, current + 1))}><Plus className="h-4 w-4" /></button>
                    </span>
                  </div>
                );
              }
              if (field.kind === "toggle") {
                return (
                  <div key={field.key} className="flex items-center justify-between gap-4 py-3.5">
                    {question}
                    <span className="flex shrink-0 gap-2">
                      {[true, false].map((option) => <Pill key={String(option)} on={value === option} onClick={() => onChange(field.key, option)}>{option ? "Yes" : "No"}</Pill>)}
                    </span>
                  </div>
                );
              }
              if (field.kind === "choice" || field.kind === "multi") {
                const list = field.kind === "multi" ? String(value || "").split(", ").filter((item) => item && item !== "None") : [];
                return (
                  <div key={field.key} className="py-3.5">
                    {question}
                    {field.kind === "multi" && <p className="text-sm text-slate">Tap all that apply</p>}
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {field.options.map((option) => {
                        const on = field.kind === "multi" ? list.includes(option) : value === option;
                        const next = field.kind === "multi" ? (on ? list.filter((item) => item !== option) : [...list, option]).join(", ") : option;
                        return <Pill key={option} on={on} onClick={() => onChange(field.key, next)}>{option}</Pill>;
                      })}
                    </div>
                  </div>
                );
              }
              return (
                <div key={field.key} className="py-3.5">
                  <Label>{fieldQuestion(field)}</Label>
                  <Textarea value={String(value ?? "")} placeholder={field.placeholder} onChange={(event) => onChange(field.key, event.target.value)} />
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition", on ? "border-brand bg-brand text-white" : "border-line bg-white text-navy hover:border-brand")}>
      {on && <Check className="h-4 w-4" aria-hidden />}{children}
    </button>
  );
}
