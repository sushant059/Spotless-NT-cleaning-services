import { TIME_WINDOWS } from "@/lib/constants";
import type { Booking, Database, Job } from "@/lib/types";

/** What takes up a time slot on the calendar. */
export type SlotItem = {
  kind: "job" | "booking";
  id: string;
  reference: string;
  title: string;
  name: string;
  date: string;
  timeWindow: string;
  status: string;
  href: string;
};

type ScheduleData = Pick<Database, "jobs" | "bookings" | "customers" | "blockedDates" | "settings">;

/** A booking request stops holding its slot once it's lost, or once it has become a job (the job holds it instead). */
function bookingHoldsSlot(booking: Booking, jobs: Job[]) {
  if (booking.status === "lost") return false;
  return !jobs.some((job) => job.sourceRef && job.sourceRef === booking.reference);
}

function jobHoldsSlot(job: Job) {
  return job.status !== "cancelled" && Boolean(job.scheduledDate);
}

/** Everything on the calendar between two ISO dates (inclusive). */
export function calendarItems(db: ScheduleData, from: string, to: string): SlotItem[] {
  const items: SlotItem[] = [];
  for (const job of db.jobs) {
    if (!job.scheduledDate || job.scheduledDate < from || job.scheduledDate > to) continue;
    const customer = db.customers.find((item) => item.id === job.customerId);
    items.push({
      kind: "job",
      id: job.id,
      reference: job.reference,
      title: job.services.split("\n")[0].slice(0, 80),
      name: customer ? (customer.type === "company" && customer.companyName ? customer.companyName : customer.name) : "",
      date: job.scheduledDate,
      timeWindow: job.timeWindow,
      status: job.status,
      href: `/admin/customers/${job.customerId}`,
    });
  }
  for (const booking of db.bookings) {
    if (!booking.date || booking.date < from || booking.date > to) continue;
    if (!bookingHoldsSlot(booking, db.jobs)) continue;
    items.push({
      kind: "booking",
      id: booking.id,
      reference: booking.reference,
      title: booking.summary.split("\n")[0].slice(0, 80),
      name: booking.name,
      date: booking.date,
      timeWindow: booking.timeWindow,
      status: booking.status,
      href: "/admin/leads",
    });
  }
  const order = (window: string) => {
    const index = TIME_WINDOWS.findIndex((item) => item.id === window);
    return index < 0 ? 99 : index;
  };
  return items.sort((a, b) => a.date.localeCompare(b.date) || order(a.timeWindow) - order(b.timeWindow));
}

/** Jobs and booking requests holding one date + time slot. */
export function slotOccupants(db: ScheduleData, date: string, timeWindow: string, ignore: { jobId?: string; bookingId?: string } = {}) {
  const jobs = db.jobs.filter((job) => jobHoldsSlot(job) && job.id !== ignore.jobId && job.scheduledDate === date && job.timeWindow === timeWindow);
  const bookings = db.bookings.filter((booking) => booking.id !== ignore.bookingId && booking.date === date && booking.timeWindow === timeWindow && bookingHoldsSlot(booking, db.jobs));
  return [...jobs.map((job) => job.reference), ...bookings.map((booking) => booking.reference)];
}

export function slotCapacity(db: ScheduleData) {
  return Math.max(1, Number(db.settings.slotCapacity) || 1);
}

export function isSlotFull(db: ScheduleData, date: string, timeWindow: string, ignore: { jobId?: string; bookingId?: string } = {}) {
  return slotOccupants(db, date, timeWindow, ignore).length >= slotCapacity(db);
}

/** What the public booking form needs: whether the day is closed and which time slots are taken. */
export function dayAvailability(db: ScheduleData, date: string) {
  const blocked = db.blockedDates.some((item) => item.date === date);
  const full = TIME_WINDOWS.filter((window) => isSlotFull(db, date, window.id)).map((window) => window.id);
  return { blocked, full, allFull: full.length === TIME_WINDOWS.length };
}
