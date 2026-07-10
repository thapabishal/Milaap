-- ============================================================
-- MILAAP — Supabase Database Schema
-- Platform maintained by All Care Nepal
-- Run this entire file in Supabase SQL Editor once
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for text search on animal names

-- ============================================================
-- ENUMS
-- ============================================================

create type animal_species as enum ('dog', 'cat', 'rabbit', 'other');
create type animal_gender   as enum ('male', 'female', 'unknown');
create type animal_size     as enum ('small', 'medium', 'large', 'xlarge');
create type energy_level    as enum ('low', 'medium', 'high');

create type animal_status as enum (
  'available',
  'reserved',
  'fostered',
  'medical_hold',
  'adopted'
);

create type user_role as enum (
  'volunteer',
  'org_admin',
  'platform_admin'
);

create type happy_tail_status as enum (
  'pending',
  'approved',
  'rejected'
);

create type reminder_type as enum (
  '30day',
  '6month',
  'custom'
);

create type reminder_status as enum (
  'pending',
  'sent',
  'dismissed'
);

create type analytics_event_type as enum (
  'profile_view',
  'whatsapp_tap',
  'share_tap',
  'happy_tails_view'
);

create type analytics_source as enum (
  'qr',
  'direct',
  'social',
  'embed',
  'unknown'
);

create type org_verification_status as enum (
  'pending',
  'verified',
  'suspended'
);

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

create table organizations (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  slug                  text unique not null,         -- URL identifier: acn-butwal
  description           text,
  description_ne        text,                         -- Nepali description
  city                  text not null,
  district              text,
  province              text,
  whatsapp_number       text not null,                -- digits only, no +977: "9800000000"
  whatsapp_display      text,                         -- formatted: "98-0000-0000"
  logo_url              text,
  cover_url             text,
  website_url           text,
  facebook_url          text,
  instagram_url         text,
  registration_number   text,                         -- NGO registration, shown as trust signal
  founded_year          int,
  animals_rescued_count int default 0,                -- manually maintained count for display
  verification_status   org_verification_status not null default 'pending',
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- USERS (volunteers / admins)
-- References auth.users managed by Supabase Auth
-- ============================================================

create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  full_name       text not null,
  role            user_role not null default 'volunteer',
  avatar_url      text,
  phone           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- platform_admin has no org (organization_id is null)
-- volunteer and org_admin always have an organization_id

-- ============================================================
-- ANIMALS
-- The core table. Every animal gets a permanent record.
-- Profiles persist after adoption — status changes, URL never changes.
-- ============================================================

create table animals (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete restrict,
  created_by      uuid references users(id) on delete set null,
  updated_by      uuid references users(id) on delete set null,

  -- Identity
  name            text not null,
  slug            text unique not null,               -- permanent URL: milaap.dpdns.org/p/bruno
  species         animal_species not null default 'dog',
  breed           text,                               -- free text, not enum
  age_years       int,
  age_months      int,                                -- for animals under 1 year
  gender          animal_gender not null default 'unknown',
  size            animal_size,
  color           text,

  -- Story (THE most important fields — quality checked before publish)
  one_liner       text not null,                      -- EN: "First to greet you every morning"
  one_liner_ne    text,                               -- NE: auto-translated draft, manually reviewed
  story_en        text not null,                      -- full rescue + personality story, min 80 words
  story_ne        text,
  personality_en  text,                               -- "the kind of dog who..."
  personality_ne  text,

  -- Compatibility tags (shown on card and profile)
  good_with_kids  boolean,
  good_with_dogs  boolean,
  good_with_cats  boolean,
  apartment_ok    boolean,
  needs_garden    boolean,
  energy_level    energy_level,

  -- Medical (is_vaccinated and is_neutered shown publicly; medical_notes internal only)
  is_vaccinated   boolean not null default false,
  is_neutered     boolean not null default false,
  is_microchipped boolean not null default false,
  medical_notes   text,                               -- internal only, never shown publicly

  -- Status & timing
  status          animal_status not null default 'available',
  intake_date     date not null,                      -- drives the waiting counter
  adopted_date    date,                               -- set when status → adopted
  adopted_by_name text,                               -- adopter display name for certificate
  adopted_by_city text,

  -- Media
  -- Array of {path: string, is_hero: boolean, caption?: string}
  -- path is storage path only (not full URL)
  -- First photo with is_hero:true is used for cards and OG images
  photos          jsonb not null default '[]'::jsonb,

  -- Discovery & editorial
  is_featured     boolean not null default false,     -- featured in "unexpected" slot every 5th card
  view_count      int not null default 0,
  whatsapp_tap_count int not null default 0,
  share_count     int not null default 0,

  meta_description text,                             -- auto-generated if null: one_liner + org + days

  -- Publish state
  is_published    boolean not null default false,     -- draft until quality check passes
  published_at    timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes for discovery feed performance
create index idx_animals_status          on animals(status) where is_published = true;
create index idx_animals_intake_date     on animals(intake_date desc) where is_published = true;
create index idx_animals_organization    on animals(organization_id);
create index idx_animals_slug            on animals(slug);
create index idx_animals_species_status  on animals(species, status) where is_published = true;
create index idx_animals_name_search     on animals using gin(name gin_trgm_ops);

-- Computed: days_waiting = current_date - intake_date
-- Never store this — always compute in queries:
-- select *, (current_date - intake_date) as days_waiting from animals

-- ============================================================
-- HAPPY TAILS
-- Adopter-submitted stories after adoption.
-- Goes through volunteer approval before going public.
-- ============================================================

create table happy_tails (
  id              uuid primary key default uuid_generate_v4(),
  animal_id       uuid not null references animals(id) on delete restrict,
  organization_id uuid not null references organizations(id) on delete restrict,

  -- Adopter info (never shown publicly except name + city)
  adopter_name    text not null,
  adopter_city    text,
  adopter_whatsapp text,                              -- stored for follow-up only, never public

  -- Story content
  story_en        text not null,                      -- adopter's own words
  story_ne        text,                               -- optional Nepali version
  photo_url       text not null,                      -- "at home" photo path in storage
  shelter_photo_url text,                             -- auto-copied from animal.photos[hero] at submission time

  -- Computed at submission time (snapshot — animal may be updated later)
  days_waited     int,                                -- snapshot of days_waiting at adoption

  -- Approval workflow
  status          happy_tail_status not null default 'pending',
  approved_by     uuid references users(id) on delete set null,
  approved_at     timestamptz,
  rejection_reason text,

  -- Follow-up tracking (which reminder created this submission)
  from_reminder_id uuid,                              -- references followup_reminders(id) — set on submit

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_happy_tails_status   on happy_tails(status);
create index idx_happy_tails_org      on happy_tails(organization_id);
create index idx_happy_tails_animal   on happy_tails(animal_id);

-- ============================================================
-- FOLLOWUP REMINDERS
-- Auto-created when animal status → adopted.
-- Shown as a queue in the CMS dashboard.
-- Volunteer taps "Send" → WhatsApp opens with pre-written message.
-- ============================================================

create table followup_reminders (
  id              uuid primary key default uuid_generate_v4(),
  animal_id       uuid not null references animals(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  happy_tail_id   uuid references happy_tails(id) on delete set null,

  -- Adopter contact (copied from animal at adoption time)
  adopter_name    text not null,
  adopter_whatsapp text not null,

  -- Scheduling
  reminder_type   reminder_type not null,
  due_date        date not null,                      -- auto: adopted_date + 30 or +180 days

  -- Status
  status          reminder_status not null default 'pending',
  sent_at         timestamptz,
  sent_by         uuid references users(id) on delete set null,

  -- Pre-written message (volunteer edits before sending via WhatsApp)
  message_en      text,
  message_ne      text,

  -- Unique token for the Happy Tails submission link
  -- milaap.dpdns.org/happy-tails/submit/{submission_token}
  submission_token text unique not null default uuid_generate_v4()::text,
  token_expires_at timestamptz not null default (now() + interval '90 days'),

  created_at      timestamptz not null default now()
);

create index idx_reminders_org_due     on followup_reminders(organization_id, due_date) where status = 'pending';
create index idx_reminders_token       on followup_reminders(submission_token);

-- ============================================================
-- ANALYTICS EVENTS
-- Append-only. No PII. No user tracking.
-- Just counts for the volunteer dashboard.
-- ============================================================

create table analytics_events (
  id              uuid primary key default uuid_generate_v4(),
  animal_id       uuid references animals(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  event_type      analytics_event_type not null,
  source          analytics_source not null default 'unknown',
  created_at      timestamptz not null default now()
);

-- Partition by day for query performance (simple index is fine for V1)
create index idx_analytics_org_type_date on analytics_events(organization_id, event_type, created_at desc);
create index idx_analytics_animal_type   on analytics_events(animal_id, event_type);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at on any table that has it
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auto-create followup reminders when animal status → adopted
create or replace function handle_animal_adopted()
returns trigger language plpgsql security definer as $$
begin
  -- Only fire when status changes TO adopted
  if new.status = 'adopted' and old.status != 'adopted' then

    -- Set adopted_date if not already set
    if new.adopted_date is null then
      new.adopted_date = current_date;
    end if;

    -- 30-day reminder
    insert into followup_reminders (
      animal_id, organization_id, adopter_name, adopter_whatsapp,
      reminder_type, due_date,
      message_en, message_ne
    ) values (
      new.id,
      new.organization_id,
      coalesce(new.adopted_by_name, 'the adopter'),
      coalesce('', ''),  -- volunteer must fill adopter WhatsApp in CMS
      '30day',
      coalesce(new.adopted_date, current_date) + interval '30 days',
      'Namaste ' || coalesce(new.adopted_by_name, '') || '! 🐾 It has been 30 days since ' || new.name || ' came home. We hope they have settled in well! Could you share a quick update — even one photo and two sentences? It helps inspire others to adopt. Submit here: https://milaap.dpdns.org/happy-tails/submit/{token} Dhanyabad! 🙏',
      'नमस्ते ' || coalesce(new.adopted_by_name, '') || '! 🐾 ' || new.name || ' घर आएको ३० दिन भयो। उनी राम्ररी बसिरहेको आशा छ! एउटा फोटो र दुई वाक्य share गर्नु हुन्छ? अरूलाई adopt गर्न प्रेरित गर्छ। यहाँ submit गर्नुस्: https://milaap.dpdns.org/happy-tails/submit/{token} धन्यवाद! 🙏'
    );

    -- 6-month reminder
    insert into followup_reminders (
      animal_id, organization_id, adopter_name, adopter_whatsapp,
      reminder_type, due_date,
      message_en, message_ne
    ) values (
      new.id,
      new.organization_id,
      coalesce(new.adopted_by_name, 'the adopter'),
      coalesce('', ''),
      '6month',
      coalesce(new.adopted_date, current_date) + interval '180 days',
      'Namaste ' || coalesce(new.adopted_by_name, '') || '! 🐾 It has been 6 months since ' || new.name || ' found their home with you. How are they doing? We would love an update! milaap.dpdns.org',
      'नमस्ते! ' || new.name || ' लाई घर आएको ६ महिना भयो। कस्तो छ उनी? एउटा update दिनु हुन्छ? milaap.dpdns.org'
    );

  end if;
  return new;
end;
$$;

-- Auto-publish timestamp
create or replace function handle_animal_published()
returns trigger language plpgsql as $$
begin
  if new.is_published = true and old.is_published = false then
    new.published_at = now();
  end if;
  return new;
end;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function handle_updated_at();

create trigger trg_users_updated_at
  before update on users
  for each row execute function handle_updated_at();

create trigger trg_animals_updated_at
  before update on animals
  for each row execute function handle_updated_at();

create trigger trg_animals_adopted
  before update on animals
  for each row execute function handle_animal_adopted();

create trigger trg_animals_published
  before update on animals
  for each row execute function handle_animal_published();

create trigger trg_happy_tails_updated_at
  before update on happy_tails
  for each row execute function handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table organizations     enable row level security;
alter table users             enable row level security;
alter table animals           enable row level security;
alter table happy_tails       enable row level security;
alter table followup_reminders enable row level security;
alter table analytics_events  enable row level security;

-- Helper: get current user's role
create or replace function auth_user_role()
returns user_role language sql security definer stable as $$
  select role from users where id = auth.uid()
$$;

-- Helper: get current user's org_id
create or replace function auth_user_org_id()
returns uuid language sql security definer stable as $$
  select organization_id from users where id = auth.uid()
$$;

-- ── ORGANIZATIONS ──
-- Public: anyone can read active, verified orgs
create policy "orgs_public_read"
  on organizations for select
  using (is_active = true);

-- Org admin: edit their own org
create policy "orgs_org_admin_update"
  on organizations for update
  using (id = auth_user_org_id() and auth_user_role() in ('org_admin', 'platform_admin'));

-- Platform admin: full access
create policy "orgs_platform_admin_all"
  on organizations for all
  using (auth_user_role() = 'platform_admin');

-- ── USERS ──
-- Users can read their own row
create policy "users_read_own"
  on users for select
  using (id = auth.uid());

-- Org admins can read all users in their org
create policy "users_org_admin_read"
  on users for select
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('org_admin', 'platform_admin')
  );

-- Org admins can deactivate users in their org (not delete)
create policy "users_org_admin_update"
  on users for update
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('org_admin', 'platform_admin')
  );

-- Platform admin: full access
create policy "users_platform_admin_all"
  on users for all
  using (auth_user_role() = 'platform_admin');

-- ── ANIMALS ──
-- Public: anyone can read published animals
-- (medical_hold animals show "not currently available" but profile is still readable)
create policy "animals_public_read"
  on animals for select
  using (is_published = true);

-- Volunteers: full CRUD for their org only
create policy "animals_volunteer_insert"
  on animals for insert
  with check (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('volunteer', 'org_admin', 'platform_admin')
  );

create policy "animals_volunteer_update"
  on animals for update
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('volunteer', 'org_admin', 'platform_admin')
  );

create policy "animals_volunteer_delete"
  on animals for delete
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('org_admin', 'platform_admin')
  );

-- Platform admin: read all (including unpublished from all orgs)
create policy "animals_platform_admin_all"
  on animals for all
  using (auth_user_role() = 'platform_admin');

-- ── HAPPY TAILS ──
-- Public: read approved happy tails
create policy "happy_tails_public_read"
  on happy_tails for select
  using (status = 'approved');

-- Anyone with valid token can insert (no auth required — token is the auth)
-- Handled in API route with service role key, not RLS

-- Volunteers: read and update (approve/reject) for their org
create policy "happy_tails_volunteer_read"
  on happy_tails for select
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('volunteer', 'org_admin', 'platform_admin')
  );

create policy "happy_tails_volunteer_update"
  on happy_tails for update
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('volunteer', 'org_admin', 'platform_admin')
  );

-- ── FOLLOWUP REMINDERS ──
-- Volunteers: read and update reminders for their org
create policy "reminders_volunteer_read"
  on followup_reminders for select
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('volunteer', 'org_admin', 'platform_admin')
  );

create policy "reminders_volunteer_update"
  on followup_reminders for update
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('volunteer', 'org_admin', 'platform_admin')
  );

-- ── ANALYTICS EVENTS ──
-- Public insert (fire-and-forget, no auth needed)
create policy "analytics_public_insert"
  on analytics_events for insert
  with check (true);

-- Volunteers: read their org's events
create policy "analytics_volunteer_read"
  on analytics_events for select
  using (
    organization_id = auth_user_org_id()
    and auth_user_role() in ('volunteer', 'org_admin', 'platform_admin')
  );

-- Platform admin: read all
create policy "analytics_platform_admin_read"
  on analytics_events for select
  using (auth_user_role() = 'platform_admin');

-- ============================================================
-- SEED DATA — All Care Nepal (first organization)
-- Update the whatsapp_number with the real ACN WhatsApp number
-- ============================================================

insert into organizations (
  name,
  slug,
  description,
  description_ne,
  city,
  district,
  province,
  whatsapp_number,
  whatsapp_display,
  website_url,
  facebook_url,
  instagram_url,
  verification_status,
  is_active,
  founded_year
) values (
  'All Care Nepal',
  'acn-butwal',
  'All Care Nepal is a registered animal welfare organization based in Butwal, Nepal. We rescue, rehabilitate, and rehome animals across the Lumbini Province. Milaap is our platform — built to help every rescued animal find their family.',
  'अल केयर नेपाल बुटवलमा आधारित एक दर्ता प्राणी कल्याण संस्था हो। हामी लुम्बिनी प्रदेशभर जनावरहरू उद्धार, पुनर्स्थापना र पुनःघर गर्छौं।',
  'Charange, Butwal',
  'Rupandehi',
  'Lumbini Province',
  '9867002067',  -- ← REPLACE with real ACN WhatsApp number (digits only, no +977)
  '98-6700-2067', -- ← REPLACE with formatted display number
  'https://allcarenepal.org',
  'https://facebook.com/allcarenepal',
  'https://instagram.com/allcarenepal',
  'verified',
  true,
  2020           -- ← REPLACE with ACN founding year
);

-- ============================================================
-- VERIFICATION QUERIES
-- Run these after the schema to confirm everything is set up
-- ============================================================

-- Should show 6 tables
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;
-- Expected: analytics_events, animals, followup_reminders, happy_tails, organizations, users

-- Should show 1 org (All Care Nepal)
select id, name, slug, verification_status from organizations;

-- Should show all RLS policies
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- ============================================================
-- NOTES FOR FUTURE SCHEMA MIGRATIONS
-- ============================================================
-- When adding columns: always use ALTER TABLE ... ADD COLUMN ... DEFAULT
-- When adding indexes: always use CREATE INDEX CONCURRENTLY for production
-- Never drop enums — add new values with ALTER TYPE ... ADD VALUE
-- The animals.photos jsonb array format must not change without migrating existing rows
-- followup_reminders.submission_token is the security boundary for Happy Tails submission
--   — it must remain unique and non-guessable (uuid_generate_v4() ensures this)