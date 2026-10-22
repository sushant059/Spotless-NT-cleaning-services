import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, Inbox, MessageSquareQuote, Receipt, Send, TrendingUp } from "lucide-react";
import { AddJobButton } from "@/components/admin/add-job";
import { AddCustomerButton, StatusBadge } from "@/components/admin/customers";
import { EnquiryActions } from "@/components/admin/enquiries";
import { enquiryRows } from "@/lib/enquiry-rows";
import { DataStatus } from "@/components/admin/data-status";
import { sheetsEnabled } from "@/lib/sheets";
import { timeWindowLabel } from "@/lib/constants";
import { getDb, usingSupabase } from "@/lib/store";
import { byOrder, darwinISODate, formatDisplayDate, formatDisplayDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const db = await getDb();
  const today = darwinISODate();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const services = byOrder(db.services).map(({ slug, title, category }) => ({ slug, title, category }));
  const customerName = (id: string) => {
    const customer = db.customers.find((item) => item.id === id);
    return customer ? customer.companyName || customer.name : "—";
  };
  // New website enquiries that haven't been booked yet: book the job or save the customer right here.
  const waiting = enquiryRows(db).filter((row) => row.status === "new" && (!row.job || row.job.status === "requested"));
  const todays = db.jobs.filter((job) => job.scheduledDate === today && job.status !== "cancelled").sort((a, b) => a.timeWindow.localeCompare(b.timeWindow));
  const upcoming = db.jobs.filter((job) => job.scheduledDate > today && !["cancelled", "done"].includes(job.status)).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).slice(0, 5);
  const week = [...db.leads, ...db.bookings].filter((item) => new Date(item.createdAt).getTime() >= weekAgo).length;
  const pendingReviews = db.reviews.filter((review) => review.status === "pending");
  const unpaid = db.invoices.filter((invoice) => invoice.status === "sent").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate">G’day 👋 · {formatDisplayDate(today)}</p>
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
        </div>
      </div>
      {(!usingSupabase() || !sheetsEnabled()) && <DataStatus supabase={usingSupabase()} sheets={sheetsEnabled()} />}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AddJobButton customers={db.customers} services={services} label="Add job" className="h-full min-h-14 w-full rounded-2xl" />
        <AddCustomerButton className="h-full w-full" />
        <Link href="/admin/invoices/new" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-navy shadow-card hover:ring-2 hover:ring-brand/30"><Receipt className="h-4 w-4 text-brand" aria-hidden /> New invoice</Link>
        <Link href="/admin/messages" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-navy shadow-card hover:ring-2 hover:ring-brand/30"><Send className="h-4 w-4 text-brand" aria-hidden /> Send offer</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Inbox className="h-5 w-5" />} label="Enquiries to answer" value={waiting.length} href="/admin/leads" tone="bg-sun-soft text-[#8A5A00]" />
        <Stat icon={<Briefcase className="h-5 w-5" />} label="Jobs today" value={todays.length} href="/admin/jobs" tone="bg-leaf-soft text-leaf-dark" />
        <Stat icon={<TrendingUp className="h-5 w-5" />} label="Enquiries this week" value={week} href="/admin/leads" tone="bg-brand-light text-brand" />
        <Stat icon={<Receipt className="h-5 w-5" />} label="Invoices unpaid" value={unpaid} href="/admin/invoices" tone="bg-mist text-navy" />
      </div>

      {pendingReviews.length > 0 && (
        <Link href="/admin/reviews" className="flex items-center gap-4 rounded-card bg-navy p-5 text-white shadow-card">
          <MessageSquareQuote className="h-8 w-8 shrink-0 text-sky" aria-hidden />
          <div className="min-w-0 flex-1"><p className="font-bold">{pendingReviews.length} review{pendingReviews.length === 1 ? "" : "s"} waiting for approval</p><p className="truncate text-sm text-white/70">Latest from {pendingReviews[pendingReviews.length - 1].name}</p></div>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy"><Inbox className="h-5 w-5 text-[#8A5A00]" aria-hidden /> Waiting for a reply</h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-brand">Open enquiries</Link>
          </div>
          {waiting.length === 0 && <p className="mt-3 text-slate">All caught up. New enquiries from the website appear here as soon as they arrive.</p>}
          <ul className="mt-3 divide-y divide-line">
            {waiting.slice(0, 6).map((row) => (
              <li key={row.id} className="py-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 rounded-full bg-sun-soft px-2 py-0.5 text-xs font-bold text-[#8A5A00]">{row.source}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">{row.name || "No name"} <span className="text-xs font-normal text-slate">{formatDisplayDateTime(row.createdAt)}</span></span>
                    <span className="block text-sm text-slate">{[row.summary, row.suburb, row.wanted].filter(Boolean).join(" · ")}</span>
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-0 sm:pl-[72px]"><EnquiryActions row={row} /></div>
              </li>
            ))}
          </ul>
          {waiting.length > 6 && <Link href="/admin/leads" className="mt-2 inline-block text-sm font-semibold text-brand">See all {waiting.length} →</Link>}
        </section>

        <section className="rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy"><CalendarDays className="h-5 w-5 text-leaf-dark" aria-hidden /> Today & next up</h2>
            <Link href="/admin/jobs" className="text-sm font-semibold text-brand">All jobs</Link>
          </div>
          {todays.length + upcoming.length === 0 && <p className="mt-3 text-slate">No jobs booked yet. Use “Add job”, or book one from an enquiry.</p>}
          <ul className="mt-3 divide-y divide-line">
            {[...todays, ...upcoming].map((job) => (
              <li key={job.id}>
                <Link href={`/admin/customers/${job.customerId}`} className="flex items-start gap-3 py-3 hover:bg-mist/50">
                  <span className={`w-20 shrink-0 rounded-xl px-2 py-1 text-center text-xs font-bold ${job.scheduledDate === today ? "bg-leaf text-white" : "bg-mist text-navy"}`}>{job.scheduledDate === today ? "Today" : formatDisplayDate(job.scheduledDate).replace(/ \d{4}$/, "")}<span className="block font-normal opacity-80">{job.timeWindow ? timeWindowLabel(job.timeWindow).split(" – ")[0] : "Any time"}</span></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">{customerName(job.customerId)}</span>
                    <span className="block truncate text-sm text-slate">{job.services}</span>
                  </span>
                  <StatusBadge status={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, href, tone }: { icon: React.ReactNode; label: string; value: number; href: string; tone: string }) {
  return (
    <Link href={href} className="rounded-card bg-white p-4 shadow-card transition hover:-translate-y-0.5 md:p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
      <p className="text-sm text-slate">{label}</p>
    </Link>
  );
}
