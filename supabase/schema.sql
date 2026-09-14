-- Run this file in the Supabase SQL Editor before enabling registrations.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'employee')),
  can_create_projects boolean not null default false,
  can_edit_projects boolean not null default false,
  can_create_tasks boolean not null default false,
  can_assign_tasks boolean not null default false,
  can_manage_users boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  workspace_name text;
  new_workspace_id uuid;
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), new.email);

  workspace_name := coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)) || '''s Workspace';
  insert into public.workspaces (name) values (workspace_name) returning id into new_workspace_id;

  insert into public.workspace_members (
    workspace_id, user_id, role, can_create_projects, can_edit_projects,
    can_create_tasks, can_assign_tasks, can_manage_users
  ) values (new_workspace_id, new.id, 'admin', true, true, true, true, true);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid() and role = 'admin'
  );
$$;

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

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can view their workspaces" on public.workspaces
  for select to authenticated using (
    exists (select 1 from public.workspace_members m where m.workspace_id = workspaces.id and m.user_id = auth.uid())
  );
create policy "Admins can update their workspaces" on public.workspaces
  for update to authenticated using (public.is_workspace_admin(id)) with check (public.is_workspace_admin(id));

drop policy if exists "Members can view people in their workspace" on public.workspace_members;
create policy "Members can view people in their workspace" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "Members can view projects in their workspace" on public.projects
  for select to authenticated using (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid()));
create policy "Permitted members can create projects" on public.projects
  for insert to authenticated with check (created_by = auth.uid() and exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_create_projects)));
create policy "Permitted members can update projects" on public.projects
  for update to authenticated using (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_edit_projects))) with check (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_edit_projects)));
create policy "Permitted members can delete projects" on public.projects
  for delete to authenticated using (exists (select 1 from public.workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid() and (m.role = 'admin' or m.can_edit_projects)));

-- No client-side insert/delete policy is intentionally provided. New owners are created only by the auth trigger.
