import { createClient } from "npm:@supabase/supabase-js@2";

type InvitationRequest = { invitation_id?: unknown };
type InvitationRecord = {
  id: string;
  workspace_id: string;
  email: string;
  role: "admin" | "employee";
  status: "pending" | "accepted" | "cancelled";
  invited_by: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character] ?? character);
}

function corsHeaders(request: Request, appUrl: string) {
  const allowedOrigin = new URL(appUrl).origin;
  const requestOrigin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function jsonResponse(request: Request, appUrl: string, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request, appUrl), "Content-Type": "application/json" }
  });
}

Deno.serve(async (request: Request) => {
  const appUrl = Deno.env.get("LAUNCHFLOW_APP_URL") ?? "http://localhost:3000";
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request, appUrl) });
  if (request.method !== "POST") return jsonResponse(request, appUrl, 405, { error: "Method not allowed" });

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(request, appUrl, 401, { error: "Authentication required" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFrom = Deno.env.get("RESEND_FROM_EMAIL");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !resendApiKey || !resendFrom) {
    return jsonResponse(request, appUrl, 500, { error: "Email service is not configured" });
  }

  const token = authorization.slice("Bearer ".length);
  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) {
    return jsonResponse(request, appUrl, 401, { error: "Invalid authentication" });
  }

  let payload: InvitationRequest;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(request, appUrl, 400, { error: "Invalid JSON body" });
  }
  if (typeof payload.invitation_id !== "string" || !uuidPattern.test(payload.invitation_id)) {
    return jsonResponse(request, appUrl, 400, { error: "A valid invitation_id is required" });
  }

  const { data: invitationData, error: invitationError } = await adminClient
    .from("workspace_invitations")
    .select("id, workspace_id, email, role, status, invited_by")
    .eq("id", payload.invitation_id)
    .maybeSingle();
  const invitation = invitationData as InvitationRecord | null;
  if (invitationError || !invitation) {
    return jsonResponse(request, appUrl, 404, { error: "Invitation not found" });
  }
  if (invitation.status !== "pending") {
    return jsonResponse(request, appUrl, 409, { error: "Invitation is no longer pending" });
  }

  const { data: membership, error: membershipError } = await adminClient
    .from("workspace_members")
    .select("role, can_manage_users")
    .eq("workspace_id", invitation.workspace_id)
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (membershipError || !membership || (membership.role !== "admin" && !membership.can_manage_users)) {
    return jsonResponse(request, appUrl, 403, { error: "Workspace management permission required" });
  }

  const [{ data: workspace, error: workspaceError }, { data: inviter }] = await Promise.all([
    adminClient.from("workspaces").select("name").eq("id", invitation.workspace_id).single(),
    adminClient.from("profiles").select("name, email").eq("id", invitation.invited_by).maybeSingle()
  ]);
  if (workspaceError || !workspace) {
    return jsonResponse(request, appUrl, 404, { error: "Workspace not found" });
  }

  const workspaceName = String(workspace.name);
  const inviterName = String(inviter?.name || inviter?.email || "A LaunchFlow workspace manager");
  const roleLabel = invitation.role === "admin" ? "Administrator / Administrador" : "Employee / Empleado";
  const safeWorkspace = escapeHtml(workspaceName);
  const safeInviter = escapeHtml(inviterName);
  const safeRole = escapeHtml(roleLabel);
  const safeAppUrl = escapeHtml(appUrl);
  const subject = `You're invited to ${workspaceName} on LaunchFlow`;
  const text = `${inviterName} invited you to join ${workspaceName} on LaunchFlow as ${roleLabel}. Open LaunchFlow: ${appUrl}\n\n${inviterName} te invitó a unirte a ${workspaceName} en LaunchFlow con el rol ${roleLabel}. Abre LaunchFlow: ${appUrl}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#172033;line-height:1.5">
      <h1 style="font-size:24px;margin-bottom:12px">You're invited to LaunchFlow</h1>
      <p><strong>${safeInviter}</strong> invited you to join <strong>${safeWorkspace}</strong>.</p>
      <p>Role: <strong>${safeRole}</strong></p>
      <p style="margin:24px 0"><a href="${safeAppUrl}" style="background:#9b75ff;color:#1d1035;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">Open LaunchFlow / Abrir LaunchFlow</a></p>
      <p style="font-size:13px;color:#64748b">Sign in with this email address to review and accept the invitation.<br/>Inicia sesión con esta dirección de email para revisar y aceptar la invitación.</p>
    </div>`;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [invitation.email],
      subject,
      html,
      text
    })
  });

  const resendResult = await resendResponse.json().catch(() => null) as { id?: string } | null;
  if (!resendResponse.ok || !resendResult?.id) {
    return jsonResponse(request, appUrl, 502, { error: "Email provider rejected the request" });
  }

  return jsonResponse(request, appUrl, 200, {
    sent: true,
    email_id: resendResult.id
  });
});
