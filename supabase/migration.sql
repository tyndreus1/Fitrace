-- ESKİ "Fit Race" ŞEMASINDAN GEÇİŞ
--
-- Supabase → SQL Editor'a bunu yapıştırıp bir kez çalıştır.
-- Tekrar tekrar çalıştırmak zararsızdır.
--
-- Neyi düzeltir:
--  1. Eksik tabloları oluşturur (meals, journal, chat_messages)
--  2. measurements'a omuz ölçüsü sütununu ekler
--  3. Eski tablolardaki "profiles" bağını kaldırır — kayıtlar artık
--     profile_id = 'ozge' ile yazılıyor ve eski profiles tablosunda böyle bir
--     satır olmadığı için tüm yazma denemeleri reddediliyordu.

-- 1) Eksik tablolar ------------------------------------------------------

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

create table if not exists tesekkur (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'ozge',
  content text not null,
  created_at timestamptz default now()
);

-- 2) Eksik sütun ---------------------------------------------------------

alter table measurements add column if not exists shoulders_cm numeric;

-- 3) Eski profiles bağını kaldır ----------------------------------------
-- (Kısıt adları projeye göre değişebildiği için tabloya bakarak siliniyor.)

do $$
declare
  r record;
begin
  for r in
    select conrelid::regclass as tbl, conname
    from pg_constraint
    where contype = 'f'
      and conrelid::regclass::text in ('weight_logs', 'measurements', 'water_logs')
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;

-- 4) Satır düzeyi güvenlik ve açık politikalar --------------------------
-- Uygulama Supabase kimlik doğrulaması kullanmaz; giriş istemci tarafındaki
-- şifre ekranıyla yapılır. Anon anahtarını bilen okuyup yazabilir — tek
-- kişilik, gizli bir link için yeterli.

alter table meals enable row level security;
alter table journal enable row level security;
alter table chat_messages enable row level security;
alter table tesekkur enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['weight_logs','measurements','water_logs','meals','journal','chat_messages','tesekkur']
  loop
    execute format('drop policy if exists "acik %s" on %I', t, t);
    execute format('create policy "acik %s" on %I for all using (true) with check (true)', t, t);
  end loop;
end $$;

-- 5) Kontrol -------------------------------------------------------------
-- Aşağıdaki sorgu altı satır döndürmeli; hepsi görünüyorsa uygulama bulut
-- kaydına kendiliğinden geri döner (sayfayı yenilemen yeterli).

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('weight_logs','measurements','water_logs','meals','journal','chat_messages')
order by table_name;
