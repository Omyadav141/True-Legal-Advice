-- ============================================================
-- True Legal Advice — Complete Supabase Database Schema
-- Run this in Supabase:
-- Dashboard → SQL Editor → New query (or paste) → Click "Run"
-- URL: https://supabase.com/dashboard/project/mbqbqnuzmzofkdexweuf/sql/new
-- ============================================================

-- 1. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  service text not null, -- 'court-marriage' | 'trademark-registration' | 'legal-services'
  sub_service text, -- Specific case/matter e.g. 'Mutual Consent Divorce', 'Trademark Filing'
  booking_date date not null,
  booking_time text not null, -- 24hr "HH:00" format, e.g. "14:00"
  consultation_mode text not null default 'offline', -- 'online' (video call) | 'offline' (office visit)
  meet_link text, -- Google Meet link
  message text,
  status text not null default 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  attendance text not null default 'scheduled', -- 'scheduled' | 'attended' | 'no_show'
  created_at timestamptz not null default now(),
  -- Ensure no two clients can book the same date and hour slot
  constraint bookings_no_double_booking unique (booking_date, booking_time)
);

-- Ensure all columns exist if the table was created previously
alter table public.bookings add column if not exists sub_service text;
alter table public.bookings add column if not exists consultation_mode text not null default 'offline';
alter table public.bookings add column if not exists meet_link text;
alter table public.bookings add column if not exists attendance text not null default 'scheduled';

-- 2. CONTACT INQUIRIES TABLE (Fixes the 404 error)
create table if not exists public.contact_inquiries (
  id text primary key default ('cnt_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::text),
  name text not null,
  phone text not null,
  email text,
  service text not null default 'General Legal Inquiry',
  mode text default 'Office Visit (Trisharan Square, Nagpur)',
  message text,
  status text not null default 'new', -- 'new' | 'contacted' | 'resolved'
  created_at timestamptz not null default now()
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- This fixes the error: 42501 "new row violates row-level security policy for table bookings"
-- Even if your Vercel deployment uses the anon/publishable key, these policies grant full access.

alter table public.bookings enable row level security;
alter table public.contact_inquiries enable row level security;

-- Policies for bookings
drop policy if exists "Allow public select bookings" on public.bookings;
create policy "Allow public select bookings" on public.bookings
  for select to anon, authenticated, service_role using (true);

drop policy if exists "Allow public insert bookings" on public.bookings;
create policy "Allow public insert bookings" on public.bookings
  for insert to anon, authenticated, service_role with check (true);

drop policy if exists "Allow public update bookings" on public.bookings;
create policy "Allow public update bookings" on public.bookings
  for update to anon, authenticated, service_role using (true);

drop policy if exists "Allow public delete bookings" on public.bookings;
create policy "Allow public delete bookings" on public.bookings
  for delete to anon, authenticated, service_role using (true);

-- Policies for contact_inquiries
drop policy if exists "Allow public select contact_inquiries" on public.contact_inquiries;
create policy "Allow public select contact_inquiries" on public.contact_inquiries
  for select to anon, authenticated, service_role using (true);

drop policy if exists "Allow public insert contact_inquiries" on public.contact_inquiries;
create policy "Allow public insert contact_inquiries" on public.contact_inquiries
  for insert to anon, authenticated, service_role with check (true);

drop policy if exists "Allow public update contact_inquiries" on public.contact_inquiries;
create policy "Allow public update contact_inquiries" on public.contact_inquiries
  for update to anon, authenticated, service_role using (true);

drop policy if exists "Allow public delete contact_inquiries" on public.contact_inquiries;
create policy "Allow public delete contact_inquiries" on public.contact_inquiries
  for delete to anon, authenticated, service_role using (true);

-- 4. PERFORMANCE INDEXES
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists contact_inquiries_created_at_idx on public.contact_inquiries (created_at desc);

