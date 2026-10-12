---
name: business-website-builder
description: Blueprint for building a complete small-business website plus admin panel (customer site, booking chatbot, booking calendar with no double bookings, CRM with auto-created customers and jobs, invoices, promo codes and email/SMS offers, reviews with approval, before/after gallery, Supabase database, Google Sheets sync, Vercel deploy, fully responsive). Use this skill whenever the user asks to design, build, make, clone or rebrand a website for any business or client — cleaning, hotel, restaurant, salon, trades, clinic, gym, real estate, shop, events or anything else — even if they only say "make a website for my client", "same as Spotless but for X", "new site for a hotel", or name just one part like an admin panel, booking chatbot or invoices for a business site.
---

# Business website builder

Builds a production-ready business website with two sides: the **public site** customers use, and the **admin panel** the owner runs the business from. The proven reference build is Spotless NT Cleaning Services (GitHub `sushant059/Spotless-NT-cleaning-services`, live at spotless-nt.vercel.app). Every new site reuses its architecture and features and changes the brand, content, booking model and wording to fit the business.

The person using this skill sells websites to clients. They want a complete, polished result from a short brief, without having to list every feature each time. They are not a developer: explain things in plain words, keep replies short, and give them links they can click.

## Working rules (from the owner)

- **Ask before adding your own ideas.** Build what was asked plus the standard blueprint below. If you think of an extra (a new page, a paid service, a different layout), list it as a suggestion and wait for a yes.
- **Never invent business facts** (reviews, years in business, licence numbers, "500+ happy customers"). Use clearly labelled samples the owner replaces in Admin.
- **Never paste secrets in chat.** API keys go straight into Vercel environment variables by the owner.
- Show progress in a few words while working; finish with what changed, what to check, and any setup the owner must do.

## Workflow

### 1. Short intake (one message, defaults offered)

Ask only what you cannot reasonably default, in one message (use AskUserQuestion with options when available):

1. Business name, type and city/area served
2. Phone, email (and WhatsApp/Facebook/Instagram/TikTok/Google review links if they exist; otherwise placeholders that still work)
3. Services or products, with prices if known (otherwise "Free quote")
4. Logo and brand colours (if none: propose a palette from the business type)
5. Which modules to include — default is **all** of the blueprint; ask only whether anything should be left out

If the user already gave most of this, skip straight to building and state the defaults you chose.

### 2. Pick the business preset

Read `references/business-presets.md` and choose the closest preset. It decides the booking model (time slots, nights, tables, appointments, quotes), the chatbot questions, service categories, extra pages, wording ("job" vs "booking" vs "reservation"), and photo themes. Mixed businesses: combine presets and say which.

### 3. Start from the template, don't start from scratch

Read `references/rebrand-checklist.md` and follow it: get the template repo (attach `sushant059/Spotless-NT-cleaning-services` with the add_repo tool if it is not in the session, or work in it directly when asked to extend it), copy it into the new project, then rebrand and adapt. The template already contains every module below, tested; adapting it is faster and far less buggy than rewriting.

### 4. Build the modules

`references/modules.md` describes each module, where it lives in the template, and what to change per business. Default set:

| Public site | Admin panel | Data & integrations |
|---|---|---|
| Photo/video-led home, services by category, service detail pages | Dashboard with badges | Supabase (Postgres + storage), diff-based saves |
| Booking chatbot (service → specific questions → location → name/phone) | Leads & bookings inbox | Google Sheets mirror (Customers, Jobs, Leads, Bookings) |
| Quote form, booking form with live slot availability | Calendar (slots, block days, no double bookings) | Email (Gmail app password or Resend) |
| Offers + promo codes at checkout | Customers & jobs CRM (auto-created from every enquiry, statuses with history, photos) | SMS (ClickSend) with phone-app fallback |
| Reviews with admin approval + Google review button | Invoices (create from job, GST, bank details, email/text/WhatsApp, paid tracking, private print/PDF link) | WhatsApp click-to-chat links |
| Before/after sliders, gallery, FAQs, contact, about | Send offers (email/SMS/WhatsApp, consent tracking) | Vercel deploy from GitHub |
| WhatsApp/social icons, mobile bottom bar | Content editors (services, offers, promos, reviews, FAQs, media, settings incl. phone/email) | |

### 5. Design it properly

Read `references/design-system.md` before writing UI. Key points: brand tokens in Tailwind, photo-led sections, real responsive behaviour from 360px up, and the known traps (a `backdrop-blur` header traps `position: fixed` menus; grid children need `min-w-0`; floating buttons must not cover CTAs on phones).

### 6. Deploy and connect

Follow `references/deploy-and-integrations.md`: Supabase schema (re-runnable SQL), Vercel project and env vars, Google Sheets Apps Script, Gmail app password, ClickSend. Give the owner a short checklist of what only they can do (accounts, keys, bank details).

### 7. Check before handing over

Run the QA list in `references/rebrand-checklist.md` (typecheck, lint, unit tests, build, Playwright run at 390px and 1280px through: chatbot booking → customer + job auto-created → confirm → start → done → invoice → mark paid; mobile menu opens; no horizontal scroll). Report results honestly, including anything you could not verify (for example stock photos you could not view).

## Output to the user at the end

Keep it short and in plain words:
- Live link and admin link
- What's included (one line per area)
- What they must set up themselves (keys, bank details, real photos), with exact clicks
- Suggestions you did **not** build, waiting for approval
