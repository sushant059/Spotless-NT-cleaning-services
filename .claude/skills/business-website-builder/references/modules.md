# Modules: what each does, where it lives, what to change

Paths are in the template repo. Next.js 15 App Router, TypeScript, Tailwind 3, server actions, zod. One data layer for everything.

## Data layer (keep as is)
- `lib/types.ts`: all types and the `Database` shape.
- `lib/store.ts`: `getDb()` (React `cache`, per request) and `updateDb(fn)`. Uses Supabase when `SUPABASE_SERVICE_ROLE_KEY` is set, otherwise a JSON file (`data/db.json`, `/tmp` on Vercel). Saves are **diff-based**: only changed rows are upserted, removed rows deleted. `normalizeDb` back-fills fields added later, so old data never breaks. After `updateDb`, use the db it returns (not `getDb()`, which is cached).
- `lib/seed.ts`: starting content (services, FAQs, offers, sample reviews marked as samples, settings). Rewrite for each business.
- Adding a table: type in `types.ts` → `normalizeDb` default → `map*`/`*Row` in `store.ts` → load in `loadSupabase` → `replaceRows` in `snapshot` → SQL in `supabase/schema.sql` → seed `[]`.

## Public site — `app/(site)/`
- Home `page.tsx`: full-screen video hero with category photo picker and a promise strip, category showcase, swipeable service cards, offers, video showcase, before/after, team collage, how-it-works over a photo, pillars, reviews, service area checker, FAQs, CTA band.
- `services/` + `services/[slug]`: category showcase; detail page with hero photo, video, included/perfect-for, process timeline, results, gallery, reviews, FAQs, sticky quote card, JSON-LD.
- `booking`, `free-quote`, `contact`, `offers`, `results`, `reviews`, `faqs`, `why-us`, `how-it-works`, `privacy`, `terms`.
- Shared UI: `components/content.tsx` (PageHero with photo, SectionHeading, ServiceCard, CategoryShowcase, TeamVisual, CtaBand, ReviewCard, Steps, Pillars, FaqList), `components/photo.tsx` (`Photo` with fallback chain; `BackgroundVideo`; `ClipPlayer`), `components/before-after.tsx` (drag slider; example photo/illustration toggle when no real photos).
- Layout: `components/layout/header.tsx` (mega menu, full-screen mobile menu rendered in a portal), `footer.tsx`, `floating.tsx` (mobile bottom bar Call/WhatsApp/Chat/Quote; floating bubbles desktop only), `offer-banner.tsx`.
- Stock media: `lib/stock.ts` maps services/categories/pages to free Pexels photos and clips. Admin uploads always win.

## Chatbot — `components/chat/chat-widget.tsx`, `lib/bot.ts`
Guided flow with chips: service(s) → service-specific questions (steppers/toggles from `fieldQuestion`) → suburb → name → phone → done message ("our team will contact you"). Saves a Lead with a reference (SNT-xxxxxx). Opens from any `[data-open-chat]` button.

## Booking + calendar — `components/forms/booking-form.tsx`, `lib/schedule.ts`, `components/admin/calendar.tsx`
Booking form fetches `availabilityAction(date)`; taken slots are disabled and labelled "Booked". The server re-checks inside `updateDb` so two people can't take the last slot. Admin calendar: month grid, day panel with slots and occupants, block/unblock days, "coming up" list. A booking holds its slot until it's marked lost or converted (then its job holds it).

## CRM — `lib/crm.ts`, `components/admin/customers.tsx`
Every chatbot, quote and booking enquiry calls `linkEnquiry`: it finds the customer (phone **and** first name or email must match, so two people sharing a phone stay separate) or creates one, and creates a job with status `requested` ("New request"). Admin: Confirm job → Start → Mark done → Log complaint → Book redo → Cancel; every change goes into the job history. Before/after photo uploads per job. Duplicate manual customers (same name + phone) are blocked and the existing record opens. Marking an enquiry "lost" cancels its requested job and frees the slot.

## Invoices — `lib/invoice.ts`, `components/admin/invoices.tsx`, `components/invoice/document.tsx`, `app/invoice/[token]`
Create from a job (lines and price prefilled) or from scratch; discount, notes; INV-1001 numbering; GST shown as 1/11 of the total when "Registered for GST" (needs ABN) and titled "Tax invoice"; bank details from Settings. Send by email/text (automatic with Gmail/ClickSend keys, otherwise opens the email app / Messages) or WhatsApp. Customer gets a private token link to view, print, save as PDF; drafts are not public. Statuses: draft, sent, overdue (computed), paid, void. List shows waiting / overdue / paid this month. For non-Australian businesses change currency (`money()`), tax name and rate.

## Offers, promo codes, messaging — `components/admin/editors.tsx` (OffersEditor), `components/admin/messages.tsx`
Offers show on the site and banner; promo codes validated on the booking form. Each promo has "Email or text to customers"; a new code opens the send panel with a ready message. Send offers lists all customers with search; only customers marked "agreed to offers" can be selected (Spam Act); one tap records consent. Email via Gmail/Resend, SMS via ClickSend, WhatsApp per person; history of sends.

## Reviews — review form (pending), admin approve/reject, Google review button (Maps search placeholder until a Google Business profile exists). Sample reviews are labelled as samples.

## Google Sheets — `lib/sheets.ts`, `google-sheets/Code.gs`
Apps Script web app upserts rows by an `ID` column (never rename or delete it). Customers tab: ID, Name, Phone, Email, Address — one row per person (same name + phone merged). Jobs tab: ID, Job no., Customer, Job, Address, Date, Status (New request / Confirmed / Started – in progress / Completed / Complaint / Redo booked / Cancelled), Completed, Updated. Leads and Bookings tabs too. Phones written as "0401 647 545" so the leading 0 stays. Never blocks the site if Sheets is down. Settings has "Test connection & sync everything".

## Admin shell — `components/admin/shell.tsx`
Sidebar on tablet/desktop; on phones a top bar with ☰ that opens a slide-out drawer, with badge counts (pending reviews, complaints, new leads, overdue invoices). Login: `ADMIN_PASSWORD` or Supabase Auth (owner email).

## Email / SMS — `lib/email.ts`, `lib/sms.ts`
`sendMailEach` prefers Gmail SMTP (`GMAIL_USER`, `GMAIL_APP_PASSWORD`), else Resend. Owner gets a lead email with one-tap call/WhatsApp; customer gets a confirmation with the reference. `sendSms` uses ClickSend REST with `+61` formatting.
