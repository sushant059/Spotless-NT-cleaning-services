# Deploy and integrations

## GitHub
New repo per client (or a branch while drafting). Commit with clear messages; Vercel deploys on every push to the connected branch.

## Supabase
1. Create a project (closest region; Australia = `ap-southeast-2`).
2. Run `supabase/schema.sql` (re-runnable: `create table if not exists`, `add column if not exists`, RLS with `private.is_admin()`, public storage bucket `media`). With the Supabase MCP, apply it as migrations; if a big migration times out, split it into smaller statements and check with `to_regclass` / `information_schema` before retrying.
3. Keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only — the owner pastes it into Vercel; never into chat).
4. Empty tables seed themselves on first load.

## Vercel
Create the project from the GitHub repo (Vercel MCP `create_git_project` or dashboard). Turn off Vercel Authentication/SSO protection so the public can see the site. Env vars:

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Signs the admin cookie (long random string) |
| `ADMIN_PASSWORD` | Admin login without Supabase Auth |
| `NEXT_PUBLIC_SITE_URL` | Real domain for links in emails/texts (falls back to the Vercel production URL) |
| Supabase keys | as above |
| `GOOGLE_SHEETS_WEBHOOK_URL`, `GOOGLE_SHEETS_SECRET` | Sheets sync |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Send email from the business Gmail (Google Account → Security → 2-Step Verification → App passwords). About 500/day, no domain needed |
| `RESEND_API_KEY`, `EMAIL_FROM` | Alternative email (needs a verified domain to email customers) |
| `CLICKSEND_USERNAME`, `CLICKSEND_API_KEY`, `CLICKSEND_FROM` | Bulk SMS (AU, ~8–9c each, prepaid) |

Redeploy after changing env vars. Custom domain: Vercel → Domains, then the DNS records it shows.

## Google Sheets
1. Create the sheet; Extensions → Apps Script; paste `google-sheets/Code.gs`; set `SECRET` to a random string (same as `GOOGLE_SHEETS_SECRET`).
2. Deploy → New deployment → Web app → Execute as **Me**, Who has access **Anyone** (not "Anyone with Google account" — that returns a Google sign-in page instead of running the script).
3. Put the `/exec` URL in `GOOGLE_SHEETS_WEBHOOK_URL`. After any script edit: Manage deployments → Edit → New version.
4. Admin → Settings → "Test connection & sync everything".

## Legal/compliance basics (Australia; adapt elsewhere)
- Offers by email/SMS only to customers who agreed (Spam Act 2003); every message has an opt-out ("Reply STOP" / unsubscribe line).
- Tax invoices need the words "Tax invoice", ABN, date, description and GST amount; not registered → "Invoice", no GST.
- Privacy and terms pages from the template; update the business name and contact.
