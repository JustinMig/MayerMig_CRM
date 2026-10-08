create table if not exists public.calendar_event_client_links (
  event_id text primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.calendar_event_client_links enable row level security;

drop policy if exists calendar_event_client_links_select on public.calendar_event_client_links;
create policy calendar_event_client_links_select
on public.calendar_event_client_links
for select to authenticated
using (private.mig_can_access_client(client_id));

drop policy if exists calendar_event_client_links_write on public.calendar_event_client_links;
create policy calendar_event_client_links_write
on public.calendar_event_client_links
for all to authenticated
using (private.mig_can_access_client(client_id))
with check (
  updated_by = auth.uid()
  and private.mig_can_access_client(client_id)
);

create index if not exists calendar_event_client_links_client_idx
on public.calendar_event_client_links(client_id);
