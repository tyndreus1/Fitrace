-- Fit Race schema — run this in Supabase SQL editor

create table if not exists profiles (
  id text primary key,              -- 'witch' | 'polar_bear'
  display_name text not null,
  pin text not null,
  color text not null,
  avatar text not null,
  water_goal_ml int not null default 2500,
  start_weight_kg numeric,
  goal_weight_kg numeric,
  height_cm numeric,
  created_at timestamptz default now()
);

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references profiles(id) on delete cascade,
  log_date date not null,
  weight_kg numeric not null,
  created_at timestamptz default now(),
  unique (profile_id, log_date)
);

create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references profiles(id) on delete cascade,
  log_date date not null,
  waist_cm numeric,
  chest_cm numeric,
  under_chest_cm numeric,
  belly_cm numeric,
  hips_cm numeric,
  arm_cm numeric,
  wrist_cm numeric,
  thigh_cm numeric,
  calf_cm numeric,
  neck_cm numeric,
  body_fat_pct numeric,
  created_at timestamptz default now(),
  unique (profile_id, log_date)
);

create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references profiles(id) on delete cascade,
  log_date date not null,
  amount_ml int not null,
  logged_at timestamptz default now()
);

create table if not exists badges_earned (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique (profile_id, badge_key)
);

alter table profiles enable row level security;
alter table weight_logs enable row level security;
alter table measurements enable row level security;
alter table water_logs enable row level security;
alter table badges_earned enable row level security;

-- Open policies: this app uses its own PIN check in the client, not Supabase auth.
-- Anyone with the anon key can read/write. Fine for a 2-person private app behind a PIN screen.
create policy "public read profiles" on profiles for select using (true);
create policy "public write profiles" on profiles for update using (true);
create policy "public all weight_logs" on weight_logs for all using (true) with check (true);
create policy "public all measurements" on measurements for all using (true) with check (true);
create policy "public all water_logs" on water_logs for all using (true) with check (true);
create policy "public all badges_earned" on badges_earned for all using (true) with check (true);

-- Seed the two profiles — CHANGE THE PINS before deploying.
insert into profiles (id, display_name, pin, color, avatar, water_goal_ml, start_weight_kg, goal_weight_kg, height_cm)
values
  ('witch', 'Witch', '1234', '#a855f7', '🧙‍♀️', 2200, null, null, null),
  ('polar_bear', 'Polar Bear', '5678', '#0ea5e9', '🐻‍❄️', 3000, null, null, null)
on conflict (id) do nothing;
