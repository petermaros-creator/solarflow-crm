-- Run this in Supabase SQL Editor AFTER schema.sql

-- MESSAGES
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  channel text not null default 'general',
  sender_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- CALLS
create table if not exists calls (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references contacts(id) on delete set null,
  dialpad_call_id text,
  direction text not null default 'outbound',
  status text default 'completed',
  from_number text,
  to_number text,
  duration_seconds integer default 0,
  recording_url text,
  transcript text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add lead_source to contacts if not exists
alter table contacts add column if not exists lead_source text default 'Direct';
alter table contacts add column if not exists acquisition_date date default current_date;

-- CALLS updated_at trigger
create trigger calls_updated_at before update on calls for each row execute function update_updated_at();

-- RLS (open for single-user setup)
alter table messages enable row level security;
alter table calls enable row level security;
create policy "messages_open" on messages for all using (true);
create policy "calls_open" on calls for all using (true);

-- Seed some messages
insert into messages (channel, sender_name, content) values
  ('general', 'Alex T.', 'Good morning team — big day, Chen project permit approved!'),
  ('general', 'Jordan M.', 'On my way to the Rivera site assessment now'),
  ('sales', 'Alex T.', 'Okafor portfolio call went well — sending proposal this afternoon'),
  ('sales', 'Jordan M.', 'Nair deal — they want EV charger bundle, added to proposal'),
  ('projects', 'Sam R.', 'Chen equipment ordered, delivery Friday'),
  ('projects', 'Alex T.', 'Rivera HOA variance approved — we are clear to permit');
