import type { Booking, Customer, Database, Job, Lead } from "@/lib/types";
import { JOB_STATUSES } from "@/lib/constants";

/*
 * Mirrors customers, jobs, leads and bookings into a Google Sheet.
 * The sheet runs the Apps Script in google-sheets/Code.gs, published as a web app.
 * Set GOOGLE_SHEETS_WEBHOOK_URL and GOOGLE_SHEETS_SECRET to switch it on.
 * Supabase stays the source of truth; the sheet is a readable copy.
 */

export type SheetTab = "Customers" | "Jobs" | "Leads" | "Bookings";
type SheetRow = Record<string, string | number | boolean>;

export function sheetsEnabled() {
  return Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL && process.env.GOOGLE_SHEETS_SECRET);
}

const statusLabel = (status: string) => JOB_STATUSES.find((item) => item.id === status)?.label ?? status;
const list = (items: string[]) => items.filter(Boolean).join("\n");

export function customerSheetRow(customer: Customer, jobs: Job[]): SheetRow {
  const theirs = jobs.filter((job) => job.customerId === customer.id);
  return {
    ID: customer.id,
    Type: customer.type === "company" ? "Company" : "Person",
    Name: customer.name,
    Company: customer.companyName,
    Phone: customer.phone,
    Email: customer.email,
    Address: customer.address,
    Suburb: customer.suburb,
    "OK to send offers": customer.marketingOptIn ? "Yes" : "No",
    Jobs: theirs.length,
    "Last job status": theirs[0] ? statusLabel(theirs[0].status) : "",
    Notes: customer.notes,
    Created: customer.createdAt,
    Updated: customer.updatedAt,
  };
}

export function jobSheetRow(job: Job, customers: Customer[]): SheetRow {
  const customer = customers.find((item) => item.id === job.customerId);
  return {
    ID: job.id,
    Reference: job.reference,
    Customer: customer ? customer.companyName || customer.name : "",
    Phone: customer?.phone ?? "",
    Services: job.services,
    Address: job.address,
    "Scheduled date": job.scheduledDate,
    "Completed date": job.completedDate,
    Price: job.price,
    Status: statusLabel(job.status),
    Notes: job.notes,
    "Before photos": list(job.beforePhotos),
    "After photos": list(job.afterPhotos),
    History: job.history.map((event) => `${event.at.slice(0, 16).replace("T", " ")} ${statusLabel(event.status)}${event.note ? `: ${event.note}` : ""}`).join("\n"),
    "From enquiry": job.sourceRef,
    Created: job.createdAt,
    Updated: job.updatedAt,
  };
}

export function leadSheetRow(lead: Lead): SheetRow {
  return {
    ID: lead.id,
    Reference: lead.reference,
    Source: lead.source,
    Status: lead.status,
    Name: lead.name,
    Phone: lead.phone,
    Email: lead.email,
    Suburb: lead.suburb,
    Details: lead.summary,
    Message: lead.message,
    "Preferred time": lead.preferredTime,
    "Promo code": lead.promoCode,
    Photos: list(lead.photos),
    "Internal notes": lead.internalNotes,
    Created: lead.createdAt,
  };
}

export function bookingSheetRow(booking: Booking): SheetRow {
  return {
    ID: booking.id,
    Reference: booking.reference,
    Status: booking.status,
    Name: booking.name,
    Phone: booking.phone,
    Email: booking.email,
    Date: booking.date,
    "Time window": booking.timeWindow,
    Address: booking.address,
    Suburb: booking.suburb,
    Details: booking.summary,
    Notes: booking.notes,
    "Promo code": booking.promoCode,
    "Internal notes": booking.internalNotes,
    Created: booking.createdAt,
  };
}

/** Sends upserts and deletes for one tab. Never throws: a sheet outage must not block the site. */
export async function syncSheet(tab: SheetTab, upsert: SheetRow[], remove: string[] = []) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return false;
  if (!upsert.length && !remove.length) return true;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, tab, upsert, delete: remove }),
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !result?.ok) {
      console.error("Google Sheets sync failed", tab, response.status, result?.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Google Sheets sync failed", tab, error);
    return false;
  }
}

/** Pushes every customer, job, lead and booking. Used by the "Sync everything now" button. */
export async function syncEverything(db: Database) {
  const results = await Promise.all([
    syncSheet("Customers", db.customers.map((customer) => customerSheetRow(customer, db.jobs))),
    syncSheet("Jobs", db.jobs.map((job) => jobSheetRow(job, db.customers))),
    syncSheet("Leads", db.leads.map(leadSheetRow)),
    syncSheet("Bookings", db.bookings.map(bookingSheetRow)),
  ]);
  return results.every(Boolean);
}
