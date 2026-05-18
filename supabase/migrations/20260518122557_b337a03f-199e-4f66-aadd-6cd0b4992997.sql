
-- Roles enum
create type public.app_role as enum ('super_admin','admin','manager','agent','viewer');
create type public.account_status as enum ('pending','active','banned');
create type public.job_status as enum ('queued','running','success','failed','cancelled');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  email text,
  status public.account_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- User roles (separate table — never on profiles)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer role check (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role in ('super_admin','admin'));
$$;

-- Platforms (publishing destinations)
create table public.platforms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null, -- facebook_page, facebook_marketplace, bayut_feed, property_finder_feed, dubizzle_export, custom_webhook, wordpress
  config jsonb not null default '{}'::jsonb, -- urls, page ids, etc. (NOT secrets)
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.platforms enable row level security;

-- Listings (the unified ad)
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric,
  currency text default 'AED',
  category text,
  location text,
  contact jsonb default '{}'::jsonb,
  media jsonb default '[]'::jsonb, -- array of image urls
  attributes jsonb default '{}'::jsonb, -- platform-specific extras
  kind text not null default 'ad', -- ad, video, reel, story
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.listings enable row level security;

-- Publish jobs
create table public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  platform_id uuid not null references public.platforms(id) on delete cascade,
  status public.job_status not null default 'queued',
  progress int not null default 0,
  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  external_post_id text,
  external_post_url text,
  created_at timestamptz not null default now()
);
alter table public.publish_jobs enable row level security;

-- Activity log
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.activity_log enable row level security;

-- updated_at trigger
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger trg_profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger trg_listings_touch before update on public.listings for each row execute function public.touch_updated_at();

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;
  insert into public.profiles (id, email, display_name, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    case when is_first then 'active'::account_status else 'pending'::account_status end
  );
  insert into public.user_roles (user_id, role)
  values (new.id, case when is_first then 'super_admin'::app_role else 'viewer'::app_role end);
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS policies
-- profiles
create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "admins read all profiles" on public.profiles for select using (public.is_admin(auth.uid()));
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "admins update any profile" on public.profiles for update using (public.is_admin(auth.uid()));
create policy "admins delete profile" on public.profiles for delete using (public.is_admin(auth.uid()));

-- user_roles
create policy "users read own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "admins read all roles" on public.user_roles for select using (public.is_admin(auth.uid()));
create policy "admins manage roles" on public.user_roles for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- platforms
create policy "owners manage platforms" on public.platforms for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all platforms" on public.platforms for select using (public.is_admin(auth.uid()));

-- listings
create policy "owners manage listings" on public.listings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all listings" on public.listings for select using (public.is_admin(auth.uid()));

-- publish_jobs
create policy "owners manage jobs" on public.publish_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all jobs" on public.publish_jobs for select using (public.is_admin(auth.uid()));

-- activity_log
create policy "users read own activity" on public.activity_log for select using (auth.uid() = user_id);
create policy "admins read all activity" on public.activity_log for select using (public.is_admin(auth.uid()));
create policy "authenticated insert activity" on public.activity_log for insert with check (auth.uid() = user_id);

-- Realtime for live job progress
alter publication supabase_realtime add table public.publish_jobs;
alter publication supabase_realtime add table public.activity_log;
