create extension if not exists pgcrypto;

create type public.user_role as enum ('ADMIN','MANAGEMENT','PARENT');
create type public.invoice_status as enum ('DRAFT','UNPAID','PARTIAL','PAID','OVERDUE','CANCELLED');
create type public.payment_status as enum ('PENDING','SUCCESS','FAILED','CANCELLED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  academic_year_id uuid not null references public.academic_years(id),
  unique(name, academic_year_id)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_no text not null unique,
  full_name text not null,
  class_id uuid references public.classes(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.parents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  phone text
);

create table public.parent_students (
  parent_id uuid not null references public.parents(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  primary key(parent_id, student_id)
);

create table public.fee_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_amount numeric(14,2) not null check(default_amount >= 0),
  is_active boolean not null default true
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  student_id uuid not null references public.students(id),
  issued_on date not null,
  due_on date not null,
  status public.invoice_status not null default 'UNPAID',
  total_amount numeric(14,2) not null check(total_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check(paid_amount >= 0),
  created_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  fee_type_id uuid references public.fee_types(id),
  description text not null,
  amount numeric(14,2) not null check(amount >= 0)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_no text not null unique,
  student_id uuid not null references public.students(id),
  paid_at timestamptz,
  method text not null,
  amount numeric(14,2) not null check(amount > 0),
  status public.payment_status not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table public.payment_allocations (
  payment_id uuid not null references public.payments(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id),
  amount numeric(14,2) not null check(amount > 0),
  primary key(payment_id, invoice_id)
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text not null unique,
  payment_id uuid not null unique references public.payments(id),
  issued_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.parents enable row level security;
alter table public.parent_students enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;

create policy "profiles read own" on public.profiles for select using (id = auth.uid());

create policy "admin management students read" on public.students for select using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ADMIN','MANAGEMENT'))
  or exists(
    select 1 from public.parents pa
    join public.parent_students ps on ps.parent_id = pa.id
    where pa.profile_id = auth.uid() and ps.student_id = students.id
  )
);

create policy "parent invoices read" on public.invoices for select using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ADMIN','MANAGEMENT'))
  or exists(
    select 1 from public.parents pa
    join public.parent_students ps on ps.parent_id = pa.id
    where pa.profile_id = auth.uid() and ps.student_id = invoices.student_id
  )
);
