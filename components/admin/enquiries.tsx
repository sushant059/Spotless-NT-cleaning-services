"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState, useTransition } from "react";
import { CalendarPlus, ChevronDown, FileText, Mail, MessageCircle, Phone, Search, Trash2, UserPlus, UserRoundCheck } from "lucide-react";
import { StatusBadge } from "@/components/admin/customers";
import { CategoryBadges, FilterChips, IconLink, Sheet } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { confirmEnquiryJobAction, deleteBookingAction, deleteLeadAction, enquiryCustomerAction, updateBookingAction, updateLeadAction } from "@/lib/actions";
import { STATUS_OPTIONS, TIME_WINDOWS, timeWindowLabel } from "@/lib/constants";
import type { Job, LeadStatus, ServiceCategory } from "@/lib/types";
import { cn, formatDisplayDate, formatDisplayDateTime, waLink } from "@/lib/utils";

export type EnquiryRow = {
  kind: "lead" | "booking";
  id: string;
  reference: string;
  createdAt: string;
  source: string;
  name: string;
  phone: string;
  email: string;
  suburb: string;
  address: string;
  summary: string;
  message: string;
  wanted: string;
  date: string;
  timeWindow: string;
  status: LeadStatus;
  categories: ServiceCategory[];
  internalNotes: string;
  promo: string;
  job: Pick<Job, "id" | "reference" | "status" | "customerId"> | null;
};

const STATUS_TONE: Record<string, string> = {
  new: "bg-sun-soft text-[#8A5A00]",
  contacted: "bg-brand-light text-brand",
  quoted: "bg-[#F1E8FF] text-[#6B2FB3]",
  booked: "bg-leaf-soft text-leaf-dark",
  completed: "bg-mist text-navy",
  lost: "bg-red-50 text-danger",
};

export function EnquiriesTable({ rows, categories }: { rows: EnquiryRow[]; categories: { id: ServiceCategory; label: string }[] }) {
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("open");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const labels = Object.fromEntries(categories.map((item) => [item.id, item.label]));

  const inStatus = (row: EnquiryRow, value: string) => value === "all" || (value === "open" ? ["new", "contacted", "quoted"].includes(row.status) : row.status === value);
  const inCategory = (row: EnquiryRow, value: string) => value === "all" || (value === "other" ? row.categories.length === 0 : row.categories.includes(value as ServiceCategory));
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => inStatus(row, status) && inCategory(row, category) && (!q || `${row.name} ${row.phone} ${row.email} ${row.suburb} ${row.reference} ${row.summary}`.toLowerCase().includes(q)));
  }, [rows, status, category, query]);

  const categoryOptions = [
    { id: "all", label: "All services", count: rows.filter((row) => inStatus(row, status)).length },
    ...categories.map((item) => ({ id: item.id, label: item.label, count: rows.filter((row) => inStatus(row, status) && row.categories.includes(item.id)).length })),
    { id: "other", label: "Other", count: rows.filter((row) => inStatus(row, status) && row.categories.length === 0).length },
  ];
  const statusOptions = [
    { id: "open", label: "Needs action", count: rows.filter((row) => inStatus(row, "open")).length, tone: "bg-sun-soft text-[#8A5A00]" },
    ...STATUS_OPTIONS.map((item) => ({ id: item, label: item[0].toUpperCase() + item.slice(1), count: rows.filter((row) => row.status === item).length })),
    { id: "all", label: "Everything", count: rows.length },
  ];

  return (
    <div className="space-y-4">
      <FilterChips label="Status" value={status} onChange={setStatus} options={statusOptions} />
      <FilterChips label="Service category" value={category} onChange={setCategory} options={categoryOptions} />
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, suburb or reference" aria-label="Search enquiries" className="pl-10" />
      </div>

      {filtered.length === 0 && <p className="rounded-card bg-white p-6 text-slate shadow-card">Nothing here. New enquiries from the website, chat and booking form land in this list.</p>}

      {/* Desktop & tablet: a table */}
      {filtered.length > 0 && (
        <div className="hidden overflow-hidden rounded-card bg-white shadow-card md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs font-bold uppercase tracking-wider text-slate">
              <tr>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Wanted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((row) => (
                <Fragment key={row.id}>
                  <tr className={cn("align-top transition hover:bg-mist/60", open === row.id && "bg-mist/60")}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{formatDisplayDateTime(row.createdAt)}</p>
                      <p className="text-xs text-slate">{row.reference} · {row.source}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{row.name || "No name"}</p>
                      <p className="text-xs text-slate">{[row.phone, row.suburb].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      <CategoryBadges ids={row.categories} labels={labels} />
                      <p className="mt-1 line-clamp-2 text-xs text-slate">{row.summary}</p>
                    </td>
                    <td className="px-4 py-3 text-navy">{row.wanted || <span className="text-slate">—</span>}</td>
                    <td className="px-4 py-3"><StatusSelect row={row} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <RowActions row={row} />
                        <button type="button" onClick={() => setOpen(open === row.id ? null : row.id)} aria-expanded={open === row.id} aria-label="Show details" className="grid h-9 w-9 place-items-center rounded-full bg-mist text-navy hover:bg-brand-light"><ChevronDown className={cn("h-4 w-4 transition", open === row.id && "rotate-180")} aria-hidden /></button>
                      </div>
                    </td>
                  </tr>
                  {open === row.id && (
                    <tr className="bg-mist/60">
                      <td colSpan={6} className="px-4 pb-4"><Details row={row} /></td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Phones: cards */}
      <ul className="grid gap-3 md:hidden">
        {filtered.map((row) => (
          <li key={row.id} className="rounded-card bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-navy">{row.name || "No name"}</p>
                <p className="text-xs text-slate">{formatDisplayDateTime(row.createdAt)} · {row.source}</p>
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize", STATUS_TONE[row.status])}>{row.status}</span>
            </div>
            <div className="mt-2"><CategoryBadges ids={row.categories} labels={labels} /></div>
            <p className="mt-2 line-clamp-3 text-sm text-ink">{row.summary}</p>
            {row.wanted && <p className="mt-1 text-sm font-semibold text-navy">Wanted: {row.wanted}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2"><RowActions row={row} wide /></div>
            <button type="button" onClick={() => setOpen(open === row.id ? null : row.id)} className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand">{open === row.id ? "Hide" : "More"} details <ChevronDown className={cn("h-4 w-4 transition", open === row.id && "rotate-180")} aria-hidden /></button>
            {open === row.id && <div className="mt-2"><Details row={row} /></div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusSelect({ row }: { row: EnquiryRow }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <select
      aria-label={`Status for ${row.reference}`}
      value={row.status}
      disabled={pending}
      className={cn("min-h-9 rounded-full border-0 px-3 text-xs font-bold capitalize", STATUS_TONE[row.status])}
      onChange={(event) => start(async () => {
        const patch = { status: event.target.value as LeadStatus };
        const result = row.kind === "lead" ? await updateLeadAction(row.id, patch) : await updateBookingAction(row.id, patch);
        toast(result.ok ? "Status updated" : result.error, result.ok ? "ok" : "error");
        router.refresh();
      })}
    >
      {STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
  );
}

/** Add as customer · Add job · call · WhatsApp. Once the job is booked, the buttons become links to it. */
/** Add as customer, book the job, call or WhatsApp: the same buttons as the enquiries table. */
export function EnquiryActions({ row }: { row: EnquiryRow }) {
  return <RowActions row={row} wide />;
}

function RowActions({ row, wide = false }: { row: EnquiryRow; wide?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const booked = row.job && row.job.status !== "requested";
  return (
    <>
      {row.job ? (
        <Link href={`/admin/customers/${row.job.customerId}`} className={cn("inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-leaf-soft px-3 text-xs font-bold text-leaf-dark hover:bg-leaf hover:text-white", wide && "min-h-10 text-sm")}>
          <UserRoundCheck className="h-4 w-4" aria-hidden /> Customer
        </Link>
      ) : (
        <button type="button" disabled={pending} onClick={() => start(async () => {
          const result = await enquiryCustomerAction(row.kind, row.id);
          toast(result.ok ? "Customer added" : result.error, result.ok ? "ok" : "error");
          if (result.ok && result.id) router.push(`/admin/customers/${result.id}`);
        })} className={cn("inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-light px-3 text-xs font-bold text-brand hover:bg-brand hover:text-white", wide && "min-h-10 text-sm")}>
          <UserPlus className="h-4 w-4" aria-hidden /> Add as customer
        </button>
      )}
      {booked && row.job ? (
        <Link href={`/admin/customers/${row.job.customerId}`} className={cn("inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-mist px-3 text-xs font-bold text-navy hover:bg-brand-light", wide && "min-h-10 text-sm")}>
          {row.job.reference} <StatusBadge status={row.job.status} />
        </Link>
      ) : (
        <BookJobButton row={row} wide={wide} />
      )}
      <Link href={row.job ? `/admin/quotes/new?job=${row.job.id}` : `/admin/quotes/new?${row.kind}=${row.id}`} className={cn("inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-light px-3 text-xs font-bold text-brand hover:bg-brand hover:text-white", wide && "min-h-10 text-sm")}><FileText className="h-4 w-4" aria-hidden /> Quote</Link>
      {row.phone && <IconLink href={`tel:${row.phone}`} label={`Call ${row.name}`}><Phone className="h-4 w-4" aria-hidden /></IconLink>}
      {row.phone && <IconLink href={waLink(row.phone, `Hi ${row.name}, it's Territory Spotless about ${row.reference}.`)} label={`WhatsApp ${row.name}`} external className="text-[#1DA851]"><MessageCircle className="h-4 w-4" aria-hidden /></IconLink>}
      {row.email && wide && <IconLink href={`mailto:${row.email}`} label={`Email ${row.name}`}><Mail className="h-4 w-4" aria-hidden /></IconLink>}
    </>
  );
}

function BookJobButton({ row, wide }: { row: EnquiryRow; wide: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [services, setServices] = useState(row.summary);
  const [date, setDate] = useState(row.date);
  const [time, setTime] = useState(row.timeWindow);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={`Book the job for ${row.name || "this enquiry"}`}
      description={`${row.reference} · ${row.phone || row.email}`}
      trigger={<button type="button" className={cn("inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-leaf-dark px-3 text-xs font-bold text-white hover:bg-[#1d6a19]", wide && "min-h-10 text-sm")}><CalendarPlus className="h-4 w-4" aria-hidden /> Book job</button>}
    >
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await confirmEnquiryJobAction(row.kind, row.id, { services, scheduledDate: date, timeWindow: time, price, notes });
          toast(result.ok ? "Job booked and customer saved" : result.error, result.ok ? "ok" : "error");
          if (result.ok) {
            setOpen(false);
            router.refresh();
          }
        });
      }}>
        <label className="text-sm font-semibold text-navy sm:col-span-2">Job<Textarea className="mt-1 min-h-20 font-normal" value={services} onChange={(event) => setServices(event.target.value)} /></label>
        <label className="text-sm font-semibold text-navy">Date<Input className="mt-1 font-normal" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label className="text-sm font-semibold text-navy">Time
          <Select className="mt-1 font-normal" value={time} onChange={(event) => setTime(event.target.value)}>
            <option value="">Not set yet</option>
            {TIME_WINDOWS.map((window) => <option key={window.id} value={window.id}>{window.label}</option>)}
          </Select>
        </label>
        <label className="text-sm font-semibold text-navy">Price<Input className="mt-1 font-normal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="$180" /></label>
        <label className="text-sm font-semibold text-navy">Note (optional)<Input className="mt-1 font-normal" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gate code, pets…" /></label>
        <p className="text-sm text-slate sm:col-span-2">The customer is saved (or matched by phone) and the job goes into Jobs as <b>Scheduled</b>. This enquiry is marked <b>booked</b>.</p>
        <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? "Booking…" : "Book job"}</Button>
      </form>
    </Sheet>
  );
}

function Details({ row }: { row: EnquiryRow }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(row.internalNotes);
  return (
    <div className="grid gap-4 rounded-2xl bg-white p-4 ring-1 ring-line md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-2 text-sm">
        <p className="whitespace-pre-wrap text-ink">{row.summary}</p>
        {row.message && row.message !== row.summary && <p className="whitespace-pre-wrap text-ink">“{row.message}”</p>}
        <p className="text-slate">{[row.address || row.suburb, row.email, row.date && `${formatDisplayDate(row.date)}${row.timeWindow ? `, ${timeWindowLabel(row.timeWindow)}` : ""}`].filter(Boolean).join(" · ")}</p>
        {row.promo && <p className="inline-flex rounded-full bg-leaf-soft px-3 py-1 font-semibold text-leaf-dark">{row.promo}</p>}
      </div>
      <div>
        <label className="text-sm font-semibold text-navy" htmlFor={`notes-${row.id}`}>Internal notes</label>
        <Textarea id={`notes-${row.id}`} className="mt-1 min-h-20" value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => notes !== row.internalNotes && start(async () => {
          if (row.kind === "lead") await updateLeadAction(row.id, { internalNotes: notes });
          else await updateBookingAction(row.id, { internalNotes: notes });
          toast("Notes saved");
          router.refresh();
        })} />
        <div className="mt-2 flex justify-end">
          <ConfirmDialog title="Delete this enquiry?" body="It's removed from the admin list. Any customer and job already made stay." confirmLabel="Delete" onConfirm={() => start(async () => {
            const result = row.kind === "lead" ? await deleteLeadAction(row.id) : await deleteBookingAction(row.id);
            toast(result.ok ? "Enquiry deleted" : result.error, result.ok ? "ok" : "error");
            router.refresh();
          })} trigger={<Button type="button" size="sm" variant="danger" disabled={pending}><Trash2 className="h-4 w-4" aria-hidden /> Delete</Button>} />
        </div>
      </div>
    </div>
  );
}
