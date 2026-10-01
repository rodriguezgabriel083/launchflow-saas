-- Enforce LaunchFlow workspace permissions consistently at the database boundary.
-- Run after 20261001_invitation_acceptance.sql.

-- SECURITY DEFINER helpers avoid recursive workspace_members policies.
create or replace function public.has_workspace_permission(target_workspace_id uuid, permission_name text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
      and (
        role = 'admin'
        or (permission_name = 'create_projects' and can_create_projects)
        or (permission_name = 'edit_projects' and can_edit_projects)
        or (permission_name = 'create_tasks' and can_create_tasks)
        or (permission_name = 'assign_tasks' and can_assign_tasks)
        or (permission_name = 'manage_users' and can_manage_users)
      )
  );
$$;
revoke all on function public.has_workspace_permission(uuid, text) from public;
grant execute on function public.has_workspace_permission(uuid, text) to authenticated;

drop policy if exists "Permitted members can create projects" on public.projects;
drop policy if exists "Permitted members can update projects" on public.projects;
drop policy if exists "Permitted members can delete projects" on public.projects;
create policy "Permitted members can create projects" on public.projects for insert to authenticated
  with check (created_by = auth.uid() and public.has_workspace_permission(workspace_id, 'create_projects'));
create policy "Permitted members can update projects" on public.projects for update to authenticated
  using (public.has_workspace_permission(workspace_id, 'edit_projects'))
  with check (public.has_workspace_permission(workspace_id, 'edit_projects'));
create policy "Permitted members can delete projects" on public.projects for delete to authenticated
  using (public.has_workspace_permission(workspace_id, 'edit_projects'));

create or replace function public.enforce_project_update_scope()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.workspace_id is distinct from old.workspace_id
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Project workspace, creator, and creation date cannot be changed';
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_project_update_scope on public.projects;
create trigger enforce_project_update_scope before update on public.projects
  for each row execute procedure public.enforce_project_update_scope();
revoke all on function public.enforce_project_update_scope() from public;

-- Tasks: create and assign are independent permissions. Assignment-only members
-- may change only the assignee; creators and assignees retain their existing scope.
drop policy if exists "Permitted members can create tasks" on public.tasks;
drop policy if exists "Permitted members can update tasks" on public.tasks;
create policy "Permitted members can create tasks" on public.tasks for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.has_workspace_permission(workspace_id, 'create_tasks')
    and public.is_workspace_user(workspace_id, assignee_id)
    and (assignee_id is null or assignee_id = auth.uid() or public.has_workspace_permission(workspace_id, 'assign_tasks'))
    and exists (select 1 from public.projects p where p.id = project_id and p.workspace_id = tasks.workspace_id)
  );
create policy "Permitted members can update tasks" on public.tasks for update to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    or (created_by = auth.uid() and public.has_workspace_permission(workspace_id, 'create_tasks'))
    or assignee_id = auth.uid()
    or public.has_workspace_permission(workspace_id, 'assign_tasks')
  )
  with check (
    public.is_workspace_member(workspace_id)
    and public.is_workspace_user(workspace_id, assignee_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.workspace_id = tasks.workspace_id)
  );

create or replace function public.enforce_task_update_permissions()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  can_edit_content boolean;
  can_assign boolean;
  can_change_status boolean;
begin
  if new.workspace_id is distinct from old.workspace_id
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Task workspace, creator, and creation date cannot be changed';
  end if;
  if public.is_workspace_admin(old.workspace_id) then return new; end if;
  can_edit_content := old.created_by = auth.uid()
    and public.has_workspace_permission(old.workspace_id, 'create_tasks');
  can_assign := public.has_workspace_permission(old.workspace_id, 'assign_tasks');
  can_change_status := can_edit_content or old.assignee_id = auth.uid();
  if (new.project_id is distinct from old.project_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.priority is distinct from old.priority
      or new.due_date is distinct from old.due_date)
     and not can_edit_content then
    raise exception 'Task creation permission required to edit task details';
  end if;
  if new.assignee_id is distinct from old.assignee_id and not can_assign then
    raise exception 'Task assignment permission required';
  end if;
  if new.status is distinct from old.status and not can_change_status then
    raise exception 'Only the task creator or assignee may change its status';
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_task_update_permissions on public.tasks;
create trigger enforce_task_update_permissions before update on public.tasks
  for each row execute procedure public.enforce_task_update_permissions();
revoke all on function public.enforce_task_update_permissions() from public;

-- Team managers can manage other employees, but cannot touch admins, themselves,
-- or create/promote an administrator. Admins retain full access.
drop policy if exists "Admins can update workspace members" on public.workspace_members;
drop policy if exists "Admins can remove workspace members" on public.workspace_members;
drop policy if exists "Permitted members can update workspace members" on public.workspace_members;
drop policy if exists "Permitted members can remove workspace members" on public.workspace_members;
create policy "Permitted members can update workspace members" on public.workspace_members
  for update to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    or (public.has_workspace_permission(workspace_id, 'manage_users') and role = 'employee' and user_id <> auth.uid())
  )
  with check (
    public.is_workspace_admin(workspace_id)
    or (public.has_workspace_permission(workspace_id, 'manage_users') and role = 'employee' and user_id <> auth.uid())
  );
create policy "Permitted members can remove workspace members" on public.workspace_members
  for delete to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    or (public.has_workspace_permission(workspace_id, 'manage_users') and role = 'employee' and user_id <> auth.uid())
  );

drop policy if exists "Admins can view workspace invitations" on public.workspace_invitations;
drop policy if exists "Admins can create workspace invitations" on public.workspace_invitations;
drop policy if exists "Admins can cancel workspace invitations" on public.workspace_invitations;
drop policy if exists "Permitted members can view workspace invitations" on public.workspace_invitations;
drop policy if exists "Permitted members can create workspace invitations" on public.workspace_invitations;
drop policy if exists "Permitted members can cancel workspace invitations" on public.workspace_invitations;
create policy "Permitted members can view workspace invitations" on public.workspace_invitations
  for select to authenticated using (public.has_workspace_permission(workspace_id, 'manage_users'));
create policy "Permitted members can create workspace invitations" on public.workspace_invitations
  for insert to authenticated
  with check (
    invited_by = auth.uid() and status = 'pending'
    and (public.is_workspace_admin(workspace_id)
      or (public.has_workspace_permission(workspace_id, 'manage_users') and role = 'employee'))
  );
create policy "Permitted members can cancel workspace invitations" on public.workspace_invitations
  for delete to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    or (public.has_workspace_permission(workspace_id, 'manage_users') and role = 'employee')
  );
