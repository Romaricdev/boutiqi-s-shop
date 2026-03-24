-- ============================================================================
-- Migration 002 – Ops & admin tables
-- Boutiki V1 – Roles: admin, merchant
-- Depends on: 20250324_001_core.sql
-- ============================================================================

-- ============================================================================
-- 1. support_tickets
-- ============================================================================
create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.ticket_status   as enum ('open', 'in_progress', 'waiting_customer', 'resolved');
create type public.ticket_channel  as enum ('whatsapp', 'email', 'dashboard');

create table public.support_tickets (
  id                          uuid primary key default gen_random_uuid(),
  shop_id                     uuid references public.shops(id) on delete set null,
  merchant_id                 uuid references public.merchants(id) on delete set null,
  subject                     text not null,
  channel                     public.ticket_channel not null default 'dashboard',
  priority                    public.ticket_priority not null default 'medium',
  status                      public.ticket_status not null default 'open',
  assigned_to                 uuid references public.profiles(id) on delete set null,
  tags                        text[] not null default '{}',
  sla_first_response_target_min integer not null default 60,
  sla_resolve_target_min        integer not null default 1440,
  first_response_at           timestamptz,
  resolved_at                 timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index idx_support_tickets_shop       on public.support_tickets(shop_id);
create index idx_support_tickets_merchant   on public.support_tickets(merchant_id);
create index idx_support_tickets_status     on public.support_tickets(status);
create index idx_support_tickets_priority   on public.support_tickets(priority);
create index idx_support_tickets_created_at on public.support_tickets(created_at desc);

alter table public.support_tickets enable row level security;

create policy "Admins full access on support_tickets"
  on public.support_tickets for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own support tickets"
  on public.support_tickets for select
  using ( merchant_id in (select id from public.merchants where profile_id = auth.uid()) );

create policy "Merchant creates support tickets"
  on public.support_tickets for insert
  with check ( merchant_id in (select id from public.merchants where profile_id = auth.uid()) );

create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. support_messages
-- ============================================================================
create type public.support_message_from as enum ('merchant', 'support', 'system');

create table public.support_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  author     text not null,
  sender     public.support_message_from not null default 'merchant',
  body       text not null,
  attachments jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index idx_support_messages_ticket on public.support_messages(ticket_id);

alter table public.support_messages enable row level security;

create policy "Admins full access on support_messages"
  on public.support_messages for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own ticket messages"
  on public.support_messages for select
  using ( ticket_id in (select id from public.support_tickets where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

create policy "Merchant creates messages on own tickets"
  on public.support_messages for insert
  with check ( ticket_id in (select id from public.support_tickets where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

-- ============================================================================
-- 3. support_notes  (internal, admin-only)
-- ============================================================================
create table public.support_notes (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index idx_support_notes_ticket on public.support_notes(ticket_id);

alter table public.support_notes enable row level security;

create policy "Admins full access on support_notes"
  on public.support_notes for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- ============================================================================
-- 4. moderation_cases
-- ============================================================================
create type public.moderation_target   as enum ('shop', 'product', 'review');
create type public.moderation_priority as enum ('low', 'medium', 'high', 'critical');
create type public.moderation_status   as enum ('open', 'in_review', 'resolved', 'rejected');

create table public.moderation_cases (
  id                      uuid primary key default gen_random_uuid(),
  target_type             public.moderation_target not null,
  target_id               uuid,
  target_label            text not null,
  shop_id                 uuid references public.shops(id) on delete set null,
  reason                  text not null,
  reporter                text,
  priority                public.moderation_priority not null default 'medium',
  status                  public.moderation_status not null default 'open',
  assigned_to             uuid references public.profiles(id) on delete set null,
  tags                    text[] not null default '{}',
  sla_review_target_min   integer not null default 240,
  first_review_at         timestamptz,
  resolved_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_moderation_cases_shop       on public.moderation_cases(shop_id);
create index idx_moderation_cases_status     on public.moderation_cases(status);
create index idx_moderation_cases_priority   on public.moderation_cases(priority);
create index idx_moderation_cases_target     on public.moderation_cases(target_type);
create index idx_moderation_cases_created_at on public.moderation_cases(created_at desc);

alter table public.moderation_cases enable row level security;

create policy "Admins full access on moderation_cases"
  on public.moderation_cases for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own moderation cases"
  on public.moderation_cases for select
  using ( shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid())) );

create trigger moderation_cases_updated_at
  before update on public.moderation_cases
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. moderation_messages
-- ============================================================================
create type public.moderation_message_from as enum ('merchant', 'moderator', 'system');

create table public.moderation_messages (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.moderation_cases(id) on delete cascade,
  author      text not null,
  sender      public.moderation_message_from not null default 'merchant',
  body        text not null,
  attachments jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

create index idx_moderation_messages_case on public.moderation_messages(case_id);

alter table public.moderation_messages enable row level security;

create policy "Admins full access on moderation_messages"
  on public.moderation_messages for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Merchant reads own moderation messages"
  on public.moderation_messages for select
  using ( case_id in (select id from public.moderation_cases where shop_id in (select id from public.shops where merchant_id in (select id from public.merchants where profile_id = auth.uid()))) );

-- ============================================================================
-- 6. moderation_notes  (internal, admin-only)
-- ============================================================================
create table public.moderation_notes (
  id         uuid primary key default gen_random_uuid(),
  case_id    uuid not null references public.moderation_cases(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index idx_moderation_notes_case on public.moderation_notes(case_id);

alter table public.moderation_notes enable row level security;

create policy "Admins full access on moderation_notes"
  on public.moderation_notes for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- ============================================================================
-- 7. platform_settings  (key/value per environment)
-- ============================================================================
create type public.platform_environment as enum ('dev', 'staging', 'prod');

create table public.platform_settings (
  id          uuid primary key default gen_random_uuid(),
  environment public.platform_environment not null default 'prod',
  key         text not null,
  value       jsonb not null default 'null',
  description text,
  is_secret   boolean not null default false,
  updated_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (environment, key)
);

alter table public.platform_settings enable row level security;

create policy "Admins full access on platform_settings"
  on public.platform_settings for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create trigger platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 8. feature_flags
-- ============================================================================
create table public.feature_flags (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  label       text not null,
  hint        text,
  enabled     boolean not null default false,
  updated_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

create policy "Admins full access on feature_flags"
  on public.feature_flags for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Authenticated reads feature flags"
  on public.feature_flags for select
  using ( auth.role() = 'authenticated' );

create trigger feature_flags_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 9. webhooks
-- ============================================================================
create table public.webhooks (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  url         text not null,
  secret      text,
  events      text[] not null default '{}',
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.webhooks enable row level security;

create policy "Admins full access on webhooks"
  on public.webhooks for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create trigger webhooks_updated_at
  before update on public.webhooks
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 10. notification_rules
-- ============================================================================
create table public.notification_rules (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  event_type      text not null,
  channel_email   boolean not null default true,
  channel_whatsapp boolean not null default false,
  channel_webhook boolean not null default false,
  threshold_value integer,
  threshold_unit  text,
  quiet_hours_start time,
  quiet_hours_end   time,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.notification_rules enable row level security;

create policy "Admins full access on notification_rules"
  on public.notification_rules for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create trigger notification_rules_updated_at
  before update on public.notification_rules
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 11. export_templates
-- ============================================================================
create type public.export_frequency as enum ('daily', 'weekly', 'monthly', 'manual');

create table public.export_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  entity      text not null,
  columns     text[] not null default '{}',
  frequency   public.export_frequency not null default 'manual',
  recipients  text[] not null default '{}',
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.export_templates enable row level security;

create policy "Admins full access on export_templates"
  on public.export_templates for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create trigger export_templates_updated_at
  before update on public.export_templates
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 12. export_jobs
-- ============================================================================
create type public.export_job_status as enum ('pending', 'running', 'completed', 'failed');

create table public.export_jobs (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid references public.export_templates(id) on delete set null,
  status       public.export_job_status not null default 'pending',
  file_url     text,
  row_count    integer,
  error        text,
  started_at   timestamptz,
  completed_at timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index idx_export_jobs_template on public.export_jobs(template_id);
create index idx_export_jobs_status   on public.export_jobs(status);

alter table public.export_jobs enable row level security;

create policy "Admins full access on export_jobs"
  on public.export_jobs for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- ============================================================================
-- 13. audit_logs  (global action journal)
-- ============================================================================
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_actor      on public.audit_logs(actor_id);
create index idx_audit_logs_entity     on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

create policy "Admins full access on audit_logs"
  on public.audit_logs for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- ============================================================================
-- Realtime: enable for live-update tables
-- ============================================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.support_tickets;
alter publication supabase_realtime add table public.support_messages;
alter publication supabase_realtime add table public.moderation_cases;
alter publication supabase_realtime add table public.moderation_messages;
alter publication supabase_realtime add table public.analytics_events;
