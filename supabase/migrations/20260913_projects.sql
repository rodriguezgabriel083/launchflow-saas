-- Run this migration in the Supabase SQL Editor for an existing LaunchFlow database.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text not null default '',
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_workspace_id_idx on public.projects(workspace_id);
create index if not exists projects_workspace_status_idx on public.projects(workspace_id, status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();

alter table public.projects enable row level security;

-- Avoid recursive RLS when a member reads their own membership record.
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

drop policy if exists "Members can view people in their workspace" on public.workspace_members;
create policy "Members can view people in their workspace" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can view projects in their workspace" on public.projects;
drop policy if exists "Permitted members can create projects" on public.projects;
drop policy if exists "Permitted members can update projects" on public.projects;
drop policy if exists "Permitted members can delete projects" on public.projects;

create policy "Members can view projects in their workspace" on public.projects
  for select to authenticated using (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid()));
create policy "Permitted members can create projects" on public.projects
  for insert to authenticated with check (created_by = auth.uid() and exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_create_projects)));
create policy "Permitted members can update projects" on public.projects
  for update to authenticated using (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_edit_projects))) with check (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_edit_projects)));
create policy "Permitted members can delete projects" on public.projects
  for delete to authenticated using (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_edit_projects)));
