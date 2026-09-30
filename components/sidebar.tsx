import { BarChart3, CheckCircle2, FolderKanban, LogOut, Settings, Users, X, Zap } from "lucide-react";
import type { Translations } from "@/lib/i18n";
import { Avatar } from "./avatar";

const links = [["dashboard", BarChart3], ["projects", FolderKanban], ["tasks", CheckCircle2], ["team", Users], ["settings", Settings]] as const;
type View = (typeof links)[number][0];

export function Sidebar({ open, close, active, setActive, t, onLogout, userName, initials, role }: { open: boolean; close: () => void; active: View; setActive: (view: View) => void; t: Translations; onLogout: () => Promise<{ error: Error | null }>; userName: string; initials: string; role: "admin" | "employee" | null }) {
  return <>{open && <button aria-label={t.common.closeMenu} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={close} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-[#111827] transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-16 items-center gap-2.5 px-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-violet text-white shadow-[0_0_20px_rgba(155,117,255,.25)]"><Zap size={17} fill="currentColor" /></span><span className="font-semibold tracking-tight">LaunchFlow</span><button onClick={close} className="ml-auto text-slate-400 lg:hidden" aria-label={t.common.closeMenu}><X size={20} /></button></div>
      <div className="mx-3 mb-3 rounded-lg bg-elevated px-3 py-2.5"><p className="text-xs font-medium">{t.workspace.name}</p><p className="text-[10px] text-violet">{t.workspace.plan}</p></div>
      <nav className="space-y-1 px-3">{links.map(([view, Icon]) => <button key={view} onClick={() => { setActive(view); close(); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${active === view ? "bg-violet font-medium text-[#190b35]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon size={18} /><span>{t.navigation[view]}</span></button>)}</nav>
      <div className="mt-auto p-3"><div className="flex items-center gap-2.5 rounded-xl bg-elevated p-2.5"><Avatar initials={initials} color="#4c1d95" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{userName}</p><p className="text-[10px] text-violet">{role === "admin" ? t.common.admin : role === "employee" ? t.common.employee : "—"}</p></div><button onClick={() => void onLogout()} className="text-slate-400 transition hover:text-white" aria-label={t.common.logOut}><LogOut size={17} /></button></div></div>
    </aside></>;
}
