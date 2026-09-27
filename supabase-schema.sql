-- ============================================================
-- Run this in Supabase: Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  service text not null, -- 'court-marriage' | 'trademark-registration' | 'legal-services'
  booking_date date not null,
  booking_time text not null, -- 24hr "HH:00" format, one-hour slots e.g. "14:00"
  consultation_mode text not null default 'offline', -- 'online' (video call) | 'offline' (office visit)
  meet_link text, -- Google Meet link, auto-generated for online consultations when configured
  message text,
  status text not null default 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at timestamptz not null default now(),
  -- A cancelled slot frees itself up again, but pending/confirmed bookings
  -- fully block the slot so two people can never hold the same hour.
  constraint bookings_no_double_booking unique (booking_date, booking_time)
);

-- Enable Row Level Security. Since only the server (using the
-- service role key) reads/writes this table, no public policies
-- are needed — the service role key bypasses RLS entirely.
alter table bookings enable row level security;

-- Index for the admin dashboard to sort/filter quickly
create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_date_idx on bookings (booking_date);

-- ============================================================
-- If you already ran an OLDER version of this schema and have
-- existing data, run the relevant migration lines instead of the
-- create table above:
-- ============================================================
-- alter table bookings rename column preferred_date to booking_date;
-- alter table bookings rename column preferred_time to booking_time;
-- alter table bookings alter column booking_date set not null;
-- alter table bookings alter column booking_time set not null;
-- alter table bookings add constraint bookings_no_double_booking unique (booking_date, booking_time);
-- create index if not exists bookings_date_idx on bookings (booking_date);
-- alter table bookings add column if not exists consultation_mode text not null default 'offline';
-- alter table bookings add column if not exists meet_link text;
