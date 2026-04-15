-- Enable UUID generation
create extension if not exists "pgcrypto";

-- CONTACTS
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  company text,
  role text default 'Homeowner',
  status text default 'Lead',
  value numeric default 0,
  tags text[] default '{}',
  notes text,
  last_contact timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DEALS
create table if not exists deals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null,
  title text not null,
  stage text default 'Lead',
  value numeric default 0,
  probability integer default 20,
  close_date date,
  system_size text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROJECTS
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  deal_id uuid references deals(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  name text not null,
  stage text default 'Permitting',
  status text default 'On Track',
  start_date date,
  target_date date,
  address text,
  system_size text,
  value numeric default 0,
  progress integer default 0,
  team text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TASKS
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  assignee text,
  status text default 'Todo',
  priority text default 'Medium',
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ACTIVITIES
create table if not exists activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  type text not null,
  note text,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table contacts   enable row level security;
alter table deals      enable row level security;
alter table projects   enable row level security;
alter table tasks      enable row level security;
alter table activities enable row level security;

-- RLS POLICIES (users only see their own data)
create policy "contacts_owner"   on contacts   for all using (auth.uid() = user_id);
create policy "deals_owner"      on deals      for all using (auth.uid() = user_id);
create policy "projects_owner"   on projects   for all using (auth.uid() = user_id);
create policy "tasks_owner"      on tasks      for all using (auth.uid() = user_id);
create policy "activities_owner" on activities for all using (auth.uid() = user_id);

-- AUTO-UPDATE updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger contacts_updated_at   before update on contacts   for each row execute function update_updated_at();
create trigger deals_updated_at      before update on deals      for each row execute function update_updated_at();
create trigger projects_updated_at   before update on projects   for each row execute function update_updated_at();
create trigger tasks_updated_at      before update on tasks      for each row execute function update_updated_at();

-- SEED DATA (runs after you create your account — replace the user_id with your actual auth.users id)
-- Run this in Supabase SQL editor after signing up:
-- insert into contacts (user_id, name, email, phone, address, company, status, value, tags) values
-- ('YOUR-USER-ID', 'Marcus Rivera', 'marcus@riverahome.com', '(949) 555-0182', '24 Sunridge Ct, Irvine CA 92612', 'Rivera Properties', 'Active', 42500, ARRAY['HOA','High Priority']);
