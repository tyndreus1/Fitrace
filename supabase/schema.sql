-- Özge'nin Sağlık Günlüğü — Supabase şeması
-- Supabase SQL Editor'a yapıştırıp çalıştır.
--
-- NOT: Supabase kurmak ZORUNLU DEĞİL. Ortam değişkenleri tanımlı değilse
-- uygulama tüm kayıtları tarayıcıda (localStorage) tutar. Supabase'i sadece
-- telefon + bilgisayar arasında senkron istiyorsan kur.

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'ozge',
  log_date date not null,
  weight_kg numeric not null,
  created_at timestamptz default now(),
  unique (profile_id, log_date)
);

create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'ozge',
  log_date date not null,
  -- Ölçüm noktaları public/ozge/olcum.png şemasındaki etiketlerle aynı
  neck_cm numeric,
  shoulders_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  waist_cm numeric,
  hips_cm numeric,
  thigh_cm numeric,
  calf_cm numeric,
  created_at timestamptz default now(),
  unique (profile_id, log_date)
);

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'ozge',
  log_date date not null,
  meal_slot text,
  note text,
  kcal int default 0,
  protein_g numeric default 0,
  carb_g numeric default 0,
  fat_g numeric default 0,
  items jsonb default '[]'::jsonb,
  source text,
  created_at timestamptz default now()
);

create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'ozge',
  log_date date not null,
  amount_ml int not null,
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Ruh hâli / cilt / serbest not
create table if not exists journal (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'ozge',
  log_date date not null,
  mood int,
  skin int,
  note text,
  created_at timestamptz default now(),
  unique (profile_id, log_date)
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'ozge',
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists meals_date_idx on meals (profile_id, log_date);
create index if not exists water_date_idx on water_logs (profile_id, log_date);
create index if not exists chat_created_idx on chat_messages (profile_id, created_at);

alter table weight_logs enable row level security;
alter table measurements enable row level security;
alter table meals enable row level security;
alter table water_logs enable row level security;
alter table journal enable row level security;
alter table chat_messages enable row level security;

-- Bu uygulama Supabase kimlik doğrulaması kullanmaz; giriş, istemci tarafındaki
-- şifre ekranıyla yapılır. Dolayısıyla anon anahtarı bilen herkes okuyup
-- yazabilir. Tek kişilik, gizli bir link için yeterli; daha fazlası gerekiyorsa
-- Supabase Auth'a geçilmeli.
drop policy if exists "acik weight_logs" on weight_logs;
drop policy if exists "acik measurements" on measurements;
drop policy if exists "acik meals" on meals;
drop policy if exists "acik water_logs" on water_logs;
drop policy if exists "acik journal" on journal;
drop policy if exists "acik chat_messages" on chat_messages;

create policy "acik weight_logs" on weight_logs for all using (true) with check (true);
create policy "acik measurements" on measurements for all using (true) with check (true);
create policy "acik meals" on meals for all using (true) with check (true);
create policy "acik water_logs" on water_logs for all using (true) with check (true);
create policy "acik journal" on journal for all using (true) with check (true);
create policy "acik chat_messages" on chat_messages for all using (true) with check (true);
