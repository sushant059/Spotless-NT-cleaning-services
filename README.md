# Spotless NT Cleaning Services

Mobile-first website and owner admin for Spotless NT, a carpet, couch, mattress and general cleaning business in Darwin and the surrounding Northern Territory.

The picture mark is the supplied logo. The wordmark reads **Spotless NT Cleaning Services**. The generated file originally said “anti-cleaning”; that line is corrected here so it is not published.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI (Radix, CVA), lucide icons, Framer Motion
- Zod and React Hook Form
- Local JSON database for development, Supabase Postgres when configured
- Resend for email when configured
- Owner session cookie. Supabase Auth is used when the Supabase keys are set

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Development sign-in, only when `NODE_ENV` is not production:

- Email: `regmisusanth94@gmail.com`
- Password: `ADMIN_PASSWORD` from `.env.local`, or `spotless-demo` if that variable is empty

Set a long `AUTH_SECRET` and a real `ADMIN_PASSWORD` before any public deploy. The development password is not accepted as a fallback in production.

The first run writes starter content to `data/db.json` (gitignored). Services, offers, FAQs, sample reviews and illustrative before/after pairs are included. Leads start empty. Sample reviews are labelled “Sample — replace with real reviews”. Illustrative pictures are labelled too. No review counts, awards or trust numbers are invented.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO, sitemap and email links |
| `AUTH_SECRET` | Signs the admin cookie. Required in production |
| `ADMIN_PASSWORD` | Owner password when Supabase Auth is not configured |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Used only for owner sign-in |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Never expose it to the browser |
| `RESEND_API_KEY` | Sends owner and customer email |
| `EMAIL_FROM` | From address. `onboarding@resend.dev` works for Resend tests |

If Supabase or Resend is not configured, quotes, bookings, chat and contact messages are still saved. Email sending fails quietly and the customer still gets a reference code.

## Supabase

1. Create a project and run `supabase/schema.sql` in the SQL editor.
2. In Authentication, create a user for `regmisusanth94@gmail.com`.
3. Put the three Supabase keys in `.env.local`.
4. Restart the app. Empty tables are seeded on the first connection.
5. Create a public Storage bucket named `media` if the SQL bucket insert did not run (the schema tries to create it).

The service role key is used on the server. Row Level Security still protects direct access with the anon key. Promo codes are not publicly readable. Leads and bookings can be inserted with length checks, and only the owner can read them.

Changing the public email in Settings also changes the only email allowed to sign in. The Supabase user has to match that address.

## Email

Owner messages include the reference, job details and one-tap call / WhatsApp links. Customer confirmations include the reference. Chat callbacks have no customer email, so only the owner is emailed.

## Admin

`/admin` covers the dashboard, leads and bookings (status, notes, call, WhatsApp, CSV, delete), offers and promo codes, services, before/after uploads, the media library, reviews, FAQs, blocked dates and settings. Content changes call `revalidatePath` so the public pages update.

Uploads are compressed in the browser, then stored in `public/uploads` or the Supabase `media` bucket.

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm start
```

## Test checklist

- Home, services, service detail, why us, how it works, results, reviews, FAQs, contact, privacy, terms and the 404 page at 360px, 768px and 1280px.
- Sticky header, dismissible offer banner, mobile menu, bottom Call / WhatsApp / Free Quote bar, floating WhatsApp, chat and back to top.
- Free quote, booking (including a blocked date and a past date), contact and the chat callback. Each success state shows an `SNT-` reference.
- Promo code `WELCOME10` shows the confirmation message. A fake code does not.
- Suburb checker accepts Parap and explains an unknown suburb.
- Chat answers a drying-time question, then still completes a callback.
- Admin sign-in rejects a different email. Status changes, a new FAQ and a settings edit show on the public site after refresh.
- Keyboard: skip link, visible focus, before/after slider arrows, chat and menu Escape where a dialog is open.
- With Resend unset, a quote still saves. With it set, owner and customer emails arrive.

## Brand

Territory Teal `#09808F`, Teal Deep `#066676`, Sun Yellow `#FFC531` with navy text, Ink `#17343C`, Sky Mist `#EAF8FA`, Cream `#FFFBF0`, Fresh Mint `#7ED9C6`, Soft Coral `#FF7A59` for urgent marks only. Poppins throughout. White text is not used on yellow, mint or coral.
