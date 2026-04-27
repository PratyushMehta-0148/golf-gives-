-- ============================================================
-- GOLFGIVES PLATFORM — SUPABASE SCHEMA

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text unique not null,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  subscription_plan text check (subscription_plan in ('monthly', 'yearly', null)),
  subscription_status text not null default 'inactive' check (subscription_status in ('active', 'inactive', 'lapsed', 'cancelled')),
  subscription_renewal_date timestamptz,
  charity_id uuid,
  charity_contribution_pct integer not null default 10 check (charity_contribution_pct between 10 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- CHARITIES
create table public.charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  website_url text,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.charities enable row level security;

create policy "Anyone can view active charities" on public.charities
  for select using (is_active = true);

create policy "Admins can manage charities" on public.charities
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed charities
insert into public.charities (name, description, image_url, is_featured) values
  ('Golf Foundation', 'Bringing golf to young people from all backgrounds through grassroots programs and coaching.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400', true),
  ('Cancer Research UK', 'World-leading cancer research to help beat cancer sooner.', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', false),
  ('Children''s Society', 'Helping children and young people to have a better life.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400', false),
  ('Age UK', 'Championing the rights and needs of older people across the UK.', 'https://images.unsplash.com/photo-1574279606130-09958dc756f7?w=400', false),
  ('Mind', 'Mental health charity providing advice and support to empower anyone experiencing a mental health problem.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', false);


-- GOLF SCORES
create table public.golf_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score between 1 and 45),
  score_date date not null,
  created_at timestamptz default now(),
  unique(user_id, score_date)
);

alter table public.golf_scores enable row level security;

create policy "Users can manage own scores" on public.golf_scores
  for all using (auth.uid() = user_id);

create policy "Admins can view all scores" on public.golf_scores
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Enforce max 5 scores per user (rolling)
create or replace function public.enforce_max_scores()
returns trigger as $$
declare
  score_count integer;
  oldest_id uuid;
begin
  select count(*) into score_count
  from public.golf_scores
  where user_id = new.user_id;

  if score_count >= 5 then
    select id into oldest_id
    from public.golf_scores
    where user_id = new.user_id
    order by score_date asc
    limit 1;

    delete from public.golf_scores where id = oldest_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger enforce_rolling_scores
  before insert on public.golf_scores
  for each row execute function public.enforce_max_scores();


-- DRAWS
  create table public.draws (
  id uuid default uuid_generate_v4() primary key,
  month integer not null check (month between 1 and 12),
  year integer not null,
  draw_type text not null default 'random' check (draw_type in ('random', 'algorithmic')),
  drawn_numbers integer[] not null,
  status text not null default 'pending' check (status in ('pending', 'simulated', 'published')),
  prize_pool_total numeric(10,2) not null default 0,
  jackpot_rollover numeric(10,2) default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  unique(month, year)
);

alter table public.draws enable row level security;

create policy "Anyone can view published draws" on public.draws
  for select using (status = 'published');

create policy "Admins can manage draws" on public.draws
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- DRAW ENTRIES (which users entered each draw)

  create table public.draw_entries (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_numbers integer[] not null,
  match_count integer default 0,
  is_winner boolean default false,
  created_at timestamptz default now(),
  unique(draw_id, user_id)
);

alter table public.draw_entries enable row level security;

create policy "Users can view own entries" on public.draw_entries
  for select using (auth.uid() = user_id);

create policy "Admins can manage entries" on public.draw_entries
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────
-- WINNERS
-- ─────────────────────────────────────────────
create table public.winners (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_type text not null check (match_type in ('5-match', '4-match', '3-match')),
  prize_amount numeric(10,2) not null,
  proof_url text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'approved', 'rejected', 'paid')),
  admin_notes text,
  created_at timestamptz default now()
);

alter table public.winners enable row level security;

create policy "Users can view own winnings" on public.winners
  for select using (auth.uid() = user_id);

create policy "Admins can manage winners" on public.winners
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS LOG
-- ─────────────────────────────────────────────
create table public.subscription_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_type text not null check (event_type in ('subscribed', 'renewed', 'cancelled', 'lapsed', 'upgraded')),
  plan text,
  amount numeric(10,2),
  stripe_session_id text,
  created_at timestamptz default now()
);

alter table public.subscription_events enable row level security;

create policy "Users can view own subscription events" on public.subscription_events
  for select using (auth.uid() = user_id);

create policy "Admins can view all events" on public.subscription_events
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────
