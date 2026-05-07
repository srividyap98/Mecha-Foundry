-- ============================================================
-- Mecha Foundry — Supabase Schema
-- Run in your Supabase SQL editor or via supabase db push
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id                   uuid primary key references auth.users on delete cascade,
  email                text not null,
  username             text not null unique,
  full_name            text not null,
  avatar_url           text,
  bio                  text,
  role                 text not null default 'viewer' check (role in ('viewer','creator','investor')),
  location             text,
  website              text,
  github_url           text,
  investor_thesis      text,
  investor_check_size  text,
  investor_industries  text[],
  investor_verified    boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Ideas ─────────────────────────────────────────────────────
create table public.ideas (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  problem         text not null,
  solution        text not null,
  stage           text not null default 'concept' check (stage in ('concept','mvp','beta','launched')),
  category        text not null default 'other',
  tags            text[] not null default '{}',
  skills_needed   text[] not null default '{}',
  tech_stack      text[] not null default '{}',
  collab_setting  text not null default 'apply' check (collab_setting in ('open','apply','invite_only')),
  github_url      text,
  figma_url       text,
  demo_url        text,
  doc_url         text,
  upvote_count    integer not null default 0,
  comment_count   integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index ideas_creator_idx    on public.ideas(creator_id);
create index ideas_category_idx   on public.ideas(category);
create index ideas_stage_idx      on public.ideas(stage);
create index ideas_upvotes_idx    on public.ideas(upvote_count desc);
create index ideas_created_idx    on public.ideas(created_at desc);
create index ideas_title_search   on public.ideas using gin(to_tsvector('english', title || ' ' || problem || ' ' || solution));

-- ── Upvotes ───────────────────────────────────────────────────
create table public.upvotes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  idea_id    uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, idea_id)
);

-- Atomic increment/decrement via RPC
create or replace function public.increment_upvote(idea_id uuid)
returns void language sql security definer as $$
  update public.ideas set upvote_count = upvote_count + 1 where id = idea_id;
$$;

create or replace function public.decrement_upvote(idea_id uuid)
returns void language sql security definer as $$
  update public.ideas set upvote_count = greatest(0, upvote_count - 1) where id = idea_id;
$$;

-- ── Saved Ideas ───────────────────────────────────────────────
create table public.saved_ideas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  idea_id    uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, idea_id)
);

-- ── Applications ──────────────────────────────────────────────
create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  idea_id       uuid not null references public.ideas(id) on delete cascade,
  applicant_id  uuid not null references public.profiles(id) on delete cascade,
  role_offered  text not null,
  message       text not null,
  portfolio_url text,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(idea_id, applicant_id)
);

create index applications_idea_idx      on public.applications(idea_id);
create index applications_applicant_idx on public.applications(applicant_id);

-- ── Groups ────────────────────────────────────────────────────
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  idea_id     uuid not null references public.ideas(id) on delete cascade,
  name        text not null,
  description text,
  is_private  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.group_members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'developer',
  joined_at  timestamptz not null default now(),
  unique(group_id, user_id)
);

create table public.group_updates (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  attachments text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create index group_updates_group_idx on public.group_updates(group_id, created_at desc);

create table public.milestones (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references public.groups(id) on delete cascade,
  title        text not null,
  description  text,
  due_date     date,
  completed    boolean not null default false,
  completed_at timestamptz,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ── Comments ──────────────────────────────────────────────────
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  idea_id    uuid not null references public.ideas(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  parent_id  uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-increment comment count
create or replace function public.increment_comment_count()
returns trigger language plpgsql as $$
begin
  update public.ideas set comment_count = comment_count + 1 where id = new.idea_id;
  return new;
end;
$$;

create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.increment_comment_count();

-- ── Products ──────────────────────────────────────────────────
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  group_id            uuid not null references public.groups(id) on delete cascade,
  idea_id             uuid not null references public.ideas(id) on delete cascade,
  name                text not null,
  tagline             text not null,
  description         text not null,
  screenshots         text[] not null default '{}',
  demo_video_url      text,
  live_url            text,
  github_url          text,
  app_store_url       text,
  docs_url            text,
  pricing             text,
  is_free             boolean not null default true,
  seeking_investment  boolean not null default false,
  published_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Pitches ───────────────────────────────────────────────────
create table public.pitches (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  creator_id      uuid not null references public.profiles(id) on delete cascade,
  headline        text not null,
  elevator_pitch  text not null,
  traction        text not null,
  user_count      text not null,
  revenue         text not null,
  timeline        text not null,
  ask_amount      text,
  equity_offered  text,
  use_of_funds    text,
  is_public       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Investor Messages ─────────────────────────────────────────
create table public.investor_messages (
  id          uuid primary key default gen_random_uuid(),
  from_id     uuid not null references public.profiles(id) on delete cascade,
  to_id       uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  subject     text not null,
  body        text not null,
  check_size  text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Notifications ─────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles           enable row level security;
alter table public.ideas              enable row level security;
alter table public.upvotes            enable row level security;
alter table public.saved_ideas        enable row level security;
alter table public.applications       enable row level security;
alter table public.groups             enable row level security;
alter table public.group_members      enable row level security;
alter table public.group_updates      enable row level security;
alter table public.milestones         enable row level security;
alter table public.comments           enable row level security;
alter table public.products           enable row level security;
alter table public.pitches            enable row level security;
alter table public.investor_messages  enable row level security;
alter table public.notifications      enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "profiles_read_all"   on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Ideas: published ideas are public; creator can do all
create policy "ideas_read_published"  on public.ideas for select using (is_published = true);
create policy "ideas_creator_all"     on public.ideas for all using (auth.uid() = creator_id);

-- Upvotes / saves: users manage their own
create policy "upvotes_own" on public.upvotes for all using (auth.uid() = user_id);
create policy "saved_own"   on public.saved_ideas for all using (auth.uid() = user_id);

-- Applications: applicant or idea creator can view
create policy "applications_read" on public.applications for select
  using (
    auth.uid() = applicant_id
    or auth.uid() = (select creator_id from public.ideas where id = idea_id)
  );
create policy "applications_insert" on public.applications for insert with check (auth.uid() = applicant_id);
create policy "applications_update_creator" on public.applications for update
  using (auth.uid() = (select creator_id from public.ideas where id = idea_id));

-- Groups: members can read; group creation via approved application
create policy "groups_member_read" on public.groups for select
  using (
    not is_private
    or auth.uid() in (select user_id from public.group_members where group_id = id)
  );
create policy "groups_insert_auth" on public.groups for insert with check (auth.uid() is not null);

-- Group members: readable by group members
create policy "group_members_read" on public.group_members for select
  using (auth.uid() in (select user_id from public.group_members where group_id = group_members.group_id));
create policy "group_members_manage" on public.group_members for all using (auth.uid() is not null);

-- Group updates / milestones: group members only
create policy "group_updates_members" on public.group_updates for select
  using (auth.uid() in (select user_id from public.group_members where group_id = group_updates.group_id));
create policy "group_updates_insert" on public.group_updates for insert
  with check (auth.uid() in (select user_id from public.group_members where group_id = group_updates.group_id));
create policy "milestones_members" on public.milestones for all
  using (auth.uid() in (select user_id from public.group_members where group_id = milestones.group_id));

-- Comments: public read
create policy "comments_read" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = author_id);

-- Products: public read
create policy "products_read" on public.products for select using (true);
create policy "products_group_insert" on public.products for insert with check (auth.uid() is not null);

-- Pitches: public if is_public
create policy "pitches_public_read" on public.pitches for select using (is_public = true);
create policy "pitches_creator_all" on public.pitches for all using (auth.uid() = creator_id);

-- Investor messages: sender and recipient
create policy "investor_messages_parties" on public.investor_messages for select
  using (auth.uid() = from_id or auth.uid() = to_id);
create policy "investor_messages_send" on public.investor_messages for insert
  with check (auth.uid() = from_id);

-- Notifications: own only
create policy "notifications_own" on public.notifications for all using (auth.uid() = user_id);
