import Link from "next/link";
import { getDb } from "@/lib/store";
import { darwinISODate, formatDisplayDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const db = await getDb();
  const today = darwinISODate();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const leadsToday = db.leads.filter((item) => darwinISODate(new Date(item.createdAt)) === today).length;
  const bookingsToday = db.bookings.filter((item) => darwinISODate(new Date(item.createdAt)) === today).length;
  const week = [...db.leads, ...db.bookings].filter((item) => new Date(item.createdAt).getTime() >= weekAgo).length;
  const counts = ["new", "contacted", "quoted", "booked", "completed", "lost"].map((status) => ({
    status,
    count: db.leads.filter((item) => item.status === status).length + db.bookings.filter((item) => item.status === status).length,
  }));
  const activity = [
    ...db.leads.map((item) => ({ id: item.id, when: item.createdAt, label: `${item.source} lead ${item.reference} · ${item.name}` })),
    ...db.bookings.map((item) => ({ id: item.id, when: item.createdAt, label: `Booking ${item.reference} · ${item.name}` })),
  ].sort((a, b) => b.when.localeCompare(a.when)).slice(0, 8);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="New leads today" value={leadsToday} />
        <Stat label="Booking requests today" value={bookingsToday} />
        <Stat label="Requests this week" value={week} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {counts.map((item) => <Stat key={item.status} label={item.status} value={item.count} />)}
      </div>
      <section className="rounded-card bg-white p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Latest activity</h2>
          <Link href="/admin/leads" className="font-semibold text-teal-deep">Open the list</Link>
        </div>
        {activity.length === 0 && <p className="mt-3 text-slate">No leads or bookings yet. They will show here as soon as a form is sent.</p>}
        <ul className="mt-3 divide-y divide-[#e7f3f5]">
          {activity.map((item) => <li key={item.id} className="py-3"><p className="font-semibold">{item.label}</p><p className="text-sm text-slate">{formatDisplayDateTime(item.when)}</p></li>)}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-card bg-white p-4 shadow-card"><p className="text-sm capitalize text-slate">{label}</p><p className="text-3xl font-bold">{value}</p></div>;
}
