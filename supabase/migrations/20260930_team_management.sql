-- Secure Team management for LaunchFlow.
-- Run this migration in the Supabase SQL Editor for an existing database.

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (char_length(trim(email)) > 3),
  role text not null default 'employee' check (role in ('admin', 'employee')),
  can_create_projects boolean not null default false,
  can_edit_projects boolean not null default false,
  can_create_tasks boolean not null default false,
  can_assign_tasks boolean not null default false,
  can_manage_users boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists workspace_invitations_workspace_id_idx
  on public.workspace_invitations(workspace_id);
create unique index if not exists workspace_invitations_pending_email_idx
  on public.workspace_invitations(workspace_id, lower(email))
  where status = 'pending';

alter table public.workspace_invitations enable row level security;

create or replace function public.enforce_workspace_member_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.workspace_id is distinct from old.workspace_id
       or new.user_id is distinct from old.user_id then
      raise exception 'Membership workspace and user cannot be changed';
    end if;

    if new.role = 'admin' then
      new.can_create_projects := true;
      new.can_edit_projects := true;
      new.can_create_tasks := true;
      new.can_assign_tasks := true;
      new.can_manage_users := true;
    end if;

    if old.role = 'admin' and new.role <> 'admin'
       and not exists (
         select 1 from public.workspace_members
         where workspace_id = old.workspace_id and role = 'admin' and id <> old.id
       ) then
      raise exception 'A workspace must keep at least one administrator';
    end if;
    return new;
  end if;

  if not exists (select 1 from public.workspaces where id = old.workspace_id) then
    return old;
  end if;

  if old.role = 'admin'
     and not exists (
       select 1 from public.workspace_members
       where workspace_id = old.workspace_id and role = 'admin' and id <> old.id
     ) then
    raise exception 'A workspace must keep at least one administrator';
  end if;
  return old;
end;
$$;

drop trigger if exists enforce_workspace_member_changes on public.workspace_members;
create trigger enforce_workspace_member_changes
  before update or delete on public.workspace_members
  for each row execute procedure public.enforce_workspace_member_changes();

drop policy if exists "Admins can update workspace members" on public.workspace_members;
create policy "Admins can update workspace members" on public.workspace_members
  for update to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists "Admins can remove workspace members" on public.workspace_members;
create policy "Admins can remove workspace members" on public.workspace_members
  for delete to authenticated
  using (public.is_workspace_admin(workspace_id));

drop policy if exists "Admins can view workspace invitations" on public.workspace_invitations;
create policy "Admins can view workspace invitations" on public.workspace_invitations
  for select to authenticated
  using (public.is_workspace_admin(workspace_id));

drop policy if exists "Admins can create workspace invitations" on public.workspace_invitations;
create policy "Admins can create workspace invitations" on public.workspace_invitations
  for insert to authenticated
  with check (public.is_workspace_admin(workspace_id) and invited_by = auth.uid() and status = 'pending');

drop policy if exists "Admins can cancel workspace invitations" on public.workspace_invitations;
create policy "Admins can cancel workspace invitations" on public.workspace_invitations
  for delete to authenticated
  using (public.is_workspace_admin(workspace_id));

revoke all on function public.enforce_workspace_member_changes() from public;
