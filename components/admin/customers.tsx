"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Camera, ChevronRight, MessageCircle, Phone, Plus, Search, User, UserPlus } from "lucide-react";
import { deleteCustomerAction, deleteJobAction, saveCustomerAction, saveJobAction } from "@/lib/actions";
import { uploadFile } from "@/components/admin/upload";
import { AddJobButton, type ServiceOption } from "@/components/admin/add-job";
import { DeleteButton, FilterChips, IconLink, Sheet } from "@/components/admin/kit";
import { MediaImage } from "@/components/media-image";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { JOB_STATUSES, TIME_WINDOWS, timeWindowLabel } from "@/lib/constants";
import type { Customer, Invoice, Job, JobStatus } from "@/lib/types";
import { Receipt } from "lucide-react";
import { cn, formatDisplayDate, formatDisplayDateTime, waLink } from "@/lib/utils";

export function emptyCustomer(): Customer {
  return { id: "", type: "person", name: "", companyName: "", phone: "", email: "", address: "", suburb: "", notes: "", marketingOptIn: false, createdAt: "", updatedAt: "" };
}

function emptyJob(customer: Customer): Job {
  return {
    id: "",
    reference: "",
    customerId: customer.id,
    services: "",
    address: customer.address,
    scheduledDate: "",
    timeWindow: "",
    completedDate: "",
    price: "",
    status: "scheduled",
    notes: "",
    beforePhotos: [],
    afterPhotos: [],
    history: [],
    sourceRef: "",
    createdAt: "",
    updatedAt: "",
  };
}

export function StatusBadge({ status }: { status: JobStatus }) {
  const item = JOB_STATUSES.find((entry) => entry.id === status);
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", item?.tone)}>{item?.label ?? status}</span>;
}

export function displayName(customer: Customer) {
  return customer.type === "company" && customer.companyName ? customer.companyName : customer.name;
}

/* ---------------------------------- List ---------------------------------- */

export function CustomersBoard({ customers, jobs, services = [], startAdding = false }: { customers: Customer[]; jobs: Job[]; services?: ServiceOption[]; startAdding?: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [adding, setAdding] = useState(startAdding);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .map((customer) => {
        const theirs = jobs.filter((job) => job.customerId === customer.id);
        return { customer, jobs: theirs, latest: theirs[0] };
      })
      .filter(({ customer, jobs: theirs, latest }) => {
        const text = `${customer.name} ${customer.companyName} ${customer.phone} ${customer.email} ${customer.address} ${customer.suburb} ${theirs.map((job) => `${job.reference} ${job.services}`).join(" ")}`.toLowerCase();
        return (!q || text.includes(q)) && (status === "all" || latest?.status === status || (status === "open-complaint" && theirs.some((job) => job.status === "complaint")));
      });
  }, [customers, jobs, query, status]);
  const counts = JOB_STATUSES.map((item) => ({ ...item, count: jobs.filter((job) => job.status === item.id).length }));

  return (
    <div className="space-y-5">
      <FilterChips label="Latest job status" value={status} onChange={setStatus} options={[{ id: "all", label: "All customers", count: customers.length }, ...counts.map((item) => ({ id: item.id, label: item.label, count: item.count }))]} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, company, phone, suburb, job ref…" aria-label="Search customers" className="pl-10" />
        </div>
        <Button type="button" onClick={() => setAdding((value) => !value)}><Plus className="h-4 w-4" aria-hidden /> Add customer</Button>
      </div>
      {adding && <CustomerForm initial={emptyCustomer()} onDone={() => setAdding(false)} />}
      {rows.length === 0 && <p className="rounded-card bg-white p-6 text-slate shadow-card">{customers.length ? "No customers match." : "No customers yet. Add one, or press “Make customer & job” on a lead or booking."}</p>}
      {rows.length > 0 && (
        <div className="hidden overflow-hidden rounded-card bg-white shadow-card md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs font-bold uppercase tracking-wider text-slate">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Jobs</th>
                <th className="px-4 py-3">Latest job</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ customer, jobs: theirs, latest }) => (
                <tr key={customer.id} className="align-middle transition hover:bg-mist/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand">{customer.type === "company" ? <Building2 className="h-5 w-5" aria-hidden /> : <User className="h-5 w-5" aria-hidden />}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-navy hover:text-brand">{displayName(customer)}</span>
                        <span className="block truncate text-xs text-slate">{customer.type === "company" ? customer.name : customer.suburb || customer.address}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate"><p>{customer.phone || "—"}</p><p className="truncate text-xs">{customer.email}</p></td>
                  <td className="px-4 py-3 font-semibold text-navy">{theirs.length}{customer.marketingOptIn && <span className="ml-2 rounded-full bg-leaf-soft px-2 py-0.5 text-xs font-bold text-leaf-dark">Offers OK</span>}</td>
                  <td className="px-4 py-3">{latest ? <span className="flex flex-col items-start gap-1"><StatusBadge status={latest.status} /><span className="line-clamp-1 text-xs text-slate">{latest.services}</span></span> : <span className="text-slate">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {customer.phone && <IconLink href={`tel:${customer.phone}`} label={`Call ${customer.name}`}><Phone className="h-4 w-4" aria-hidden /></IconLink>}
                      {customer.phone && <IconLink href={waLink(customer.phone, `Hi ${customer.name}, it's Territory Spotless.`)} label={`WhatsApp ${customer.name}`} external className="text-[#1DA851]"><MessageCircle className="h-4 w-4" aria-hidden /></IconLink>}
                      <AddJobButton customers={customers} services={services} customerId={customer.id} size="sm" variant="outline" label="Add job" />
                      <Link href={`/admin/customers/${customer.id}`} className="inline-flex min-h-10 items-center rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep">Open</Link>
                      <DeleteButton label={`Delete ${displayName(customer)}`} title={`Delete ${displayName(customer)}?`} body="The customer and all their jobs are removed from the admin, the database and the Google Sheet. This can’t be undone." action={() => deleteCustomerAction(customer.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ul className="space-y-2 md:hidden">
        {rows.map(({ customer, jobs: theirs, latest }) => (
          <li key={customer.id} className="rounded-card bg-white p-4 shadow-card">
            <Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand">{customer.type === "company" ? <Building2 className="h-5 w-5" aria-hidden /> : <User className="h-5 w-5" aria-hidden />}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-navy">{displayName(customer)}</span>
                <span className="block truncate text-sm text-slate">{[customer.phone, customer.suburb || customer.address, `${theirs.length} job${theirs.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}</span>
              </span>
              {latest && <StatusBadge status={latest.status} />}
              <ChevronRight className="h-5 w-5 shrink-0 text-slate" aria-hidden />
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {customer.phone && <IconLink href={`tel:${customer.phone}`} label={`Call ${customer.name}`}><Phone className="h-4 w-4" aria-hidden /></IconLink>}
              {customer.phone && <IconLink href={waLink(customer.phone, `Hi ${customer.name}, it's Territory Spotless.`)} label={`WhatsApp ${customer.name}`} external className="text-[#1DA851]"><MessageCircle className="h-4 w-4" aria-hidden /></IconLink>}
              <AddJobButton customers={customers} services={services} customerId={customer.id} size="sm" variant="outline" label="Add job" />
              <span className="ml-auto"><DeleteButton label={`Delete ${displayName(customer)}`} title={`Delete ${displayName(customer)}?`} body="The customer and all their jobs are removed from the admin, the database and the Google Sheet. This can’t be undone." action={() => deleteCustomerAction(customer.id)} /></span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- Customer -------------------------------- */

/** "+ Add customer" in a pop-up sheet: name and mobile are enough, the rest is optional. Opens the new customer when saved. */
export function AddCustomerButton({ className, label = "Add customer" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Add a customer"
      description="Name and mobile are enough. You can add jobs and invoices from their page."
      trigger={<button type="button" className={cn("flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-white px-4 font-semibold text-navy shadow-card hover:ring-2 hover:ring-brand/30", className)}><UserPlus className="h-4 w-4 text-brand" aria-hidden /> {label}</button>}
    >
      <CustomerForm initial={emptyCustomer()} bare onDone={() => setOpen(false)} />
    </Sheet>
  );
}

export function CustomerForm({ initial, onDone, bare = false }: { initial: Customer; onDone?: (id: string) => void; bare?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState(initial);
  const set = (patch: Partial<Customer>) => setCurrent((value) => ({ ...value, ...patch }));
  return (
    <form
      className={cn("grid gap-4", !bare && "rounded-card bg-white p-5 shadow-card")}
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await saveCustomerAction(current);
          toast(result.ok ? result.message || "Saved" : result.error, result.ok ? "ok" : "error");
          if (!result.ok) {
            // Already a customer: open their record so the job can be added there.
            if (result.id) router.push(`/admin/customers/${result.id}`);
            return;
          }
          if (!initial.id && result.id) router.push(`/admin/customers/${result.id}`);
          else router.refresh();
          onDone?.(result.id || "");
        });
      }}
    >
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Customer type">
        {(["person", "company"] as const).map((type) => (
          <button key={type} type="button" role="radio" aria-checked={current.type === type} onClick={() => set({ type })} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold", current.type === type ? "bg-navy text-white" : "bg-mist text-navy")}>
            {type === "person" ? <User className="h-4 w-4" aria-hidden /> : <Building2 className="h-4 w-4" aria-hidden />} {type === "person" ? "Person" : "Company"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {current.type === "company" && <div><Label htmlFor="c-company">Company name</Label><Input id="c-company" value={current.companyName} onChange={(event) => set({ companyName: event.target.value })} /></div>}
        <div><Label htmlFor="c-name">{current.type === "company" ? "Contact person" : "Name"}</Label><Input id="c-name" value={current.name} onChange={(event) => set({ name: event.target.value })} /></div>
        <div><Label htmlFor="c-phone">Mobile</Label><Input id="c-phone" inputMode="tel" value={current.phone} placeholder="04xx xxx xxx" onChange={(event) => set({ phone: event.target.value })} /></div>
        <div><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" value={current.email} onChange={(event) => set({ email: event.target.value })} /></div>
        <div><Label htmlFor="c-address">Address</Label><Input id="c-address" value={current.address} onChange={(event) => set({ address: event.target.value })} /></div>
        <div><Label htmlFor="c-suburb">Suburb</Label><Input id="c-suburb" value={current.suburb} onChange={(event) => set({ suburb: event.target.value })} /></div>
      </div>
      <div><Label htmlFor="c-notes">Notes</Label><Textarea id="c-notes" className="min-h-20" value={current.notes} placeholder="Gate code, pets, preferences…" onChange={(event) => set({ notes: event.target.value })} /></div>
      <label className="flex items-start gap-3 rounded-2xl bg-mist p-3 text-sm">
        <input type="checkbox" className="mt-1" checked={current.marketingOptIn} onChange={(event) => set({ marketingOptIn: event.target.checked })} />
        <span><strong className="text-navy">Customer agreed to receive offers</strong><br /><span className="text-slate">Only tick this if they said yes. Australian law (Spam Act) needs consent before sending marketing messages.</span></span>
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : initial.id ? "Save customer" : "Create customer"}</Button>
        {onDone && <Button type="button" variant="ghost" onClick={() => onDone("")}>Cancel</Button>}
      </div>
    </form>
  );
}

export function CustomerHeader({ customer }: { customer: Customer }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  if (editing) return <CustomerForm initial={customer} onDone={() => setEditing(false)} />;
  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate">{customer.type === "company" ? "Company" : "Customer"} since {formatDisplayDate(customer.createdAt)}</p>
          <h1 className="text-3xl font-bold text-navy">{displayName(customer)}</h1>
          {customer.type === "company" && <p className="text-slate">Contact: {customer.name}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>Edit details</Button>
          <ConfirmDialog title="Delete this customer?" body="This deletes the customer and all their jobs from the admin, Supabase and Google Sheet." confirmLabel="Delete" onConfirm={() => start(async () => { const result = await deleteCustomerAction(customer.id); toast(result.ok ? result.message || "Deleted" : result.error, result.ok ? "ok" : "error"); if (result.ok) router.push("/admin/customers"); })} trigger={<Button type="button" size="sm" variant="danger" disabled={pending}>Delete</Button>} />
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Mobile" value={customer.phone} />
        <Info label="Email" value={customer.email} />
        <Info label="Address" value={[customer.address, customer.suburb].filter(Boolean).join(", ")} />
        <Info label="Offers" value={customer.marketingOptIn ? "Agreed to receive offers" : "Not opted in"} />
      </dl>
      {customer.notes && <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-mist p-3 text-sm">{customer.notes}</p>}
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
        {customer.phone && <a className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-brand" href={`tel:${customer.phone}`}><Phone className="h-4 w-4" aria-hidden /> Call</a>}
        {customer.phone && <a className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F9EE] px-3 py-1.5 text-[#1DA851]" href={waLink(customer.phone, `Hi ${customer.name.split(" ")[0]}, it's Territory Spotless.`)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>}
        {customer.phone && <a className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-navy" href={`sms:${customer.phone}`}>Text</a>}
        {customer.email && <a className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-navy" href={`mailto:${customer.email}`}>Email</a>}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate">{label}</dt>
      <dd className="font-semibold text-navy">{value || "—"}</dd>
    </div>
  );
}

/* ----------------------------------- Jobs ---------------------------------- */

export function JobsPanel({ customer, jobs, invoices = [] }: { customer: Customer; jobs: Job[]; invoices?: Invoice[] }) {
  const [adding, setAdding] = useState(jobs.length === 0);
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-navy">Jobs</h2>
        <Button type="button" size="sm" onClick={() => setAdding((value) => !value)}><Plus className="h-4 w-4" aria-hidden /> New job</Button>
      </div>
      {adding && <JobForm initial={emptyJob(customer)} onDone={() => setAdding(false)} />}
      {jobs.map((job) => <JobCard key={job.id} job={job} invoice={invoices.find((item) => item.jobId === job.id && item.status !== "void")} />)}
    </section>
  );
}

function JobCard({ job, invoice }: { job: Job; invoice?: Invoice }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  if (editing) return <JobForm initial={job} onDone={() => setEditing(false)} />;

  function move(status: JobStatus, defaultNote = "") {
    start(async () => {
      const result = await saveJobAction({ ...job, status }, note || defaultNote);
      toast(result.ok ? `Marked ${JOB_STATUSES.find((item) => item.id === status)?.label.toLowerCase()}` : result.error, result.ok ? "ok" : "error");
      if (result.ok) {
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <article className="rounded-card bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate">{job.reference}{job.sourceRef && ` · from ${job.sourceRef}`}</p>
          <h3 className="whitespace-pre-wrap text-lg font-bold text-navy">{job.services}</h3>
          <p className="text-sm text-slate">{[job.address, job.scheduledDate && `Scheduled ${formatDisplayDate(job.scheduledDate)}${job.timeWindow ? `, ${timeWindowLabel(job.timeWindow)}` : ""}`, job.completedDate && `Done ${formatDisplayDate(job.completedDate)}`, job.price && `Price ${job.price}`].filter(Boolean).join(" · ")}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      {job.notes && <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-mist p-3 text-sm">{job.notes}</p>}

      {(job.beforePhotos.length > 0 || job.afterPhotos.length > 0) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <PhotoStrip label="Before" photos={job.beforePhotos} />
          <PhotoStrip label="After" photos={job.afterPhotos} />
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-line p-3">
        <Label htmlFor={`note-${job.id}`}>Update the job</Label>
        <Textarea id={`note-${job.id}`} className="min-h-16" value={note} placeholder="Optional note, e.g. “Customer says stain came back in hallway”" onChange={(event) => setNote(event.target.value)} />
        <div className="mt-2 flex flex-wrap gap-2">
          {job.status === "requested" && <Button type="button" size="sm" disabled={pending} onClick={() => move("scheduled", "Confirmed with customer")}>Confirm job</Button>}
          {job.status !== "in-progress" && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => move("in-progress")}>Start job</Button>}
          {job.status !== "done" && <Button type="button" size="sm" disabled={pending} onClick={() => move("done")}>Mark done</Button>}
          <Button type="button" size="sm" variant="danger" disabled={pending} onClick={() => (note.trim() ? move("complaint") : toast("Write what the customer complained about first.", "error"))}>Log complaint</Button>
          {(job.status === "complaint" || job.status === "done") && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => move("redo", "Redo booked")}>Book redo</Button>}
          {job.status !== "cancelled" && job.status !== "done" && <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => move("cancelled")}>Cancel job</Button>}
          {note.trim() && <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => move(job.status)}>Add note only</Button>}
          {invoice ? (
            <Link href={`/admin/invoices/${invoice.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-leaf-soft px-4 text-sm font-semibold text-leaf-dark"><Receipt className="h-4 w-4" aria-hidden /> Invoice {invoice.number}{invoice.status === "paid" ? " · paid" : ""}</Link>
          ) : (
            <Link href={`/admin/invoices/new?job=${job.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-navy/15 px-4 text-sm font-semibold text-navy hover:border-brand"><Receipt className="h-4 w-4" aria-hidden /> Create invoice</Link>
          )}
        </div>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand">History ({job.history.length})</summary>
        <ol className="mt-2 space-y-2 border-l-2 border-line pl-4">
          {[...job.history].reverse().map((event, index) => (
            <li key={`${event.at}-${index}`} className="text-sm">
              <span className="text-slate">{formatDisplayDateTime(event.at)}</span> <StatusBadge status={event.status} />
              {event.note && <p className="mt-0.5 whitespace-pre-wrap text-ink">{event.note}</p>}
            </li>
          ))}
        </ol>
      </details>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>Edit job & photos</Button>
        <ConfirmDialog title="Delete this job?" body="The job and its history are removed from admin, Supabase and Google Sheet." confirmLabel="Delete job" onConfirm={() => start(async () => { const result = await deleteJobAction(job.id); toast(result.ok ? "Job deleted" : result.error, result.ok ? "ok" : "error"); router.refresh(); })} trigger={<Button type="button" size="sm" variant="danger">Delete</Button>} />
      </div>
    </article>
  );
}

function PhotoStrip({ label, photos }: { label: string; photos: string[] }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate">{label}</p>
      {photos.length === 0 ? <p className="text-sm text-slate">No photos</p> : (
        <ul className="flex flex-wrap gap-2">
          {photos.map((url) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer"><MediaImage src={url} alt={`${label} photo`} className="h-20 w-20 rounded-xl object-cover" /></a></li>)}
        </ul>
      )}
    </div>
  );
}

function JobForm({ initial, onDone }: { initial: Job; onDone: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState(initial);
  const [uploading, setUploading] = useState("");
  const set = (patch: Partial<Job>) => setCurrent((value) => ({ ...value, ...patch }));

  async function upload(files: FileList | null, which: "beforePhotos" | "afterPhotos") {
    if (!files?.length) return;
    setUploading(which);
    for (const file of Array.from(files)) {
      const result = await uploadFile(file, "job-photo");
      if (result.ok && result.url) setCurrent((value) => ({ ...value, [which]: [...value[which], result.url as string] }));
      else toast(result.ok ? "Upload failed" : result.error, "error");
    }
    setUploading("");
  }

  return (
    <form
      className="grid gap-4 rounded-card bg-white p-5 shadow-card ring-2 ring-brand/20"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await saveJobAction(current);
          toast(result.ok ? result.message || "Saved" : result.error, result.ok ? "ok" : "error");
          if (result.ok) {
            onDone();
            router.refresh();
          }
        });
      }}
    >
      <h3 className="text-lg font-bold text-navy">{initial.id ? `Edit ${initial.reference}` : "New job"}</h3>
      <div><Label htmlFor="j-services">Services / job description</Label><Textarea id="j-services" className="min-h-20" value={current.services} placeholder="e.g. Carpet cleaning — 3 bedrooms + hallway" onChange={(event) => set({ services: event.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3"><Label htmlFor="j-address">Job address</Label><Input id="j-address" value={current.address} onChange={(event) => set({ address: event.target.value })} /></div>
        <div><Label htmlFor="j-date">Scheduled date</Label><Input id="j-date" type="date" value={current.scheduledDate} onChange={(event) => set({ scheduledDate: event.target.value })} /></div>
        <div>
          <Label htmlFor="j-time">Time slot</Label>
          <Select id="j-time" value={current.timeWindow} onChange={(event) => set({ timeWindow: event.target.value })}>
            <option value="">No set time</option>
            {TIME_WINDOWS.map((window) => <option key={window.id} value={window.id}>{window.label}</option>)}
          </Select>
        </div>
        <div><Label htmlFor="j-price">Price</Label><Input id="j-price" value={current.price} placeholder="e.g. $240" onChange={(event) => set({ price: event.target.value })} /></div>
        <div>
          <Label htmlFor="j-status">Status</Label>
          <Select id="j-status" value={current.status} onChange={(event) => set({ status: event.target.value as JobStatus })}>
            {JOB_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div><Label htmlFor="j-done">Completed date</Label><Input id="j-done" type="date" value={current.completedDate} onChange={(event) => set({ completedDate: event.target.value })} /></div>
      </div>
      <div><Label htmlFor="j-notes">Job notes</Label><Textarea id="j-notes" className="min-h-20" value={current.notes} onChange={(event) => set({ notes: event.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["beforePhotos", "afterPhotos"] as const).map((which) => (
          <fieldset key={which} className="rounded-2xl border border-line p-3">
            <legend className="px-1 text-sm font-bold text-navy">{which === "beforePhotos" ? "Before photos" : "After photos"}</legend>
            <ul className="flex flex-wrap gap-2">
              {current[which].map((url, index) => (
                <li key={url} className="relative">
                  <MediaImage src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <button type="button" aria-label={`Remove photo ${index + 1}`} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-danger shadow" onClick={() => set({ [which]: current[which].filter((item) => item !== url) } as Partial<Job>)}>×</button>
                </li>
              ))}
              <li>
                <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-xs font-semibold text-brand hover:border-brand">
                  {uploading === which ? "Uploading…" : <><Camera className="h-5 w-5" aria-hidden />Add</>}
                  <input type="file" accept="image/*" multiple capture="environment" className="sr-only" onChange={(event) => upload(event.target.files, which)} />
                </label>
              </li>
            </ul>
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || Boolean(uploading)}>{pending ? "Saving…" : initial.id ? "Save job" : "Create job"}</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
