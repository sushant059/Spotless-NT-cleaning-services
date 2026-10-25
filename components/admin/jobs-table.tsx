"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowUpRight, MessageCircle, Phone, Receipt, Search } from "lucide-react";
import { CategoryBadges, FilterChips, IconLink } from "@/components/admin/kit";
import { Input } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { saveJobAction } from "@/lib/actions";
import { JOB_STATUSES, timeWindowLabel } from "@/lib/constants";
import type { Customer, Job, JobStatus, ServiceCategory } from "@/lib/types";
import { cn, formatDisplayDate, waLink } from "@/lib/utils";

export type JobRow = { job: Job; customer: Customer | undefined; categories: ServiceCategory[]; invoice: { id: string; number: string; status: string } | null };

type When = "upcoming" | "today" | "unscheduled" | "past" | "all";

export function JobsTable({ rows, categories, today }: { rows: JobRow[]; categories: { id: ServiceCategory; label: string }[]; today: string }) {
  const [when, setWhen] = useState<When>("upcoming");
  const [status, setStatus] = useState<string>("active");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const labels = Object.fromEntries(categories.map((item) => [item.id, item.label]));

  const inWhen = (row: JobRow, value: When) => {
    const date = row.job.scheduledDate;
    if (value === "all") return true;
    if (value === "today") return date === today;
    if (value === "unscheduled") return !date;
    if (value === "past") return Boolean(date) && date < today;
    return Boolean(date) && date >= today;
  };
  const inStatus = (row: JobRow, value: string) => value === "all" || (value === "active" ? !["done", "cancelled"].includes(row.job.status) : row.job.status === value);
  const inCategory = (row: JobRow, value: string) => value === "all" || (value === "other" ? row.categories.length === 0 : row.categories.includes(value as ServiceCategory));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => inWhen(row, when) && inStatus(row, status) && inCategory(row, category))
      .filter((row) => !q || `${row.job.reference} ${row.job.services} ${row.job.address} ${row.customer?.name} ${row.customer?.companyName} ${row.customer?.phone}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const ad = a.job.scheduledDate || "9999";
        const bd = b.job.scheduledDate || "9999";
        return when === "past" ? bd.localeCompare(ad) : ad.localeCompare(bd) || a.job.timeWindow.localeCompare(b.job.timeWindow);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, when, status, category, query]);

  const scoped = rows.filter((row) => inWhen(row, when));
  return (
    <div className="space-y-4">
      <FilterChips<When>
        label="When"
        value={when}
        onChange={setWhen}
        options={[
          { id: "upcoming", label: "Upcoming", count: rows.filter((row) => inWhen(row, "upcoming")).length },
          { id: "today", label: "Today", count: rows.filter((row) => inWhen(row, "today")).length, tone: "bg-leaf-soft text-leaf-dark" },
          { id: "unscheduled", label: "No date yet", count: rows.filter((row) => inWhen(row, "unscheduled")).length, tone: "bg-sun-soft text-[#8A5A00]" },
          { id: "past", label: "Past", count: rows.filter((row) => inWhen(row, "past")).length },
          { id: "all", label: "All", count: rows.length },
        ]}
      />
      <FilterChips
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { id: "active", label: "Open jobs", count: scoped.filter((row) => inStatus(row, "active")).length },
          ...JOB_STATUSES.map((item) => ({ id: item.id, label: item.label, count: scoped.filter((row) => row.job.status === item.id).length })),
          { id: "all", label: "Every status", count: scoped.length },
        ]}
      />
      <FilterChips
        label="Service category"
        value={category}
        onChange={setCategory}
        options={[
          { id: "all", label: "All services" },
          ...categories.map((item) => ({ id: item.id, label: item.label, count: scoped.filter((row) => inStatus(row, status) && row.categories.includes(item.id)).length })),
          { id: "other", label: "Other", count: scoped.filter((row) => inStatus(row, status) && row.categories.length === 0).length },
        ]}
      />
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search job ref, customer, phone, address" aria-label="Search jobs" className="pl-10" />
      </div>

      {filtered.length === 0 && <p className="rounded-card bg-white p-6 text-slate shadow-card">No jobs here. Try another filter, or add a job.</p>}

      {filtered.length > 0 && (
        <div className="hidden overflow-hidden rounded-card bg-white shadow-card md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs font-bold uppercase tracking-wider text-slate">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((row) => (
                <tr key={row.job.id} className={cn("align-top transition hover:bg-mist/60", row.job.scheduledDate === today && "bg-leaf-soft/40")}>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-semibold text-navy">{row.job.scheduledDate ? formatDisplayDate(row.job.scheduledDate) : "No date"}</p>
                    <p className="text-xs text-slate">{row.job.timeWindow ? timeWindowLabel(row.job.timeWindow) : "Time not set"}</p>
                  </td>
                  <td className="max-w-[300px] px-4 py-3">
                    <CategoryBadges ids={row.categories} labels={labels} />
                    <p className="mt-1 line-clamp-2 font-semibold text-navy">{row.job.services}</p>
                    <p className="text-xs text-slate">{row.job.reference}{row.job.address ? ` · ${row.job.address}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{row.customer ? row.customer.companyName || row.customer.name : "—"}</p>
                    <p className="text-xs text-slate">{row.customer?.phone}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-navy">{row.job.price || <span className="font-normal text-slate">—</span>}</td>
                  <td className="px-4 py-3"><JobStatusSelect job={row.job} /></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1.5"><JobActions row={row} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ul className="grid gap-3 md:hidden">
        {filtered.map((row) => (
          <li key={row.job.id} className={cn("rounded-card bg-white p-4 shadow-card", row.job.scheduledDate === today && "ring-2 ring-leaf")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-navy">{row.job.scheduledDate ? formatDisplayDate(row.job.scheduledDate) : "No date yet"}{row.job.timeWindow ? ` · ${timeWindowLabel(row.job.timeWindow)}` : ""}</p>
                <p className="truncate text-sm text-slate">{row.customer ? row.customer.companyName || row.customer.name : "—"} · {row.job.reference}</p>
              </div>
              {row.job.price && <span className="shrink-0 font-bold text-navy">{row.job.price}</span>}
            </div>
            <div className="mt-2"><CategoryBadges ids={row.categories} labels={labels} /></div>
            <p className="mt-2 line-clamp-2 text-sm text-ink">{row.job.services}</p>
            {row.job.address && <p className="mt-1 truncate text-xs text-slate">{row.job.address}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2"><JobStatusSelect job={row.job} /><JobActions row={row} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JobStatusSelect({ job }: { job: Job }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const tone = JOB_STATUSES.find((item) => item.id === job.status)?.tone;
  return (
    <select
      aria-label={`Status for ${job.reference}`}
      value={job.status}
      disabled={pending}
      className={cn("min-h-9 rounded-full border-0 px-3 text-xs font-bold", tone)}
      onChange={(event) => start(async () => {
        const result = await saveJobAction({ ...job, status: event.target.value as JobStatus });
        toast(result.ok ? "Job updated" : result.error, result.ok ? "ok" : "error");
        router.refresh();
      })}
    >
      {JOB_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
  );
}

function JobActions({ row }: { row: JobRow }) {
  const phone = row.customer?.phone;
  return (
    <>
      {phone && <IconLink href={`tel:${phone}`} label="Call customer"><Phone className="h-4 w-4" aria-hidden /></IconLink>}
      {phone && <IconLink href={waLink(phone, `Hi ${row.customer?.name}, it's Territory Spotless about your clean (${row.job.reference}).`)} label="WhatsApp customer" external className="text-[#1DA851]"><MessageCircle className="h-4 w-4" aria-hidden /></IconLink>}
      {row.invoice ? (
        <Link href={`/admin/invoices/${row.invoice.id}`} className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-full bg-leaf-soft px-3 text-xs font-bold text-leaf-dark"><Receipt className="h-3.5 w-3.5" aria-hidden /> {row.invoice.number}</Link>
      ) : (
        <Link href={`/admin/invoices/new?job=${row.job.id}`} className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-full bg-mist px-3 text-xs font-bold text-navy hover:bg-brand-light"><Receipt className="h-3.5 w-3.5" aria-hidden /> Invoice</Link>
      )}
      {row.customer && <Link href={`/admin/customers/${row.customer.id}`} className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-full bg-navy px-3 text-xs font-bold text-white hover:bg-navy-deep">Open <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></Link>}
    </>
  );
}
