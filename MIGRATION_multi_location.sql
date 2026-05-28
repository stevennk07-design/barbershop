-- ============================================================
-- Multi-location migration for Matanza Cutz
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. New locations table
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz default now()
);
alter table locations enable row level security;
create policy "Anyone can view locations"   on locations for select using (true);
create policy "Auth can insert locations"   on locations for insert to authenticated with check (true);
create policy "Auth can update locations"   on locations for update to authenticated using (true);
create policy "Auth can delete locations"   on locations for delete to authenticated using (true);

-- 2. Add location column to weekly_hours
alter table weekly_hours add column location_id uuid references locations(id);

-- 3. Per-date location override table
create table location_overrides (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  location_id uuid references locations(id),
  created_at timestamptz default now()
);
alter table location_overrides enable row level security;
create policy "Anyone can view location overrides"  on location_overrides for select using (true);
create policy "Auth can manage location overrides"  on location_overrides for all to authenticated using (true) with check (true);

-- 4. Store resolved location on each appointment
alter table appointments add column location_id uuid references locations(id);

-- ============================================================
-- Done! Go back to the app and add your locations in the
-- Admin → Locations tab, then assign them to days of the week.
-- ============================================================
