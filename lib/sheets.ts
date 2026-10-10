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

type SheetResult = { ok: boolean; error?: string };

/** Turns what the Apps Script sent back into a plain-English problem, if there is one. */
function explain(status: number, text: string): SheetResult {
  let body: { ok?: boolean; error?: string } | null = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  if (body?.ok) return { ok: true };
  if (body?.error === "Wrong secret") {
    return { ok: false, error: "The secret in the Apps Script doesn't match GOOGLE_SHEETS_SECRET in Vercel. Paste the right SECRET into Code.gs, Save, then Deploy → Manage deployments → Edit → Version: New version → Deploy." };
  }
  if (body?.error) return { ok: false, error: `The Apps Script replied: ${body.error}` };
  if (/<html|<!doctype/i.test(text)) {
    return { ok: false, error: "Google returned a web page instead of running the script. In Apps Script open Deploy → Manage deployments → Edit and set “Who has access” to “Anyone” (not “Anyone with Google account”), then deploy a new version." };
  }
  return { ok: false, error: `The sheet script didn't answer properly (HTTP ${status}). Check that GOOGLE_SHEETS_WEBHOOK_URL is the Web app URL ending in /exec.` };
}

async function post(payload: Record<string, unknown>): Promise<SheetResult> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return { ok: false, error: "Google Sheets isn't connected yet." };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, ...payload }),
      redirect: "follow",
      // Apps Script can take 10–20 seconds to wake up when it hasn't run for a while.
      signal: AbortSignal.timeout(30_000),
    });
    const result = explain(response.status, await response.text());
    if (!result.ok) console.error("Google Sheets sync failed", payload.tab, result.error);
    return result;
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.error("Google Sheets sync failed", payload.tab, error);
    return { ok: false, error: timedOut ? "The sheet script took too long to answer. Try again in a minute." : "Couldn't reach the sheet script. Check the Web app URL." };
  }
}

/** Sends upserts and deletes for one tab. Never throws: a sheet outage must not block the site. */
export async function syncSheet(tab: SheetTab, upsert: SheetRow[], remove: string[] = []) {
  if (!sheetsEnabled()) return false;
  if (!upsert.length && !remove.length) return true;
  return (await post({ tab, upsert, delete: remove })).ok;
}

/** Checks the script answers and accepts our secret, without changing the sheet. */
export async function testSheetConnection() {
  return post({ tab: "Customers", upsert: [], delete: [] });
}

/** Pushes every customer, job, lead and booking. Used by the "Sync everything now" button. */
export async function syncEverything(db: Database): Promise<SheetResult> {
  const check = await testSheetConnection();
  if (!check.ok) return check;
  // One tab at a time: the script handles one request at a time anyway.
  const tabs: [SheetTab, SheetRow[]][] = [
    ["Customers", db.customers.map((customer) => customerSheetRow(customer, db.jobs))],
    ["Jobs", db.jobs.map((job) => jobSheetRow(job, db.customers))],
    ["Leads", db.leads.map(leadSheetRow)],
    ["Bookings", db.bookings.map(bookingSheetRow)],
  ];
  for (const [tab, rows] of tabs) {
    if (!rows.length) continue;
    const result = await post({ tab, upsert: rows, delete: [] });
    if (!result.ok) return result;
  }
  return { ok: true };
}
