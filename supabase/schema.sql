create extension if not exists pgcrypto;

create table if not exists public.registrations (
    id uuid primary key default gen_random_uuid(),
    protocol_number text unique,
    type text not null check (type in ('PF', 'PJ')),
    payload jsonb not null,
    status text not null default 'NOVO',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.registration_files (
    id uuid primary key default gen_random_uuid(),
    registration_id uuid not null references public.registrations(id) on delete cascade,
    file_type text not null,
    storage_path text not null,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    created_at timestamptz not null default now()
);

create index if not exists registrations_created_at_idx on public.registrations (created_at desc);
create index if not exists registration_files_registration_id_idx on public.registration_files (registration_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;
alter table public.registration_files enable row level security;
alter table public.admin_users enable row level security;

-- No policies are defined; use service role key on backend only.
