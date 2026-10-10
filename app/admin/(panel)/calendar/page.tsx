import { CalendarBoard } from "@/components/admin/calendar";
import { calendarItems, slotCapacity } from "@/lib/schedule";
import { getDb } from "@/lib/store";
import { darwinISODate } from "@/lib/utils";

export default async function CalendarPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Calendar</h1>
      <p className="mb-5 mt-1 text-slate">Every booking request and job by date and time slot. Taken slots can’t be booked again on the website.</p>
      <CalendarBoard items={calendarItems(db, "2000-01-01", "2100-12-31")} blocked={db.blockedDates} capacity={slotCapacity(db)} today={darwinISODate()} />
    </div>
  );
}
