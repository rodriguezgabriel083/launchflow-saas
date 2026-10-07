import { Bell, Menu, Plus } from "lucide-react";
import type { Language, Translations } from "@/lib/i18n";
import type { WorkspaceView } from "@/lib/navigation";
import { Avatar } from "./avatar";

export function Header({ active, openMenu, language, setLanguage, t, userName, initials, role, canCreateProject, onNewProject }: { active: WorkspaceView; openMenu: () => void; language: Language; setLanguage: (language: Language) => void; t: Translations; userName: string; initials: string; role: "admin" | "employee" | null; canCreateProject: boolean; onNewProject: () => void }) {
  return <header className="topbar">
    <button onClick={openMenu} className="icon-button lg:hidden" aria-label={t.common.openMenu}><Menu size={18} /></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold tracking-tight text-slate-200 sm:text-base">{t.navigation[active]}</p><p className="mt-0.5 text-[10px] text-slate-400">LaunchFlow</p></div>
    <div className="ml-auto flex shrink-0 items-center gap-2"><div className="segmented-control hidden sm:flex"><button onClick={() => setLanguage("en")} aria-label="English" className={`segment px-2 text-[11px] ${language === "en" ? "segment-active" : ""}`}>EN</button><button onClick={() => setLanguage("es")} aria-label="Español" className={`segment px-2 text-[11px] ${language === "es" ? "segment-active" : ""}`}>ES</button></div><button className="icon-button relative" aria-label={t.common.notifications}><Bell size={17} /><i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400" /></button>{canCreateProject && <button onClick={onNewProject} className="btn-primary"><Plus size={16} /><span className="hidden xl:inline">{t.common.newProject}</span></button>}<div className="ml-1 flex shrink-0 items-center gap-2.5 border-l border-line pl-3"><Avatar initials={initials} color="#4c1d95" /><div className="hidden xl:block"><p className="max-w-32 truncate text-xs font-medium leading-tight">{userName}</p><p className="text-[11px] text-slate-400">{role === "admin" ? t.common.admin : role === "employee" ? t.common.employee : "—"}</p></div></div></div>
  </header>;
}
