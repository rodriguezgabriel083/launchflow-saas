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

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assignee_id uuid references auth.users(id) on delete set null,
  due_date date,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_workspace_id_idx on public.tasks(workspace_id);
create index if not exists tasks_workspace_status_idx on public.tasks(workspace_id, status);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_assignee_id_idx on public.tasks(assignee_id);
create index if not exists tasks_workspace_due_date_idx on public.tasks(workspace_id, due_date) where due_date is not null;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks
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
alter table public.tasks enable row level security;

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

create or replace function public.has_workspace_task_permission(target_workspace_id uuid, permission_name text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = target_workspace_id and user_id = auth.uid() and (role = 'admin' or (permission_name = 'create' and can_create_tasks) or (permission_name = 'assign' and can_assign_tasks)));
$$;

create or replace function public.is_workspace_user(target_workspace_id uuid, target_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select target_user_id is null or exists (select 1 from public.workspace_members where workspace_id = target_workspace_id and user_id = target_user_id);
$$;

create or replace function public.can_view_workspace_profile(target_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select target_user_id = auth.uid() or exists (select 1 from public.workspace_members mine join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id where mine.user_id = auth.uid() and theirs.user_id = target_user_id);
$$;

create policy "Members can view tasks in their workspace" on public.tasks for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Permitted members can create tasks" on public.tasks for insert to authenticated with check (created_by = auth.uid() and public.has_workspace_task_permission(workspace_id, 'create') and public.is_workspace_user(workspace_id, assignee_id) and (assignee_id is null or assignee_id = auth.uid() or public.has_workspace_task_permission(workspace_id, 'assign')) and exists (select 1 from public.projects p where p.id = project_id and p.workspace_id = tasks.workspace_id));
create policy "Permitted members can update tasks" on public.tasks for update to authenticated using (public.is_workspace_admin(workspace_id) or (created_by = auth.uid() and public.has_workspace_task_permission(workspace_id, 'create')) or assignee_id = auth.uid()) with check (public.is_workspace_member(workspace_id) and public.is_workspace_user(workspace_id, assignee_id) and exists (select 1 from public.projects p where p.id = project_id and p.workspace_id = tasks.workspace_id));
create policy "Admins can delete tasks" on public.tasks for delete to authenticated using (public.is_workspace_admin(workspace_id));
create or replace function public.enforce_task_update_permissions() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_workspace_admin(old.workspace_id) then return new; end if;
  if new.workspace_id is distinct from old.workspace_id or new.created_by is distinct from old.created_by then raise exception 'Task workspace and creator cannot be changed'; end if;
  if new.assignee_id is distinct from old.assignee_id and not public.has_workspace_task_permission(old.workspace_id, 'assign') then raise exception 'Task assignment permission required'; end if;
  if not (old.created_by = auth.uid() and public.has_workspace_task_permission(old.workspace_id, 'create')) and (new.project_id is distinct from old.project_id or new.title is distinct from old.title or new.description is distinct from old.description or new.priority is distinct from old.priority or new.assignee_id is distinct from old.assignee_id or new.due_date is distinct from old.due_date) then raise exception 'Only the task status may be changed'; end if;
  return new;
end;
$$;
drop trigger if exists enforce_task_update_permissions on public.tasks;
create trigger enforce_task_update_permissions before update on public.tasks for each row execute procedure public.enforce_task_update_permissions();
create policy "Members can view workspace profiles" on public.profiles for select to authenticated using (public.can_view_workspace_profile(id));

-- No client-side insert/delete policy is intentionally provided. New owners are created only by the auth trigger.
