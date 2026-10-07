import Link from "next/link";
import { BarChart3, CheckCircle2, FolderKanban, LogOut, Settings, Users, X, Zap } from "lucide-react";
import type { Translations } from "@/lib/i18n";
import { Avatar } from "./avatar";

const links = [["dashboard", BarChart3], ["projects", FolderKanban], ["tasks", CheckCircle2], ["team", Users], ["settings", Settings]] as const;
type View = (typeof links)[number][0];

export function Sidebar({ open, close, active, workspaceName, t, onLogout, userName, initials, role }: { open: boolean; close: () => void; active: View; workspaceName: string; t: Translations; onLogout: () => Promise<{ error: Error | null }>; userName: string; initials: string; role: "admin" | "employee" | null }) {
  return <>{open && <button aria-label={t.common.closeMenu} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={close} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex workspace-sidebar w-64 flex-col border-r border-line transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center gap-3 px-6"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span><span className="text-lg font-semibold tracking-[-.04em]">LaunchFlow</span><button onClick={close} className="ml-auto text-slate-400 lg:hidden" aria-label={t.common.closeMenu}><X size={20} /></button></div>
      <div className="workspace-switcher"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-violet/15 bg-violet/[.08] text-violet"><FolderKanban size={17} /></span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-200" title={workspaceName}>{workspaceName}</p><p className="mt-1 text-[11px] text-slate-400">{t.workspace.plan}</p></div></div></div>
      <nav className="space-y-1.5 px-4">{links.map(([view, Icon]) => <Link key={view} href={`/${view}`} scroll={false} onClick={close} aria-current={active === view ? "page" : undefined} className={`sidebar-link ${active === view ? "sidebar-link-active" : ""}`}><Icon size={18} /><span>{t.navigation[view]}</span></Link>)}</nav>
      <div className="mt-auto border-t border-line p-4"><div className="flex items-center gap-3 rounded-xl p-1"><Avatar initials={initials} color="#4c1d95" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{userName}</p><p className="mt-1 text-[11px] text-slate-400">{role === "admin" ? t.common.admin : role === "employee" ? t.common.employee : "—"}</p></div><button onClick={() => void onLogout()} className="icon-action" aria-label={t.common.logOut}><LogOut size={17} /></button></div></div>
    </aside></>;
}
