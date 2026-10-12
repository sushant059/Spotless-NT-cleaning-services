# Rebrand checklist and QA

## Get the template
- If `sushant059/Spotless-NT-cleaning-services` is not in the session, attach it with the add_repo tool, then clone. Copy everything except `.git`, `.next`, `node_modules`, `data/db.json`, `public/uploads/*` into the new project.
- `npm install`, then `npm run build` once before changing anything, to confirm the base works.

## Rebrand (in this order)
1. `package.json` name/description/repository; README title.
2. `lib/seed.ts`: settings (business name, short name, phone display + tel, email, notification email, address, service areas, socials, ABN, opening hours, SEO title/description, hero text, slot capacity, invoice settings), services (slug, title, category, icon, summary, description, included, best for, process, FAQs, price from, duration), FAQs, offers, promo codes, sample reviews (keep `source: "sample"`), before/after examples.
3. `lib/constants.ts`: `SERVICE_CATEGORIES`, `NAV_LINKS`, `CHAT_OPTIONS`, `fieldQuestion` and chat wording, `TIME_WINDOWS` (or the preset's booking model), job status labels if the wording changes.
4. Logo files in `public/` (mark PNG, SVG logo, icon), `components/brand.tsx`, `app/manifest.ts`, favicon/OG image.
5. Colours and fonts: `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `docs/BRAND.md`.
6. Stock media map `lib/stock.ts` for the new services and pages.
7. Copy across pages: hero headline, about, how it works, why us, privacy, terms, email templates (`lib/email.ts`), SMS wording, invoice footer.
8. Sheets: `google-sheets/Code.gs` tab names if changed; `lib/sheets.ts` column wording.
9. Remove anything the client doesn't need from nav, admin `LINKS` and the home page (keep the code if cheap, hide the entry points).

## QA before handover
- `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` — all clean.
- Start `npm start` locally with `ADMIN_PASSWORD` and `AUTH_SECRET` set (production mode requires them).
- Playwright (Chromium at `/opt/pw-browsers/chromium` in cloud sessions), at 390×844 and 1280×900:
  - Home: no horizontal scroll; mobile ☰ menu opens full screen and navigates; bottom bar doesn't cover CTAs.
  - Chatbot booking end to end → Lead saved → customer + "New request" job created automatically.
  - Booking form: a taken slot shows "Booked"; booking it again is refused.
  - Admin: Confirm → Start → Done updates status (and the Sheet when connected — test with a local mock web app server); duplicate customer blocked.
  - Invoice from job → totals right → mark sent → public link opens without login → mark paid.
  - Promo code → send panel prefilled; offers page lists customers; consent toggle works.
- If network blocks stock media, route `images.pexels.com` to local placeholder images in Playwright to check layout, and tell the owner the real photos were not visually checked.
- Commit, push, confirm the Vercel deployment is READY, then report.
