-- Run this in Supabase SQL editor to add the new measurement columns
-- to an already-existing `measurements` table.

alter table measurements add column if not exists under_chest_cm numeric;
alter table measurements add column if not exists belly_cm numeric;
alter table measurements add column if not exists wrist_cm numeric;
alter table measurements add column if not exists calf_cm numeric;
