-- Secure invitation discovery and acceptance for authenticated LaunchFlow users.
-- Run after 20260930_team_management.sql.

create or replace function public.get_my_pending_workspace_invitations()
returns table (
  invitation_id uuid,
  workspace_id uuid,
  workspace_name text,
  role text,
  can_create_projects boolean,
  can_edit_projects boolean,
  can_create_tasks boolean,
  can_assign_tasks boolean,
  can_manage_users boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    invitation.id,
    invitation.workspace_id,
    workspace.name,
    invitation.role,
    invitation.can_create_projects,
    invitation.can_edit_projects,
    invitation.can_create_tasks,
    invitation.can_assign_tasks,
    invitation.can_manage_users
  from public.workspace_invitations as invitation
  join public.workspaces as workspace on workspace.id = invitation.workspace_id
  join auth.users as app_user on app_user.id = auth.uid()
  where invitation.status = 'pending'
    and app_user.email_confirmed_at is not null
    and lower(trim(invitation.email)) = lower(trim(app_user.email))
  order by invitation.created_at asc;
$$;

create or replace function public.respond_to_workspace_invitation(
  target_invitation_id uuid,
  accept_invitation boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_email text;
  invitation public.workspace_invitations%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select app_user.email
    into authenticated_email
  from auth.users as app_user
  where app_user.id = auth.uid()
    and app_user.email_confirmed_at is not null;

  if authenticated_email is null then
    raise exception 'A verified email is required' using errcode = '42501';
  end if;

  select pending_invitation.*
    into invitation
  from public.workspace_invitations as pending_invitation
  where pending_invitation.id = target_invitation_id
    and pending_invitation.status = 'pending'
  for update;

  if not found then
    raise exception 'Pending invitation not found' using errcode = 'P0002';
  end if;

  if lower(trim(invitation.email)) <> lower(trim(authenticated_email)) then
    raise exception 'This invitation belongs to another user' using errcode = '42501';
  end if;

  if accept_invitation then
    insert into public.workspace_members (
      workspace_id,
      user_id,
      role,
      can_create_projects,
      can_edit_projects,
      can_create_tasks,
      can_assign_tasks,
      can_manage_users
    ) values (
      invitation.workspace_id,
      auth.uid(),
      invitation.role,
      invitation.can_create_projects,
      invitation.can_edit_projects,
      invitation.can_create_tasks,
      invitation.can_assign_tasks,
      invitation.can_manage_users
    )
    on conflict (workspace_id, user_id) do nothing;

    update public.workspace_invitations
      set status = 'accepted'
    where id = invitation.id;
  else
    update public.workspace_invitations
      set status = 'cancelled'
    where id = invitation.id;
  end if;

  return invitation.workspace_id;
end;
$$;

revoke all on function public.get_my_pending_workspace_invitations() from public;
revoke all on function public.respond_to_workspace_invitation(uuid, boolean) from public;
grant execute on function public.get_my_pending_workspace_invitations() to authenticated;
grant execute on function public.respond_to_workspace_invitation(uuid, boolean) to authenticated;
