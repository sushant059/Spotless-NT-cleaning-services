"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Check, Plus, Search, UserPlus, Users } from "lucide-react";
import { Sheet } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { quickJobAction } from "@/lib/actions";
import { TIME_WINDOWS } from "@/lib/constants";
import type { Customer, Job, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ServiceOption = Pick<Service, "slug" | "title" | "category">;

const blankPerson = { name: "", phone: "", email: "", address: "", suburb: "", companyName: "" };

/**
 * "+ Add job": pick an existing customer (search by name, phone or suburb) or type a new one,
 * tick the services, choose the day, time and price. Saved straight to the jobs list.
 */
export function AddJobButton({ customers, services, customerId = "", label = "Add job", size = "md", variant = "accent", className }: { customers: Customer[]; services: ServiceOption[]; customerId?: string; label?: string; size?: "sm" | "md"; variant?: "accent" | "outline" | "navy"; className?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<"existing" | "new">(customerId || customers.length ? "existing" : "new");
  const [picked, setPicked] = useState(customerId);
  const [query, setQuery] = useState("");
  const [person, setPerson] = useState(blankPerson);
  const [chosen, setChosen] = useState<string[]>([]);
  const [extra, setExtra] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Job["status"]>("scheduled");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((customer) => !q || `${customer.name} ${customer.companyName} ${customer.phone} ${customer.suburb} ${customer.address}`.toLowerCase().includes(q)).slice(0, 8);
  }, [customers, query]);
  const selected = customers.find((customer) => customer.id === picked);

  function reset() {
    setPicked(customerId);
    setQuery("");
    setPerson(blankPerson);
    setChosen([]);
    setExtra("");
    setDate("");
    setTime("");
    setPrice("");
    setNotes("");
    setStatus("scheduled");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const titles = services.filter((service) => chosen.includes(service.slug)).map((service) => service.title);
    const description = [titles.join(", "), extra.trim()].filter(Boolean).join(" – ");
    if (!description) {
      toast("Tick a service or describe the job.", "error");
      return;
    }
    start(async () => {
      const result = await quickJobAction({
        customerId: mode === "existing" ? picked : "",
        newCustomer: mode === "new" ? person : undefined,
        services: description,
        address: mode === "existing" ? selected?.address || selected?.suburb || "" : [person.address, person.suburb].filter(Boolean).join(", "),
        scheduledDate: date,
        timeWindow: time,
        price,
        notes,
        status,
      });
      toast(result.ok ? result.message || "Job added" : result.error, result.ok ? "ok" : "error");
      if (result.ok) {
        setOpen(false);
        reset();
        router.refresh();
      }
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Add a job"
      description="For an existing customer or a new one."
      trigger={<Button type="button" size={size} variant={variant} className={cn("whitespace-nowrap", className)}><Plus className="h-4 w-4" aria-hidden /> {label}</Button>}
    >
      <form className="grid gap-5" onSubmit={submit}>
        {/* 1. Customer */}
        {!customerId && (
          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-slate">1 · Customer</legend>
            <div className="grid grid-cols-2 gap-2 rounded-full bg-mist p-1">
              <button type="button" onClick={() => setMode("existing")} className={cn("flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold", mode === "existing" ? "bg-white text-navy shadow-card" : "text-slate")}><Users className="h-4 w-4" aria-hidden /> Existing</button>
              <button type="button" onClick={() => setMode("new")} className={cn("flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold", mode === "new" ? "bg-white text-navy shadow-card" : "text-slate")}><UserPlus className="h-4 w-4" aria-hidden /> New customer</button>
            </div>
            {mode === "existing" ? (
              <div className="grid gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone or suburb" aria-label="Search customers" className="pl-10" />
                </div>
                <ul className="grid max-h-56 gap-1 overflow-y-auto rounded-2xl border border-line p-1">
                  {matches.map((customer) => (
                    <li key={customer.id}>
                      <button type="button" onClick={() => setPicked(customer.id)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left", picked === customer.id ? "bg-brand-light" : "hover:bg-mist")}>
                        <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2", picked === customer.id ? "border-brand bg-brand text-white" : "border-line")}>{picked === customer.id && <Check className="h-3.5 w-3.5" aria-hidden />}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-navy">{customer.companyName || customer.name}</span>
                          <span className="block truncate text-xs text-slate">{[customer.phone, customer.suburb || customer.address].filter(Boolean).join(" · ")}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                  {matches.length === 0 && <li className="p-3 text-sm text-slate">No match. Switch to “New customer”.</li>}
                </ul>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-navy">Name *<Input className="mt-1 font-normal" required value={person.name} onChange={(event) => setPerson({ ...person, name: event.target.value })} autoComplete="off" /></label>
                <label className="text-sm font-semibold text-navy">Phone<Input className="mt-1 font-normal" inputMode="tel" value={person.phone} onChange={(event) => setPerson({ ...person, phone: event.target.value })} placeholder="04xx xxx xxx" /></label>
                <label className="text-sm font-semibold text-navy">Email<Input className="mt-1 font-normal" type="email" value={person.email} onChange={(event) => setPerson({ ...person, email: event.target.value })} /></label>
                <label className="text-sm font-semibold text-navy">Company (optional)<Input className="mt-1 font-normal" value={person.companyName} onChange={(event) => setPerson({ ...person, companyName: event.target.value })} /></label>
                <label className="text-sm font-semibold text-navy">Street address<Input className="mt-1 font-normal" value={person.address} onChange={(event) => setPerson({ ...person, address: event.target.value })} /></label>
                <label className="text-sm font-semibold text-navy">Suburb<Input className="mt-1 font-normal" value={person.suburb} onChange={(event) => setPerson({ ...person, suburb: event.target.value })} /></label>
              </div>
            )}
          </fieldset>
        )}

        {/* 2. Services */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-slate">{customerId ? "1" : "2"} · What needs cleaning</legend>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => {
              const on = chosen.includes(service.slug);
              return (
                <button key={service.slug} type="button" aria-pressed={on} onClick={() => setChosen((list) => (on ? list.filter((item) => item !== service.slug) : [...list, service.slug]))} className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition active:scale-95", on ? "bg-leaf-dark text-white" : "bg-mist text-navy ring-1 ring-line")}>
                  {on && <Check className="h-4 w-4" aria-hidden />} {service.title}
                </button>
              );
            })}
          </div>
          <Input className="mt-3" value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="Details, e.g. 3 bedrooms + hallway, 2-seater lounge" aria-label="Job details" />
        </fieldset>

        {/* 3. When & price */}
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-slate">{customerId ? "2" : "3"} · When & price</legend>
          <label className="text-sm font-semibold text-navy">Date<Input className="mt-1 font-normal" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="text-sm font-semibold text-navy">Time
            <Select className="mt-1 font-normal" value={time} onChange={(event) => setTime(event.target.value)}>
              <option value="">Not set yet</option>
              {TIME_WINDOWS.map((window) => <option key={window.id} value={window.id}>{window.label}</option>)}
            </Select>
          </label>
          <label className="text-sm font-semibold text-navy">Price<Input className="mt-1 font-normal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="$180" /></label>
          <label className="text-sm font-semibold text-navy">Status
            <Select className="mt-1 font-normal" value={status} onChange={(event) => setStatus(event.target.value as Job["status"])}>
              <option value="scheduled">Scheduled (confirmed)</option>
              <option value="requested">New request (not confirmed)</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </label>
          <div className="sm:col-span-2">
            <Label htmlFor="quick-job-notes">Notes for the crew</Label>
            <Textarea id="quick-job-notes" className="min-h-20" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gate code, parking, pets, stains to focus on…" />
          </div>
        </fieldset>

        <Button type="submit" size="md" disabled={pending || (mode === "existing" && !customerId && !picked)}>{pending ? "Saving…" : "Save job"}</Button>
      </form>
    </Sheet>
  );
}
