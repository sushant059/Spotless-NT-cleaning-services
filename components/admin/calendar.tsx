"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarX2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { deleteBlockedDateAction, saveBlockedDateAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toaster";
import { JOB_STATUSES, TIME_WINDOWS } from "@/lib/constants";
import type { SlotItem } from "@/lib/schedule";
import type { BlockedDate } from "@/lib/types";
import { cn, formatDisplayDate } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHORT_WINDOW: Record<string, string> = { "7-10": "7–10am", "10-1": "10–1pm", "1-4": "1–4pm", "4-6": "4–6pm" };

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function tone(item: SlotItem) {
  if (item.kind === "booking") return "bg-sky-soft text-navy";
  return JOB_STATUSES.find((status) => status.id === item.status)?.tone ?? "bg-mist text-navy";
}

function label(item: SlotItem) {
  if (item.kind === "booking") return "Booking request";
  return JOB_STATUSES.find((status) => status.id === item.status)?.label ?? item.status;
}

export function CalendarBoard({ items, blocked, capacity, today }: { items: SlotItem[]; blocked: BlockedDate[]; capacity: number; today: string }) {
  const [cursor, setCursor] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState(today);
  const byDate = useMemo(() => {
    const map = new Map<string, SlotItem[]>();
    for (const item of items) map.set(item.date, [...(map.get(item.date) ?? []), item]);
    return map;
  }, [items]);
  const blockedByDate = useMemo(() => new Map(blocked.map((item) => [item.date, item])), [blocked]);

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // Monday first
  const cells: (string | null)[] = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => iso(cursor.year, cursor.month, i + 1))];
  while (cells.length % 7) cells.push(null);
  const monthName = first.toLocaleString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });
  const move = (delta: number) => setCursor(({ year, month }) => {
    const next = new Date(Date.UTC(year, month + delta, 1));
    return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
  });
  const upcoming = items.filter((item) => item.date >= today).slice(0, 12);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="rounded-card bg-white p-4 shadow-card md:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-2xl font-bold text-navy">{monthName}</h2>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }); setSelected(today); }}>Today</Button>
          <Button type="button" size="icon" variant="outline" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeft className="h-5 w-5" aria-hidden /></Button>
          <Button type="button" size="icon" variant="outline" aria-label="Next month" onClick={() => move(1)}><ChevronRight className="h-5 w-5" aria-hidden /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider text-slate">
          {WEEKDAYS.map((day) => <div key={day} className="py-1">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="min-h-20 rounded-xl md:min-h-28" />;
            const dayItems = byDate.get(date) ?? [];
            const isBlocked = blockedByDate.has(date);
            const full = TIME_WINDOWS.every((window) => dayItems.filter((item) => item.timeWindow === window.id).length >= capacity);
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                className={cn(
                  "flex min-h-20 flex-col rounded-xl border p-1.5 text-left align-top transition md:min-h-28",
                  selected === date ? "border-navy ring-2 ring-navy/20" : "border-line hover:border-brand",
                  isBlocked && "bg-[repeating-linear-gradient(135deg,#F3F7FC_0,#F3F7FC_6px,#fff_6px,#fff_12px)]",
                  date < today && "opacity-60",
                )}
                aria-label={`${formatDisplayDate(date)}: ${dayItems.length} booked${isBlocked ? ", blocked" : ""}`}
              >
                <span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs font-bold", date === today ? "bg-navy text-white" : "text-navy")}>{Number(date.slice(8))}</span>
                <span className="mt-1 hidden space-y-0.5 md:block">
                  {dayItems.slice(0, 3).map((item) => (
                    <span key={item.id} className={cn("block truncate rounded px-1 py-0.5 text-[11px] font-semibold", tone(item))}>{SHORT_WINDOW[item.timeWindow] ?? "Any time"} · {item.name || item.reference}</span>
                  ))}
                  {dayItems.length > 3 && <span className="block text-[11px] font-semibold text-slate">+{dayItems.length - 3} more</span>}
                </span>
                <span className="mt-auto flex flex-wrap gap-0.5 md:hidden">
                  {dayItems.slice(0, 4).map((item) => <span key={item.id} className={cn("h-2 w-2 rounded-full", item.kind === "booking" ? "bg-sky" : "bg-leaf-dark")} />)}
                </span>
                {isBlocked && <span className="mt-auto text-[10px] font-bold uppercase text-danger">Blocked</span>}
                {!isBlocked && full && <span className="mt-auto text-[10px] font-bold uppercase text-danger">Full</span>}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-sky-soft" /> Booking request (not confirmed yet)</span>
          {JOB_STATUSES.filter((status) => status.id !== "cancelled").map((status) => <span key={status.id} className="flex items-center gap-1.5"><span className={cn("h-3 w-3 rounded", status.tone)} /> {status.label} job</span>)}
        </div>
      </section>

      <div className="space-y-6">
        <DayPanel date={selected} items={byDate.get(selected) ?? []} blocked={blockedByDate.get(selected)} capacity={capacity} today={today} />
        <section className="rounded-card bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-navy">Coming up</h2>
          {upcoming.length === 0 && <p className="mt-2 text-sm text-slate">Nothing scheduled yet.</p>}
          <ul className="mt-2 divide-y divide-line">
            {upcoming.map((item) => (
              <li key={item.id} className="py-2">
                <Link href={item.href} className="block hover:text-brand">
                  <span className="text-sm font-semibold text-navy">{formatDisplayDate(item.date)} · {SHORT_WINDOW[item.timeWindow] ?? "Any time"}</span>
                  <span className="block truncate text-sm text-slate">{item.name} · {item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function DayPanel({ date, items, blocked, capacity, today }: { date: string; items: SlotItem[]; blocked?: BlockedDate; capacity: number; today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  const unscheduled = items.filter((item) => !TIME_WINDOWS.some((window) => window.id === item.timeWindow));
  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <p className="text-sm font-semibold text-slate">{date === today ? "Today" : "Selected day"}</p>
      <h2 className="text-xl font-bold text-navy">{new Date(`${date}T00:00:00Z`).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}</h2>
      {blocked && <p className="mt-2 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger"><CalendarX2 className="h-4 w-4" aria-hidden /> Blocked{blocked.reason ? `: ${blocked.reason}` : ""}. Customers can’t book this day.</p>}
      <ul className="mt-4 space-y-3">
        {TIME_WINDOWS.map((window) => {
          const inSlot = items.filter((item) => item.timeWindow === window.id);
          const free = Math.max(0, capacity - inSlot.length);
          return (
            <li key={window.id} className="rounded-2xl border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-navy">{window.label}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", free ? "bg-leaf-soft text-leaf-dark" : "bg-red-50 text-danger")}>{free ? `${free} free` : "Booked"}</span>
              </div>
              {inSlot.map((item) => <SlotRow key={item.id} item={item} />)}
            </li>
          );
        })}
        {unscheduled.length > 0 && (
          <li className="rounded-2xl border border-dashed border-line p-3">
            <span className="font-semibold text-navy">No set time</span>
            {unscheduled.map((item) => <SlotRow key={item.id} item={item} />)}
          </li>
        )}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm"><Link href="/admin/customers"><Plus className="h-4 w-4" aria-hidden /> Add a job</Link></Button>
        {blocked ? (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
            const result = await deleteBlockedDateAction(blocked.id);
            toast(result.ok ? "Day unblocked" : result.error, result.ok ? "ok" : "error");
            router.refresh();
          })}>Unblock day</Button>
        ) : (
          <form className="flex flex-1 gap-2" onSubmit={(event) => {
            event.preventDefault();
            start(async () => {
              const result = await saveBlockedDateAction(date, reason);
              toast(result.ok ? "Day blocked. Customers can’t book it." : result.error, result.ok ? "ok" : "error");
              if (result.ok) setReason("");
              router.refresh();
            });
          }}>
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason (optional)" aria-label="Reason for blocking" className="min-h-10" />
            <Button type="submit" size="sm" variant="outline" disabled={pending} className="shrink-0">Block day</Button>
          </form>
        )}
      </div>
    </section>
  );
}

function SlotRow({ item }: { item: SlotItem }) {
  return (
    <Link href={item.href} className="mt-2 block rounded-xl bg-mist p-2 hover:ring-2 hover:ring-brand/30">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy">{item.name || "—"}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", tone(item))}>{label(item)}</span>
      </span>
      <span className="block truncate text-xs text-slate">{item.reference} · {item.title}</span>
    </Link>
  );
}
