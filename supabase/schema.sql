-- Spotless NT schema, row level security and storage.
-- Run this in the Supabase SQL editor, then create an Auth user
-- for regmisusanth94@gmail.com. The Next.js app seeds content
-- the first time it connects with the service role key.

create table if not exists public.admin_users (
  email text primary key
);

insert into public.admin_users (email)
values ('regmisusanth94@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null,
  short_name text not null,
  phone_display text not null,
  phone_tel text not null,
  whatsapp_url text not null default '',
  email text not null,
  notification_email text not null,
  address text not null default '',
  service_areas text[] not null default '{}',
  facebook text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  google_url text not null default '',
  abn text not null default '',
  licence text not null default '',
  insurance text not null default '',
  opening_hours jsonb not null default '[]',
  seo_title text not null,
  seo_description text not null,
  hero_headline text not null,
  hero_subtext text not null,
  hero_image text not null default '',
  hero_video text not null default '',
  team_photo text not null default '',
  og_image text not null default '',
  stats jsonb not null default '[]'
);

create table if not exists public.services (
  id text primary key,
  slug text unique not null,
  title text not null,
  summary text not null default '',
  description text not null default '',
  included jsonb not null default '[]',
  best_for jsonb not null default '[]',
  process jsonb not null default '[]',
  faqs jsonb not null default '[]',
  icon text not null default 'layers',
  image text not null default '',
  video_url text not null default '',
  sort_order int not null default 0,
  visible boolean not null default true,
  related jsonb not null default '[]'
);

create table if not exists public.offers (
  id text primary key,
  title text not null,
  description text not null default '',
  banner_text text not null default '',
  href text not null default '',
  image text not null default '',
  active boolean not null default false,
  starts_at date,
  ends_at date,
  show_on_banner boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.promo_codes (
  id text primary key,
  code text unique not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  amount numeric not null,
  message text not null default '',
  expires_at date,
  usage_limit int,
  used_count int not null default 0,
  active boolean not null default true
);

create table if not exists public.leads (
  id text primary key,
  reference text unique not null,
  source text not null check (source in ('quote', 'chat', 'contact')),
  status text not null check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'lost')),
  name text not null,
  phone text not null default '',
  email text not null default '',
  suburb text not null default '',
  services jsonb not null default '[]',
  details jsonb not null default '{}',
  summary text not null default '',
  notes text not null default '',
  internal_notes text not null default '',
  promo_code text not null default '',
  promo_message text not null default '',
  photos jsonb not null default '[]',
  message text not null default '',
  preferred_time text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  reference text unique not null,
  status text not null check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'lost')),
  name text not null,
  phone text not null,
  email text not null,
  services jsonb not null default '[]',
  details jsonb not null default '{}',
  summary text not null default '',
  appointment_date date not null,
  time_window text not null,
  address text not null,
  suburb text not null,
  notes text not null default '',
  internal_notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.before_after (
  id text primary key,
  service_slug text not null,
  caption text not null default '',
  scene text not null default 'carpet',
  before_image text not null default '',
  after_image text not null default '',
  illustrative boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.reviews (
  id text primary key,
  name text not null,
  body text not null,
  service text not null default '',
  rating int not null check (rating between 1 and 5),
  review_date date,
  source text not null check (source in ('sample', 'manual', 'google')),
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.faqs (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

create table if not exists public.blocked_dates (
  id text primary key,
  blocked_on date unique not null,
  reason text not null default ''
);

create table if not exists public.media (
  id text primary key,
  name text not null,
  url text not null,
  kind text not null check (kind in ('image', 'video')),
  slot text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.offers enable row level security;
alter table public.promo_codes enable row level security;
alter table public.leads enable row level security;
alter table public.bookings enable row level security;
alter table public.before_after enable row level security;
alter table public.reviews enable row level security;
alter table public.faqs enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.media enable row level security;

create policy "public read settings" on public.site_settings for select using (true);
create policy "admin write settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "public read visible services" on public.services for select using (visible = true or public.is_admin());
create policy "admin write services" on public.services for all using (public.is_admin()) with check (public.is_admin());

create policy "public read active offers" on public.offers for select using (active = true or public.is_admin());
create policy "admin write offers" on public.offers for all using (public.is_admin()) with check (public.is_admin());

create policy "admin promo codes" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());

create policy "admin read leads" on public.leads for select using (public.is_admin());
create policy "admin update leads" on public.leads for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete leads" on public.leads for delete using (public.is_admin());
create policy "public insert leads" on public.leads for insert with check (char_length(name) between 2 and 80);

create policy "admin bookings" on public.bookings for all using (public.is_admin()) with check (public.is_admin());
create policy "public insert bookings" on public.bookings for insert with check (char_length(name) between 2 and 80 and char_length(address) between 5 and 160);

create policy "public read results" on public.before_after for select using (true);
create policy "admin write results" on public.before_after for all using (public.is_admin()) with check (public.is_admin());

create policy "public read visible reviews" on public.reviews for select using (visible = true or public.is_admin());
create policy "admin write reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

create policy "public read faqs" on public.faqs for select using (true);
create policy "admin write faqs" on public.faqs for all using (public.is_admin()) with check (public.is_admin());

create policy "public read blocked dates" on public.blocked_dates for select using (true);
create policy "admin write blocked dates" on public.blocked_dates for all using (public.is_admin()) with check (public.is_admin());

create policy "public read media" on public.media for select using (true);
create policy "admin write media" on public.media for all using (public.is_admin()) with check (public.is_admin());

create policy "admin users" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media files" on storage.objects for select using (bucket_id = 'media');
create policy "admin write media files" on storage.objects for all using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
