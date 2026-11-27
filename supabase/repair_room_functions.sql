-- Run this standalone if an older rooms table still requires rooms.host.
create extension if not exists pgcrypto;

alter table public.rooms add column if not exists id uuid default gen_random_uuid();
alter table public.rooms add column if not exists host text;
alter table public.rooms add column if not exists host_member_id text;
alter table public.rooms add column if not exists host_name text;
alter table public.rooms add column if not exists host_team text;
alter table public.rooms add column if not exists status text default 'auction';
alter table public.rooms add column if not exists timer_seconds integer default 20;
alter table public.rooms add column if not exists current_index integer default 0;
alter table public.rooms add column if not exists current_bid integer default 0;
alter table public.rooms add column if not exists current_bidder text;
alter table public.rooms add column if not exists paused boolean default false;

alter table public.room_members add column if not exists room_id uuid;
alter table public.room_members add column if not exists user_id uuid;
alter table public.room_members add column if not exists room_code text;
alter table public.room_members add column if not exists member_id text;
alter table public.room_members add column if not exists name text;
alter table public.room_members add column if not exists team text;
alter table public.room_members add column if not exists purse integer default 12000;

create or replace function public.create_room(
  p_code text,
  p_member_id text,
  p_name text,
  p_team text,
  p_timer_seconds integer default 20
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  insert into public.rooms(code, host, host_member_id, host_name, host_team, status, timer_seconds)
  values (upper(trim(p_code)), p_member_id::uuid, p_member_id, trim(p_name), upper(trim(p_team)), 'auction', p_timer_seconds)
  returning id into v_room_id;

  insert into public.room_members(room_id, user_id, room_code, member_id, name, team, purse)
  values (v_room_id, p_member_id::uuid, upper(trim(p_code)), p_member_id, trim(p_name), upper(trim(p_team)), 12000);

  return upper(trim(p_code));
end;
$$;

notify pgrst, 'reload schema';
