"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FolderKanban, Layers3, Users, Zap } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { messages, type Language } from "@/lib/i18n";
import { getStoredLanguage, storeLanguage } from "@/lib/language";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { DashboardShell } from "./dashboard-shell";

type Screen = "landing" | "login" | "register";
type Profile = { name: string | null; email: string | null };
type PendingWorkspaceInvitation = { invitation_id: string; workspace_id: string; workspace_name: string; role: "admin" | "employee"; can_create_projects: boolean; can_edit_projects: boolean; can_create_tasks: boolean; can_assign_tasks: boolean; can_manage_users: boolean };
const activeWorkspaceKey = (userId: string) => `launchflow-active-workspace:${userId}`;

export function AuthGate() {
  const [language, setLanguage] = useState<Language>("en"); const [screen, setScreen] = useState<Screen>("landing"); const [session, setSession] = useState<Session | null>(null); const [profile, setProfile] = useState<Profile | null>(null); const [invitations, setInvitations] = useState<PendingWorkspaceInvitation[]>([]); const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null); const [responding, setResponding] = useState(false); const [invitationNotice, setInvitationNotice] = useState(""); const [loadingSession, setLoadingSession] = useState(true); const t = messages[language];
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const updateLanguage = (nextLanguage: Language) => { storeLanguage(nextLanguage); setLanguage(nextLanguage); };
  useEffect(() => { setLanguage(getStoredLanguage()); }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoadingSession(false); return; }
    const supabase = getSupabaseClient();
    let active = true;
    let receivedAuthEvent = false;
    // Focus recovery and token refresh must not unmount the workspace.
    // Keep Supabase queries outside the auth callback.
    const updateSession = (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) { setProfile(null); setInvitations([]); setActiveWorkspaceId(null); setHydratedUserId(null); setLoadingSession(false); }
    };
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      updateSession(nextSession);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!receivedAuthEvent) updateSession(data.session);
    }).catch(() => { if (!receivedAuthEvent) updateSession(null); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  const sessionUserId = session?.user.id;
  useEffect(() => {
    if (!sessionUserId) return;
    let active = true;
    setLoadingSession(true);
    setActiveWorkspaceId(window.localStorage.getItem(activeWorkspaceKey(sessionUserId)));
    const supabase = getSupabaseClient();
    // Hydrate on user changes only. Discard requests from a previous session.
    void Promise.all([
      supabase.from("profiles").select("name, email").eq("id", sessionUserId).maybeSingle(),
      supabase.rpc("get_my_pending_workspace_invitations"),
    ]).then(([profileResult, invitationResult]) => {
      if (!active) return;
      setProfile(profileResult.data);
      setInvitations((invitationResult.data ?? []) as PendingWorkspaceInvitation[]);
    }).catch(() => {
      if (!active) return;
      setProfile(null); setInvitations([]);
    }).finally(() => {
      if (!active) return;
      setHydratedUserId(sessionUserId);
      setLoadingSession(false);
    });
    return () => { active = false; };
  }, [sessionUserId]);
  async function respondToInvitation(accept: boolean) { if (!session || invitations.length === 0) return; setResponding(true); setInvitationNotice(""); const invitation = invitations[0]; const { data, error } = await getSupabaseClient().rpc("respond_to_workspace_invitation", { target_invitation_id: invitation.invitation_id, accept_invitation: accept }); setResponding(false); if (error) { setInvitationNotice(t.invitations.responseError); return; } if (accept && data) { const workspaceId = String(data); window.localStorage.setItem(activeWorkspaceKey(session.user.id), workspaceId); setActiveWorkspaceId(workspaceId); } setInvitations(current => current.slice(1)); }
  if (loadingSession || (session && hydratedUserId !== session.user.id)) return <div className="grid min-h-screen place-items-center bg-canvas text-sm text-slate-400">LaunchFlow</div>;
  if (session && invitations.length > 0) return <InvitationPrompt invitation={invitations[0]} language={language} setLanguage={updateLanguage} responding={responding} notice={invitationNotice} onAccept={() => respondToInvitation(true)} onDecline={() => respondToInvitation(false)} />;
  if (session) { const userName = profile?.name?.trim() || session.user.user_metadata.name?.trim() || profile?.email || session.user.email || "User"; const userEmail = profile?.email || session.user.email || ""; return <DashboardShell key={session.user.id} userId={session.user.id} userName={userName} userEmail={userEmail} activeWorkspaceId={activeWorkspaceId} language={language} setLanguage={updateLanguage} onLogout={() => getSupabaseClient().auth.signOut()} />; }
  return <AuthScreen screen={screen} setScreen={setScreen} language={language} setLanguage={updateLanguage} />;
}

function InvitationPrompt({ invitation, language, setLanguage, responding, notice, onAccept, onDecline }: { invitation: PendingWorkspaceInvitation; language: Language; setLanguage: (language: Language) => void; responding: boolean; notice: string; onAccept: () => void; onDecline: () => void }) {
  const t = messages[language];
  return <main className="auth-background grid place-items-center px-4 py-10"><section className="auth-card"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span><span className="font-semibold">LaunchFlow</span></div><LanguageToggle language={language} setLanguage={setLanguage} /></div><div className="mt-7"><p className="text-[11px] font-semibold uppercase tracking-wider text-violet">{t.invitations.title}</p><h1 className="mt-2 text-2xl font-bold tracking-tight">{t.invitations.invitedTo.replace("{workspace}", invitation.workspace_name)}</h1><p className="mt-3 text-xs leading-5 text-slate-400">{t.invitations.description}</p><div className="mt-4 rounded-lg border border-line bg-elevated px-3 py-2 text-xs text-slate-300"><span className="text-slate-500">{t.team.role}: </span>{invitation.role === "admin" ? t.common.admin : t.common.employee}</div></div>{notice && <p className="mt-4 rounded-lg bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{notice}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button disabled={responding} onClick={onDecline} className="btn-ghost">{t.invitations.decline}</button><button disabled={responding} onClick={onAccept} className="btn-primary">{responding ? t.auth.loading : t.invitations.accept}</button></div></section></main>;
}

function AuthScreen({ screen, setScreen, language, setLanguage }: { screen: Screen; setScreen: (screen: Screen) => void; language: Language; setLanguage: (language: Language) => void }) {
  const t = messages[language]; const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [pending, setPending] = useState(false); const [notice, setNotice] = useState(""); const configured = isSupabaseConfigured();
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice(""); if (!configured) { setNotice(t.auth.missingConfig); return; } setPending(true); const supabase = getSupabaseClient();
    const result = screen === "register" ? await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: `${window.location.origin}` } }) : await supabase.auth.signInWithPassword({ email, password });
    setPending(false); if (result.error) { setNotice(screen === "login" ? t.auth.invalidCredentials : result.error.message); return; } if (screen === "register" && !result.data.session) setNotice(t.auth.registrationSuccess);
  }
  if (screen === "landing") return <main className="auth-background px-4 py-6 sm:px-8"><header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2.5"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span><span className="font-semibold tracking-tight">LaunchFlow</span></div><div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end"><LanguageToggle language={language} setLanguage={setLanguage} /><button onClick={() => setScreen("login")} className="btn-ghost">{t.auth.signIn}</button><button onClick={() => setScreen("register")} className="btn-primary">{t.auth.getStarted}</button></div></header><section className="mx-auto grid max-w-6xl items-center gap-12 py-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-16 lg:py-28"><div className="max-w-xl"><span className="rounded-full bg-violet/15 px-3 py-1 text-[11px] font-medium text-violet">LaunchFlow Studio</span><h1 className="mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-.055em] sm:text-6xl">{t.auth.landingTitle}</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-400">{t.auth.landingText}</p><button onClick={() => setScreen("register")} className="btn-primary mt-7">{t.auth.getStarted}<ArrowRight size={16} /></button></div><div className="auth-art"><div className="auth-art-orbit" aria-hidden="true" /><div className="mb-8 flex items-center justify-center gap-3"><span className="brand-mark h-12 w-12"><Zap size={24} fill="currentColor" /></span><span className="text-2xl font-semibold tracking-[-.045em]">LaunchFlow</span></div><div className="relative space-y-3"><div className="auth-feature"><span className="empty-icon h-10 w-10 rounded-xl"><FolderKanban size={20} /></span><div><h2 className="text-sm font-medium">{t.navigation.projects}</h2><p className="mt-1 text-xs text-slate-400">{t.projects.subtitle}</p></div></div><div className="auth-feature sm:ml-6"><span className="empty-icon h-10 w-10 rounded-xl text-blue"><Layers3 size={20} /></span><div><h2 className="text-sm font-medium">{t.navigation.tasks}</h2><p className="mt-1 text-xs text-slate-400">{t.tasks.subtitle}</p></div></div><div className="auth-feature"><span className="empty-icon h-10 w-10 rounded-xl text-mint"><Users size={20} /></span><div><h2 className="text-sm font-medium">{t.navigation.team}</h2><p className="mt-1 text-xs text-slate-400">{t.team.subtitle}</p></div></div></div></div></section></main>;
  const isRegister = screen === "register";
  return <main className="auth-background grid place-items-center px-4 py-10"><section className="auth-card"><div className="flex items-center justify-between"><button onClick={() => setScreen("landing")} className="btn-ghost -ml-3"><ArrowLeft size={15} />{t.auth.back}</button><LanguageToggle language={language} setLanguage={setLanguage} /></div><div className="mt-7"><div className="flex items-center gap-2"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span><span className="font-semibold">LaunchFlow</span></div><h1 className="mt-7 text-3xl font-semibold tracking-[-.045em]">{isRegister ? t.auth.createAccount : t.auth.signInTitle}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{isRegister ? t.auth.createAccountText : t.auth.signInText}</p></div><form className="mt-6 space-y-4" onSubmit={submit}>{isRegister && <label className="block text-xs font-medium text-slate-300">{t.auth.name}<input value={name} onChange={event => setName(event.target.value)} required className="field mt-1.5" /></label>}<label className="block text-xs font-medium text-slate-300">{t.auth.email}<input value={email} onChange={event => setEmail(event.target.value)} required type="email" autoComplete="email" className="field mt-1.5" /></label><label className="block text-xs font-medium text-slate-300">{t.auth.password}<input value={password} onChange={event => setPassword(event.target.value)} required minLength={6} type="password" autoComplete={isRegister ? "new-password" : "current-password"} className="field mt-1.5" /></label>{notice && <p className={`rounded-lg px-3 py-2 text-xs ${notice === t.auth.registrationSuccess ? "bg-mint/10 text-mint" : "bg-rose-400/10 text-rose-300"}`}>{notice === t.auth.registrationSuccess && <CheckCircle2 className="mr-1 inline" size={14} />}{notice}</p>}<button disabled={pending} className="btn-primary w-full">{pending ? t.auth.loading : isRegister ? t.auth.register : t.auth.login}</button></form><p className="mt-5 text-center text-xs text-slate-400">{isRegister ? t.auth.hasAccount : t.auth.noAccount} <button onClick={() => { setNotice(""); setScreen(isRegister ? "login" : "register"); }} className="font-medium text-violet hover:text-white">{isRegister ? t.auth.signIn : t.auth.signUp}</button></p></section></main>;
}

function LanguageToggle({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) { return <div className="segmented-control"><button onClick={() => setLanguage("en")} className={`segment px-2 text-[11px] ${language === "en" ? "segment-active" : ""}`}>EN</button><button onClick={() => setLanguage("es")} className={`segment px-2 text-[11px] ${language === "es" ? "segment-active" : ""}`}>ES</button></div>; }
