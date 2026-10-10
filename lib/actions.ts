"use server";

import { createHash, timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { clearSession, devAdminPassword, getSession, setSession } from "@/lib/auth";
import { getBotReply } from "@/lib/bot";
import { SERVICE_CATEGORY_IDS, summariseJob, timeWindowLabel, validateDetails } from "@/lib/constants";
import { customerEmail, ownerLeadEmail, sendMail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { seedDatabase } from "@/lib/seed";
import { getDb, storeMediaFile, supabaseAnon, updateDb, usingSupabase } from "@/lib/store";
import type { ActionResult, Booking, Customer, Database, DetailValue, Faq, Job, Lead, Offer, Promo, ResultPair, Review, Service, Settings } from "@/lib/types";
import { bookingSheetRow, customerSheetRow, jobSheetRow, leadSheetRow, sheetsEnabled, syncEverything, syncSheet } from "@/lib/sheets";
import { byOrder, darwinISODate, escapeHtml, slugify, uid, uniqueReference } from "@/lib/utils";
import {
  bookingSchema,
  chatSchema,
  checkPromo,
  contactSchema,
  isPastDate,
  normalizeAuPhone,
  quoteSchema,
  reviewSchema,
} from "@/lib/validators";

function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

function fieldsOf(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

async function clientKey(action: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${action}:${ip}`;
}

function limited(key: string, limit: number, windowMs: number) {
  const result = rateLimit(key, limit, windowMs);
  return result.ok ? null : { ok: false as const, error: "Please wait a few minutes and try again." };
}

function refresh() {
  revalidatePath("/", "layout");
}

async function guard(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in again." };
  return { ok: true };
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

async function savePhotos(files: File[]) {
  const saved: string[] = [];
  for (const file of files.slice(0, 5)) {
    if (!IMAGE_TYPES.has(file.type) || file.size > 4_000_000) continue;
    try {
      saved.push(await storeMediaFile(file));
    } catch (error) {
      // A failed photo shouldn't lose the customer's quote request.
      console.error("Quote photo upload failed", error);
    }
  }
  return saved;
}

function honeypot(value: string | undefined) {
  return Boolean(value && value.trim());
}

function applyPromo(db: { promos: Promo[] }, code: string) {
  const result = checkPromo(code, db.promos);
  if (!result.ok || !result.promo) return { code: "", message: "" };
  result.promo.usedCount += 1;
  return { code: result.promo.code, message: result.message };
}

async function notify(settings: Settings, input: Parameters<typeof ownerLeadEmail>[1], customer?: { email: string; name: string; kind: string; reference: string }) {
  const owner = ownerLeadEmail(settings, input);
  const messages = [{ to: settings.notificationEmail || settings.email, subject: owner.subject, html: owner.html, text: owner.text }];
  if (customer?.email) {
    const note = customerEmail(settings, customer);
    messages.push({ to: customer.email, subject: note.subject, html: note.html, text: note.text });
  }
  return sendMail(messages);
}

async function syncLeadSheet(db: Database, reference: string) {
  if (!sheetsEnabled() || !reference) return;
  const lead = db.leads.find((item) => item.reference === reference);
  if (lead) await syncSheet("Leads", [leadSheetRow(lead)]);
}

async function syncBookingSheet(db: Database, reference: string) {
  if (!sheetsEnabled() || !reference) return;
  const booking = db.bookings.find((item) => item.reference === reference);
  if (booking) await syncSheet("Bookings", [bookingSheetRow(booking)]);
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const block = limited(await clientKey("login"), 8, 15 * 60 * 1000);
  if (block) return block;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const db = await getDb();
  if (!email || email !== db.settings.email.toLowerCase()) {
    return { ok: false, error: "Those details don't match the owner account." };
  }
  // ADMIN_PASSWORD always works when set; otherwise use the Supabase Auth user for this email.
  const envPassword = devAdminPassword();
  const anon = supabaseAnon();
  if (envPassword && safeEqual(password, envPassword)) {
    // Signed in with the admin password.
  } else if (usingSupabase() && anon) {
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error || data.user?.email?.toLowerCase() !== email) {
      return { ok: false, error: "Those details don't match the owner account." };
    }
  } else {
    return { ok: false, error: "Those details don't match the owner account." };
  }
  await setSession(email);
  return { ok: true };
}

export async function logoutAction() {
  await clearSession();
  return { ok: true as const };
}

export async function checkPromoAction(code: string) {
  const db = await getDb();
  if (!code.trim()) return { ok: true, message: "" };
  const result = checkPromo(code, db.promos);
  return { ok: result.ok, message: result.message };
}

export async function botReplyAction(text: string) {
  const block = limited(await clientKey("bot"), 30, 60 * 1000);
  if (block) return { reply: block.error, intent: "unknown" as const };
  const db = await getDb();
  return getBotReply({ text: text.slice(0, 500), faqs: db.faqs });
}

export async function submitQuote(formData: FormData): Promise<ActionResult> {
  const block = limited(await clientKey("quote"), 5, 10 * 60 * 1000);
  if (block) return block;
  const raw = {
    service: String(formData.get("service") || ""),
    size: String(formData.get("size") || ""),
    suburb: String(formData.get("suburb") || ""),
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    notes: String(formData.get("notes") || ""),
    promo: String(formData.get("promo") || ""),
    company_website: String(formData.get("company_website") || ""),
  };
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please check the form.", fields: fieldsOf(parsed.error) };
  if (honeypot(parsed.data.company_website)) return { ok: true, reference: "SNT-000000", emailed: false };
  const db = await getDb();
  const service = db.services.find((item) => item.slug === parsed.data.service && item.visible);
  if (!service && parsed.data.service !== "not-sure") return { ok: false, error: "Choose a service.", fields: { service: "Choose a service." } };
  const photos = await savePhotos(formData.getAll("photos").filter((item): item is File => item instanceof File));
  const phone = normalizeAuPhone(parsed.data.phone) || parsed.data.phone;
  let reference = "";
  let promoMessage = "";
  let emailed = false;
  const settings = db.settings;
  const saved = await updateDb((next) => {
    reference = uniqueReference([...next.leads.map((lead) => lead.reference), ...next.bookings.map((booking) => booking.reference)]);
    const promo = applyPromo(next, parsed.data.promo);
    promoMessage = promo.message;
    const summary = service ? service.title : "Not sure yet";
    const lead: Lead = {
      id: uid("lead"),
      reference,
      source: "quote",
      status: "new",
      name: parsed.data.name,
      phone,
      email: parsed.data.email,
      suburb: parsed.data.suburb,
      services: service ? [service.slug] : [],
      details: { size: parsed.data.size },
      summary: `${summary} — ${parsed.data.size}`,
      notes: parsed.data.notes,
      internalNotes: "",
      promoCode: promo.code,
      promoMessage,
      photos,
      message: parsed.data.notes,
      preferredTime: "",
      createdAt: new Date().toISOString(),
    };
    next.leads.unshift(lead);
  });
  emailed = await notify(settings, {
    kind: "quote",
    reference,
    name: parsed.data.name,
    phone,
    email: parsed.data.email,
    suburb: parsed.data.suburb,
    summary: `${service?.title ?? "Not sure"} — ${parsed.data.size}`,
    message: [parsed.data.notes, promoMessage].filter(Boolean).join("\n"),
    extra: photos.length ? `${photos.length} photo${photos.length === 1 ? "" : "s"} attached in admin.` : "",
  }, { email: parsed.data.email, name: parsed.data.name, kind: "quote request", reference });
  await syncLeadSheet(saved, reference);
  refresh();
  return { ok: true, reference, emailed, message: promoMessage };
}

export async function submitContact(formData: FormData): Promise<ActionResult> {
  const block = limited(await clientKey("contact"), 5, 10 * 60 * 1000);
  if (block) return block;
  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    message: String(formData.get("message") || ""),
    company_website: String(formData.get("company_website") || ""),
  });
  if (!parsed.success) return { ok: false, error: "Please check the form.", fields: fieldsOf(parsed.error) };
  if (honeypot(parsed.data.company_website)) return { ok: true, reference: "SNT-000000", emailed: false };
  const db = await getDb();
  const phone = parsed.data.phone ? normalizeAuPhone(parsed.data.phone) || "" : "";
  let reference = "";
  const saved = await updateDb((next) => {
    reference = uniqueReference([...next.leads.map((lead) => lead.reference), ...next.bookings.map((item) => item.reference)]);
    next.leads.unshift({
      id: uid("lead"),
      reference,
      source: "contact",
      status: "new",
      name: parsed.data.name,
      phone,
      email: parsed.data.email,
      suburb: "",
      services: [],
      details: {},
      summary: "Contact message",
      notes: "",
      internalNotes: "",
      promoCode: "",
      promoMessage: "",
      photos: [],
      message: parsed.data.message,
      preferredTime: "",
      createdAt: new Date().toISOString(),
    });
  });
  const emailed = await notify(db.settings, {
    kind: "contact message",
    reference,
    name: parsed.data.name,
    phone,
    email: parsed.data.email,
    suburb: "",
    summary: "",
    message: parsed.data.message,
    extra: "",
  }, { email: parsed.data.email, name: parsed.data.name, kind: "message", reference });
  await syncLeadSheet(saved, reference);
  refresh();
  return { ok: true, reference, emailed };
}

export async function submitChat(input: unknown): Promise<ActionResult> {
  const block = limited(await clientKey("chat"), 5, 10 * 60 * 1000);
  if (block) return block;
  const parsed = chatSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check those details.", fields: fieldsOf(parsed.error) };
  if (honeypot(parsed.data.company_website)) return { ok: true, reference: "SNT-000000" };
  const detailError = validateDetails(parsed.data.services, parsed.data.details);
  if (detailError) return { ok: false, error: detailError };
  const db = await getDb();
  const allowed = new Set([...db.services.filter((service) => service.visible).map((service) => service.slug), "something-else"]);
  const services = parsed.data.services.filter((slug) => allowed.has(slug));
  if (!services.length) return { ok: false, error: "Choose at least one service." };
  const phone = normalizeAuPhone(parsed.data.phone) || parsed.data.phone;
  let reference = "";
  let promoMessage = "";
  const saved = await updateDb((next) => {
    reference = uniqueReference([...next.leads.map((lead) => lead.reference), ...next.bookings.map((item) => item.reference)]);
    const promo = applyPromo(next, parsed.data.promo);
    promoMessage = promo.message;
    const summary = summariseJob(services, parsed.data.details).join("\n");
    next.leads.unshift({
      id: uid("lead"),
      reference,
      source: "chat",
      status: "new",
      name: parsed.data.name,
      phone,
      email: "",
      suburb: parsed.data.suburb,
      services,
      details: parsed.data.details,
      summary,
      notes: "",
      internalNotes: "",
      promoCode: promo.code,
      promoMessage,
      photos: [],
      message: "",
      preferredTime: parsed.data.preferredTime,
      createdAt: new Date().toISOString(),
    });
  });
  await notify(db.settings, {
    kind: "chat callback",
    reference,
    name: parsed.data.name,
    phone,
    email: "",
    suburb: parsed.data.suburb,
    summary: summariseJob(services, parsed.data.details).join("\n"),
    message: promoMessage,
    extra: parsed.data.preferredTime ? `Preferred time: ${parsed.data.preferredTime}` : "",
  });
  await syncLeadSheet(saved, reference);
  refresh();
  return { ok: true, reference, message: promoMessage };
}

export async function submitBooking(input: unknown): Promise<ActionResult> {
  const block = limited(await clientKey("booking"), 5, 10 * 60 * 1000);
  if (block) return block;
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the booking.", fields: fieldsOf(parsed.error) };
  if (honeypot(parsed.data.company_website)) return { ok: true, reference: "SNT-000000" };
  if (!["7-10", "10-1", "1-4", "4-6"].includes(parsed.data.timeWindow)) {
    return { ok: false, error: "Choose a time window.", fields: { timeWindow: "Choose a time window." } };
  }
  if (isPastDate(parsed.data.date)) return { ok: false, error: "Choose a date that is today or later.", fields: { date: "Choose a future date." } };
  const detailError = validateDetails(parsed.data.services, parsed.data.details);
  if (detailError) return { ok: false, error: detailError };
  const db = await getDb();
  if (db.blockedDates.some((item) => item.date === parsed.data.date)) {
    return { ok: false, error: "That date is unavailable. Please choose another day.", fields: { date: "That date is unavailable." } };
  }
  const allowed = new Set(db.services.filter((service) => service.visible).map((service) => service.slug));
  const services = parsed.data.services.filter((slug) => allowed.has(slug));
  if (!services.length) return { ok: false, error: "Choose at least one service." };
  const phone = normalizeAuPhone(parsed.data.phone) || parsed.data.phone;
  const summary = summariseJob(services, parsed.data.details).join("\n");
  let reference = "";
  let promoMessage = "";
  const saved = await updateDb((next) => {
    reference = uniqueReference([...next.leads.map((lead) => lead.reference), ...next.bookings.map((item) => item.reference)]);
    const promo = applyPromo(next, parsed.data.promo);
    promoMessage = promo.message;
    const booking: Booking = {
      id: uid("book"),
      reference,
      status: "new",
      name: parsed.data.name,
      phone,
      email: parsed.data.email,
      services,
      details: parsed.data.details as Record<string, DetailValue>,
      summary,
      date: parsed.data.date,
      timeWindow: parsed.data.timeWindow,
      address: parsed.data.address,
      suburb: parsed.data.suburb,
      notes: parsed.data.notes,
      internalNotes: "",
      promoCode: promo.code,
      promoMessage,
      createdAt: new Date().toISOString(),
    };
    next.bookings.unshift(booking);
  });
  const emailed = await notify(db.settings, {
    kind: "booking request",
    reference,
    name: parsed.data.name,
    phone,
    email: parsed.data.email,
    suburb: parsed.data.suburb,
    summary,
    message: [parsed.data.notes, promoMessage && `Promo code: ${parsed.data.promo.toUpperCase()} — ${promoMessage}`].filter(Boolean).join("\n"),
    extra: `${parsed.data.date} · ${timeWindowLabel(parsed.data.timeWindow)} · ${parsed.data.address}`,
  }, { email: parsed.data.email, name: parsed.data.name, kind: "booking request", reference });
  await syncBookingSheet(saved, reference);
  refresh();
  return { ok: true, reference, emailed, message: promoMessage };
}

const optionalUrl = z.string().trim().max(300).refine((value) => value === "" || /^https?:\/\/.+/i.test(value), "Enter a full http or https link, or leave it blank.");

const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(80),
  shortName: z.string().trim().min(2).max(40),
  phoneDisplay: z.string().trim().min(8).max(20),
  phoneTel: z.string().trim().min(8).max(20),
  whatsappUrl: optionalUrl,
  email: z.string().trim().email(),
  notificationEmail: z.string().trim().email(),
  address: z.string().trim().max(160),
  serviceAreas: z.array(z.string().trim().min(2).max(80)).min(1),
  facebook: optionalUrl,
  instagram: optionalUrl,
  tiktok: optionalUrl,
  google: optionalUrl,
  youtube: optionalUrl,
  abn: z.string().trim().max(20),
  licence: z.string().trim().max(80),
  insurance: z.string().trim().max(120),
  openingHours: z.array(z.object({ day: z.string().min(3).max(20), hours: z.string().max(40) })).length(7),
  seoTitle: z.string().trim().min(10).max(90),
  seoDescription: z.string().trim().min(20).max(200),
  heroHeadline: z.string().trim().min(4).max(90),
  heroSubtext: z.string().trim().min(10).max(280),
  heroImage: z.string().max(500),
  heroVideo: z.string().max(500),
  teamPhoto: z.string().max(500),
  ogImage: z.string().max(500),
  stats: z.array(z.object({ value: z.string().max(20), label: z.string().max(40) })).max(3),
});

export async function saveSettingsAction(input: Settings): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  const parsed = settingsSchema.safeParse({ ...input, stats: input.stats.filter((stat) => stat.value.trim() && stat.label.trim()) });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || "Check the settings." };
  await updateDb((db) => {
    db.settings = parsed.data;
  });
  refresh();
  return { ok: true, message: "Settings saved." };
}

export async function saveServiceAction(service: Service): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (!service.title.trim() || !service.slug.trim()) return { ok: false, error: "A service needs a title." };
  if (!SERVICE_CATEGORY_IDS.includes(service.category)) return { ok: false, error: "Choose a category." };
  service = { ...service, gallery: service.gallery.map((url) => url.trim()).filter(Boolean).slice(0, 24) };
  await updateDb((db) => {
    const index = db.services.findIndex((item) => item.id === service.id);
    if (index >= 0) db.services[index] = service;
    else db.services.push({ ...service, order: db.services.length + 1 });
  });
  refresh();
  return { ok: true, message: "Service saved." };
}

export async function reorderAction(kind: "services" | "offers" | "results" | "reviews" | "faqs", id: string, direction: -1 | 1): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => {
    const move = <T extends { id: string; order: number }>(list: T[]) => {
      const sorted = byOrder(list);
      const index = sorted.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= sorted.length) return;
      const [item] = sorted.splice(index, 1);
      sorted.splice(target, 0, item);
      sorted.forEach((entry, order) => {
        entry.order = order + 1;
      });
    };
    if (kind === "services") move(db.services);
    else if (kind === "offers") move(db.offers);
    else if (kind === "results") move(db.results);
    else if (kind === "reviews") move(db.reviews);
    else move(db.faqs);
  });
  refresh();
  return { ok: true };
}

export async function saveOfferAction(offer: Offer): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (offer.title.trim().length < 2) return { ok: false, error: "Add a title." };
  await updateDb((db) => {
    if (offer.showOnBanner) db.offers.forEach((item) => { item.showOnBanner = item.id === offer.id; });
    const index = db.offers.findIndex((item) => item.id === offer.id);
    if (index >= 0) db.offers[index] = offer;
    else db.offers.push({ ...offer, order: db.offers.length + 1 });
  });
  refresh();
  return { ok: true, message: "Offer saved." };
}

export async function deleteOfferAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.offers = db.offers.filter((item) => item.id !== id); });
  refresh();
  return { ok: true };
}

export async function savePromoAction(promo: Promo): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (!/^[A-Za-z0-9-]{3,20}$/.test(promo.code)) return { ok: false, error: "Use 3–20 letters or numbers for the code." };
  if (promo.amount <= 0) return { ok: false, error: "Add a discount amount." };
  await updateDb((db) => {
    const index = db.promos.findIndex((item) => item.id === promo.id);
    const next = { ...promo, code: promo.code.toUpperCase() };
    if (index >= 0) db.promos[index] = next;
    else db.promos.push(next);
  });
  refresh();
  return { ok: true, message: "Promo code saved." };
}

export async function deletePromoAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.promos = db.promos.filter((item) => item.id !== id); });
  refresh();
  return { ok: true };
}

export async function updateLeadAction(id: string, patch: { status?: Lead["status"]; internalNotes?: string }): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  const saved = await updateDb((db) => {
    const lead = db.leads.find((item) => item.id === id);
    if (!lead) return;
    if (patch.status) lead.status = patch.status;
    if (patch.internalNotes !== undefined) lead.internalNotes = patch.internalNotes.slice(0, 2000);
  });
  const lead = saved.leads.find((item) => item.id === id);
  if (lead && sheetsEnabled()) await syncSheet("Leads", [leadSheetRow(lead)]);
  refresh();
  return { ok: true };
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.leads = db.leads.filter((item) => item.id !== id); });
  await syncSheet("Leads", [], [id]);
  refresh();
  return { ok: true };
}

export async function updateBookingAction(id: string, patch: { status?: Booking["status"]; internalNotes?: string }): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  const saved = await updateDb((db) => {
    const booking = db.bookings.find((item) => item.id === id);
    if (!booking) return;
    if (patch.status) booking.status = patch.status;
    if (patch.internalNotes !== undefined) booking.internalNotes = patch.internalNotes.slice(0, 2000);
  });
  const booking = saved.bookings.find((item) => item.id === id);
  if (booking && sheetsEnabled()) await syncSheet("Bookings", [bookingSheetRow(booking)]);
  refresh();
  return { ok: true };
}

export async function deleteBookingAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.bookings = db.bookings.filter((item) => item.id !== id); });
  await syncSheet("Bookings", [], [id]);
  refresh();
  return { ok: true };
}

export async function saveBlockedDateAction(date: string, reason: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Choose a date." };
  await updateDb((db) => {
    if (db.blockedDates.some((item) => item.date === date)) return;
    db.blockedDates.push({ id: uid("block"), date, reason: reason.slice(0, 120) });
  });
  refresh();
  return { ok: true };
}

export async function deleteBlockedDateAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.blockedDates = db.blockedDates.filter((item) => item.id !== id); });
  refresh();
  return { ok: true };
}

export async function saveResultAction(result: ResultPair): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => {
    const index = db.results.findIndex((item) => item.id === result.id);
    if (index >= 0) db.results[index] = result;
    else db.results.push({ ...result, order: db.results.length + 1 });
  });
  refresh();
  return { ok: true, message: "Before and after saved." };
}

export async function deleteResultAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.results = db.results.filter((item) => item.id !== id); });
  refresh();
  return { ok: true };
}

export async function saveReviewAction(review: Review): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (review.name.trim().length < 2 || review.text.trim().length < 5) return { ok: false, error: "Add a name and the review text." };
  await updateDb((db) => {
    const index = db.reviews.findIndex((item) => item.id === review.id);
    const next = { ...review, rating: Math.min(5, Math.max(1, review.rating)) };
    if (index >= 0) db.reviews[index] = next;
    else db.reviews.push({ ...next, order: db.reviews.length + 1 });
  });
  refresh();
  return { ok: true, message: "Review saved." };
}

export async function moderateReviewAction(id: string, status: Review["status"]): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (!["pending", "approved", "rejected"].includes(status)) return { ok: false, error: "Unknown status." };
  await updateDb((db) => {
    const review = db.reviews.find((item) => item.id === id);
    if (review) review.status = status;
  });
  refresh();
  return { ok: true, message: status === "approved" ? "Review approved. It is now on the website." : status === "rejected" ? "Review rejected. It stays hidden." : "Moved back to pending." };
}

export async function submitReviewAction(input: unknown): Promise<ActionResult> {
  const block = limited(await clientKey("review"), 3, 30 * 60 * 1000);
  if (block) return block;
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check your review.", fields: fieldsOf(parsed.error) };
  if (honeypot(parsed.data.company_website)) return { ok: true };
  const db = await getDb();
  await updateDb((next) => {
    next.reviews.push({
      id: uid("rev"),
      name: parsed.data.name,
      text: parsed.data.text,
      service: parsed.data.service,
      rating: parsed.data.rating,
      date: new Date().toISOString().slice(0, 10),
      source: "customer",
      status: "pending",
      email: parsed.data.email,
      suburb: parsed.data.suburb,
      order: next.reviews.length + 1,
    });
  });
  await sendMail([{
    to: db.settings.notificationEmail || db.settings.email,
    subject: `New ${parsed.data.rating}-star review waiting for approval — ${parsed.data.name}`,
    html: `<p><strong>${escapeHtml(parsed.data.name)}</strong> left a ${parsed.data.rating}-star review${parsed.data.service ? ` for ${escapeHtml(parsed.data.service)}` : ""}.</p><blockquote>${escapeHtml(parsed.data.text)}</blockquote><p>Open the admin panel, Reviews, to approve or reject it.</p>`,
    text: `${parsed.data.name} left a ${parsed.data.rating}-star review: ${parsed.data.text}\nOpen the admin panel to approve or reject it.`,
  }]);
  refresh();
  return { ok: true, message: "Your review has been sent to our team and will appear on the website once it is approved." };
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.reviews = db.reviews.filter((item) => item.id !== id); });
  refresh();
  return { ok: true };
}

export async function saveFaqAction(faq: Faq): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (faq.question.trim().length < 5 || faq.answer.trim().length < 5) return { ok: false, error: "Add a question and an answer." };
  await updateDb((db) => {
    const index = db.faqs.findIndex((item) => item.id === faq.id);
    if (index >= 0) db.faqs[index] = faq;
    else db.faqs.push({ ...faq, order: db.faqs.length + 1 });
  });
  refresh();
  return { ok: true, message: "FAQ saved." };
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.faqs = db.faqs.filter((item) => item.id !== id); });
  refresh();
  return { ok: true };
}

export async function uploadMediaAction(formData: FormData): Promise<ActionResult & { url?: string }> {
  const auth = await guard();
  if (!auth.ok) return auth;
  const file = formData.get("file");
  const slot = String(formData.get("slot") || "gallery");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file." };
  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) return { ok: false, error: "Use a JPG, PNG, WEBP, GIF, MP4 or WEBM file." };
  if (isImage && file.size > 8_000_000) return { ok: false, error: "Images need to be under 8MB." };
  if (isVideo && file.size > 40_000_000) return { ok: false, error: "Videos need to be under 40MB." };
  let url: string;
  try {
    url = await storeMediaFile(file);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Upload failed." };
  }
  await updateDb((db) => {
    db.media.unshift({ id: uid("media"), name: file.name, url, kind: isVideo ? "video" : "image", slot, createdAt: new Date().toISOString() });
    assignSlot(db, url, slot);
  });
  refresh();
  return { ok: true, message: "File uploaded.", url };
}

function assignSlot(db: { settings: Settings; services: Service[]; media: { slot: string; url: string }[] }, url: string, slot: string) {
  if (slot === "hero-image") db.settings.heroImage = url;
  if (slot === "hero-video") db.settings.heroVideo = url;
  if (slot === "team-photo") db.settings.teamPhoto = url;
  if (slot === "og-image") db.settings.ogImage = url;
  if (slot.startsWith("service-video:")) {
    const service = db.services.find((item) => item.slug === slot.slice("service-video:".length));
    if (service) service.videoUrl = url;
  }
  if (slot.startsWith("service-image:")) {
    const service = db.services.find((item) => item.slug === slot.slice("service-image:".length));
    if (service) service.image = url;
  }
  if (slot.startsWith("service-gallery:")) {
    const service = db.services.find((item) => item.slug === slot.slice("service-gallery:".length));
    if (service && !service.gallery.includes(url)) service.gallery.push(url);
  }
}

export async function assignMediaAction(url: string, slot: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => {
    const media = db.media.find((item) => item.url === url);
    if (media) media.slot = slot;
    assignSlot(db, url, slot);
  });
  refresh();
  return { ok: true, message: "Media updated." };
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  await updateDb((db) => { db.media = db.media.filter((item) => item.id !== id); });
  refresh();
  return { ok: true };
}

export async function resetLocalDataAction(): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (usingSupabase()) return { ok: false, error: "Reset is only for the local file database." };
  await updateDb((db) => {
    const fresh = seedDatabase();
    db.settings = fresh.settings;
    db.services = fresh.services;
    db.offers = fresh.offers;
    db.promos = fresh.promos;
    db.leads = [];
    db.bookings = [];
    db.results = fresh.results;
    db.reviews = fresh.reviews;
    db.faqs = fresh.faqs;
    db.blockedDates = [];
    db.media = [];
  });
  refresh();
  return { ok: true, message: "Starter content restored." };
}

export async function createServiceAction(title: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  const name = title.trim();
  if (name.length < 3) return { ok: false, error: "Add a service name." };
  await updateDb((db) => {
    const base = slugify(name) || `service-${db.services.length + 1}`;
    let slug = base;
    let n = 2;
    while (db.services.some((service) => service.slug === slug)) slug = `${base}-${n++}`;
    db.services.push({
      id: uid("svc"),
      slug,
      title: name,
      summary: "Tell customers what this clean includes.",
      description: "Describe the service, what you need from the customer, and what a good result looks like.",
      included: ["Fixed quote before we start"],
      bestFor: ["Homes around Darwin"],
      process: [{ title: "Quote", detail: "We confirm the price before we begin." }],
      faqs: [],
      icon: "layers",
      category: "specialty-and-urgent",
      priceFrom: "",
      duration: "",
      image: "",
      videoUrl: "",
      gallery: [],
      order: db.services.length + 1,
      visible: false,
      related: [],
    });
  });
  refresh();
  return { ok: true, message: "Service added. It stays hidden until you switch it on." };
}

/* ------------------------------------------------------------------ */
/* Customers, jobs and offer messages                                   */
/* ------------------------------------------------------------------ */

function nowIso() {
  return new Date().toISOString();
}

function jobReference(existing: string[]) {
  const used = new Set(existing);
  let code = "";
  do code = `JOB-${Math.floor(10000 + Math.random() * 90000)}`;
  while (used.has(code));
  return code;
}

async function syncCustomerSheets(db: Database, customerIds: string[], jobIds: string[] = [], removed: { customers?: string[]; jobs?: string[] } = {}) {
  if (!sheetsEnabled()) return;
  await Promise.all([
    syncSheet("Customers", db.customers.filter((item) => customerIds.includes(item.id)).map((item) => customerSheetRow(item, db.jobs)), removed.customers ?? []),
    syncSheet("Jobs", db.jobs.filter((item) => jobIds.includes(item.id)).map((item) => jobSheetRow(item, db.customers)), removed.jobs ?? []),
  ]);
}

const customerSchema = z.object({
  type: z.enum(["person", "company"]),
  name: z.string().trim().min(2, "Add the contact name").max(100),
  companyName: z.string().trim().max(120),
  phone: z.string().trim().max(30).refine((value) => value === "" || normalizeAuPhone(value) !== null, "Enter an Australian phone number, or leave it blank"),
  email: z.string().trim().max(120).refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email, or leave it blank"),
  address: z.string().trim().max(200),
  suburb: z.string().trim().max(80),
  notes: z.string().trim().max(3000),
  marketingOptIn: z.boolean(),
});

export async function saveCustomerAction(customer: Customer): Promise<ActionResult & { id?: string }> {
  const auth = await guard();
  if (!auth.ok) return auth;
  const parsed = customerSchema.safeParse(customer);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || "Check the customer details." };
  if (parsed.data.type === "company" && parsed.data.companyName.length < 2) return { ok: false, error: "Add the company name." };
  const phone = parsed.data.phone ? normalizeAuPhone(parsed.data.phone) || parsed.data.phone : "";
  const id = customer.id || uid("cust");
  const saved = await updateDb((db) => {
    const index = db.customers.findIndex((item) => item.id === id);
    const next: Customer = { ...parsed.data, phone, id, createdAt: index >= 0 ? db.customers[index].createdAt : nowIso(), updatedAt: nowIso() };
    if (index >= 0) db.customers[index] = next;
    else db.customers.unshift(next);
  });
  await syncCustomerSheets(saved, [id]);
  revalidatePath("/admin", "layout");
  return { ok: true, id, message: "Customer saved." };
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  let jobIds: string[] = [];
  const saved = await updateDb((db) => {
    jobIds = db.jobs.filter((job) => job.customerId === id).map((job) => job.id);
    db.customers = db.customers.filter((item) => item.id !== id);
    db.jobs = db.jobs.filter((job) => job.customerId !== id);
  });
  await syncCustomerSheets(saved, [], [], { customers: [id], jobs: jobIds });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Customer and their jobs deleted." };
}

const JOB_STATUS_IDS = ["scheduled", "in-progress", "done", "complaint", "redo", "cancelled"] as const;

export async function saveJobAction(job: Job, note = ""): Promise<ActionResult & { id?: string }> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (!job.customerId) return { ok: false, error: "Choose a customer." };
  if (job.services.trim().length < 2) return { ok: false, error: "Describe the job (services)." };
  if (!JOB_STATUS_IDS.includes(job.status)) return { ok: false, error: "Choose a status." };
  const urls = (items: string[]) => items.map((item) => item.trim()).filter(Boolean).slice(0, 30);
  const id = job.id || uid("job");
  let missingCustomer = false;
  const saved = await updateDb((db) => {
    if (!db.customers.some((item) => item.id === job.customerId)) {
      missingCustomer = true;
      return;
    }
    const index = db.jobs.findIndex((item) => item.id === id);
    const previous = index >= 0 ? db.jobs[index] : null;
    const history = [...(previous?.history ?? [])];
    // Every status change, and any note added with it, goes into the job's history.
    if (!previous || previous.status !== job.status || note.trim()) {
      history.push({ at: nowIso(), status: job.status, note: note.trim().slice(0, 1000) || (previous ? "" : "Job created") });
    }
    const next: Job = {
      ...job,
      id,
      reference: previous?.reference || job.reference || jobReference(db.jobs.map((item) => item.reference)),
      services: job.services.trim().slice(0, 500),
      notes: job.notes.slice(0, 3000),
      price: job.price.trim().slice(0, 40),
      completedDate: job.status === "done" && !job.completedDate ? darwinISODate() : job.completedDate,
      beforePhotos: urls(job.beforePhotos),
      afterPhotos: urls(job.afterPhotos),
      history,
      createdAt: previous?.createdAt || nowIso(),
      updatedAt: nowIso(),
    };
    if (index >= 0) db.jobs[index] = next;
    else db.jobs.unshift(next);
  });
  if (missingCustomer) return { ok: false, error: "That customer no longer exists." };
  await syncCustomerSheets(saved, [job.customerId], [id]);
  revalidatePath("/admin", "layout");
  return { ok: true, id, message: "Job saved." };
}

export async function deleteJobAction(id: string): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  let customerId = "";
  const saved = await updateDb((db) => {
    customerId = db.jobs.find((job) => job.id === id)?.customerId ?? "";
    db.jobs = db.jobs.filter((job) => job.id !== id);
  });
  await syncCustomerSheets(saved, customerId ? [customerId] : [], [], { jobs: [id] });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Job deleted." };
}

/** Turns a website enquiry or booking into a customer (matched by phone) and a scheduled job. */
export async function convertToCustomerAction(kind: "lead" | "booking", id: string): Promise<ActionResult & { id?: string }> {
  const auth = await guard();
  if (!auth.ok) return auth;
  let customerId = "";
  let jobId = "";
  let found = true;
  const saved = await updateDb((db) => {
    const lead = kind === "lead" ? db.leads.find((item) => item.id === id) : undefined;
    const booking = kind === "booking" ? db.bookings.find((item) => item.id === id) : undefined;
    const source = lead ?? booking;
    if (!source) {
      found = false;
      return;
    }
    const phone = normalizeAuPhone(source.phone) || source.phone;
    const existing = phone ? db.customers.find((item) => (normalizeAuPhone(item.phone) || item.phone) === phone) : undefined;
    const address = booking ? `${booking.address}, ${booking.suburb}` : lead?.suburb ?? "";
    if (existing) {
      customerId = existing.id;
      if (!existing.email && source.email) existing.email = source.email;
      if (!existing.address && address) existing.address = address;
      existing.updatedAt = nowIso();
    } else {
      customerId = uid("cust");
      db.customers.unshift({
        id: customerId,
        type: "person",
        name: source.name,
        companyName: "",
        phone,
        email: source.email,
        address,
        suburb: booking?.suburb ?? lead?.suburb ?? "",
        notes: "",
        marketingOptIn: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
    jobId = uid("job");
    const promo = source.promoCode ? `\nPromo: ${source.promoCode} (${source.promoMessage})` : "";
    db.jobs.unshift({
      id: jobId,
      reference: jobReference(db.jobs.map((item) => item.reference)),
      customerId,
      services: (source.summary || "").slice(0, 500),
      address,
      scheduledDate: booking?.date ?? "",
      completedDate: "",
      price: "",
      status: "scheduled",
      notes: `${lead?.message || booking?.notes || ""}${promo}`.trim(),
      beforePhotos: [],
      afterPhotos: [],
      history: [{ at: nowIso(), status: "scheduled", note: `Created from website ${kind} ${source.reference}` }],
      sourceRef: source.reference,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    source.status = "booked";
  });
  if (!found) return { ok: false, error: "That enquiry no longer exists." };
  await syncCustomerSheets(saved, [customerId], [jobId]);
  const lead = saved.leads.find((item) => item.id === id);
  const booking = saved.bookings.find((item) => item.id === id);
  if (lead) await syncSheet("Leads", [leadSheetRow(lead)]);
  if (booking) await syncSheet("Bookings", [bookingSheetRow(booking)]);
  revalidatePath("/admin", "layout");
  return { ok: true, id: customerId, message: "Customer and job created." };
}

export async function logCampaignAction(input: { title: string; message: string; channel: "whatsapp" | "sms"; recipientIds: string[] }): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (input.message.trim().length < 5) return { ok: false, error: "Write the message first." };
  if (!input.recipientIds.length) return { ok: false, error: "Nobody was sent this message." };
  await updateDb((db) => {
    const allowed = new Set(db.customers.filter((item) => item.marketingOptIn).map((item) => item.id));
    db.campaigns.unshift({
      id: uid("camp"),
      title: input.title.trim().slice(0, 120) || "Offer",
      message: input.message.trim().slice(0, 1000),
      channel: input.channel,
      recipientIds: input.recipientIds.filter((item) => allowed.has(item)),
      createdAt: nowIso(),
    });
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Saved to message history." };
}

export async function syncSheetsAction(): Promise<ActionResult> {
  const auth = await guard();
  if (!auth.ok) return auth;
  if (!sheetsEnabled()) return { ok: false, error: "Google Sheets isn't connected yet. Add GOOGLE_SHEETS_WEBHOOK_URL and GOOGLE_SHEETS_SECRET in Vercel." };
  const ok = await syncEverything(await getDb());
  return ok ? { ok: true, message: "Google Sheet updated." } : { ok: false, error: "The sheet didn't accept the update. Check the Apps Script deployment and secret." };
}
