-- Supabase Database Schema - Maradi Zari ERP
-- Paste this script directly into the Supabase SQL Editor (https://supabase.com)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. SUPPLIERS TABLE
create table public.suppliers (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    phone text,
    gst_no varchar(15) check (length(gst_no) = 15 or gst_no is null),
    pan_no varchar(10) check (length(pan_no) = 10 or pan_no is null),
    address text,
    email text,
    created_at timestamptz not null default now()
);

-- 2. PURCHASES TABLE (Procurement -> Purchases)
create table public.purchases (
    id text primary key, -- e.g., 'PUR-1043'
    supplier_id uuid not null references public.suppliers(id) on delete restrict,
    item_name text not null,
    item_id text not null,
    invoice_no text not null,
    batch_id text not null unique, -- e.g., 'PZ26-0005'
    marks integer not null check (marks > 0),
    rate numeric(12, 2) not null check (rate > 0),
    gst_rate numeric(5, 2) not null default 12.00 check (gst_rate >= 0),
    total_amount numeric(12, 2) generated always as (round((marks * rate * (1 + gst_rate / 100)), 2)) stored,
    freight numeric(12, 2) not null default 0.00 check (freight >= 0),
    status text not null default 'Pending' check (status in ('Pending', 'On hold', 'Recorded')),
    remarks text,
    created_at timestamptz not null default now()
);

-- 3. MATERIAL ISSUES TABLE (Issue to Production)
create table public.material_issues (
    id text primary key, -- e.g., 'ISS-3021'
    batch_id text not null references public.purchases(batch_id) on delete restrict,
    issue_date date not null,
    bobbins_issued integer not null check (bobbins_issued > 0),
    gross_weight_g numeric(10, 2) check (gross_weight_g >= 0),
    crate_weight_g numeric(10, 2) check (crate_weight_g >= 0),
    bobbin_weight_g numeric(10, 2) default 16.00 check (bobbin_weight_g >= 0),
    net_weight_g numeric(10, 2) generated always as (gross_weight_g - crate_weight_g - (bobbins_issued * bobbin_weight_g)) stored,
    issued_to text not null,
    status text not null default 'Active' check (status in ('Active', 'Closed')),
    remarks text,
    created_at timestamptz not null default now()
);

-- 4. JOB CARDS TABLE (Job Cards)
create table public.job_cards (
    id text primary key, -- e.g., 'JC-0093'
    issue_id text not null references public.material_issues(id) on delete restrict,
    card_date date not null,
    saree_design text not null,
    preparation_type text not null check (preparation_type in ('Body warp', 'Border warp')),
    loom_no text not null,
    operator_name text not null,
    ends integer not null check (ends > 0),
    length_meters numeric(10, 2) not null check (length_meters > 0),
    warp_width numeric(10, 2),
    status text not null default 'In progress' check (status in ('In progress', 'Pending Warp', 'Needs Review', 'Completed')),
    created_at timestamptz not null default now()
);

-- 5. WARPING LOGS TABLE (Zari Warping)
create table public.warping_logs (
    id text primary key, -- e.g., 'WRP-0012'
    job_card_id text not null unique references public.job_cards(id) on delete restrict,
    start_weight_g numeric(10, 2) not null check (start_weight_g >= 0),
    remaining_weight_g numeric(10, 2) not null check (remaining_weight_g >= 0),
    net_warp_weight_g numeric(10, 2) generated always as (start_weight_g - remaining_weight_g) stored,
    wastage_g numeric(10, 2) not null default 0.00 check (wastage_g >= 0),
    operator_name text not null,
    logged_at timestamptz not null default now()
);

-- 6. RECONCILIATIONS TABLE (Reconciliation)
create table public.reconciliations (
    id uuid primary key default gen_random_uuid(),
    job_card_id text not null unique references public.job_cards(id) on delete restrict,
    issued_weight_g numeric(10, 2) not null check (issued_weight_g >= 0),
    net_used_weight_g numeric(10, 2) not null check (net_used_weight_g >= 0),
    wastage_weight_g numeric(10, 2) not null default 0.00 check (wastage_weight_g >= 0),
    loss_percentage numeric(5, 2) not null check (loss_percentage >= 0),
    status text not null check (status in ('Within tolerance', 'Minor deviation', 'Needs investigation')),
    created_at timestamptz not null default now()
);

-- CREATE INDEXES FOR OPTIMIZED JOINS & FILTERING
create index idx_purchases_supplier on public.purchases(supplier_id);
create index idx_purchases_status on public.purchases(status);
create index idx_material_issues_batch on public.material_issues(batch_id);
create index idx_job_cards_issue on public.job_cards(issue_id);
create index idx_job_cards_status on public.job_cards(status);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
alter table public.suppliers enable row level security;
alter table public.purchases enable row level security;
alter table public.material_issues enable row level security;
alter table public.job_cards enable row level security;
alter table public.warping_logs enable row level security;
alter table public.reconciliations enable row level security;

-- CREATE POLICY HELPER FUNCTIONS TO RESOLVE USER ROLES
create or replace function public.get_user_role()
returns text as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'guest');
$$ language sql security definer;

-- 1. SUPPLIERS POLICIES
create policy "Users can read suppliers" on public.suppliers
    for select using (public.get_user_role() in ('admin', 'inventory', 'production'));

create policy "Inventory and Admins can write suppliers" on public.suppliers
    for all using (public.get_user_role() in ('admin', 'inventory'));

-- 2. PURCHASES POLICIES
create policy "Users can read purchases" on public.purchases
    for select using (public.get_user_role() in ('admin', 'inventory', 'production'));

create policy "Inventory and Admins can write purchases" on public.purchases
    for all using (public.get_user_role() in ('admin', 'inventory'));

-- 3. MATERIAL ISSUES POLICIES
create policy "Users can read material_issues" on public.material_issues
    for select using (public.get_user_role() in ('admin', 'inventory', 'production'));

create policy "Inventory and Admins can write material_issues" on public.material_issues
    for all using (public.get_user_role() in ('admin', 'inventory'));

-- 4. JOB CARDS POLICIES
create policy "Users can read job_cards" on public.job_cards
    for select using (public.get_user_role() in ('admin', 'inventory', 'production'));

create policy "Production and Admins can write job_cards" on public.job_cards
    for all using (public.get_user_role() in ('admin', 'production'));

-- 5. WARPING LOGS POLICIES
create policy "Users can read warping_logs" on public.warping_logs
    for select using (public.get_user_role() in ('admin', 'inventory', 'production'));

create policy "Production and Admins can write warping_logs" on public.warping_logs
    for all using (public.get_user_role() in ('admin', 'production'));

-- 6. RECONCILIATIONS POLICIES
create policy "Users can read reconciliations" on public.reconciliations
    for select using (public.get_user_role() in ('admin', 'inventory', 'production'));

create policy "Admins can manage reconciliations" on public.reconciliations
    for all using (public.get_user_role() = 'admin');

-- Migration: Add warp_width to public.job_cards
ALTER TABLE public.job_cards ADD COLUMN IF NOT EXISTS warp_width numeric(10, 2);
