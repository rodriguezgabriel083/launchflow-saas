import { CalendarClock } from "lucide-react";
import type { Translations } from "@/lib/i18n";
import type { Project } from "./projects-view";

export function DeadlineList({ t, projects }: { t: Translations; projects: Project[] }) {
  const deadlines = projects.filter(project => project.due_date && project.status !== "completed").sort((a, b) => String(a.due_date).localeCompare(String(b.due_date))).slice(0, 3);
  return <aside className="panel p-4"><div className="flex items-center justify-between"><h2 className="text-base font-semibold">{t.dashboard.deadlines}</h2><CalendarClock size={16} className="text-slate-400" /></div><p className="mt-1 text-[11px] text-slate-400">{t.dashboard.deadlineSubtitle}</p>{deadlines.length === 0 ? <div className="grid min-h-36 place-items-center text-center"><p className="text-xs text-slate-400">{t.projects.empty}</p></div> : <div className="mt-4 space-y-2">{deadlines.map(project => <div key={project.id} className="flex items-center gap-2.5 rounded-lg bg-elevated p-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet/15 text-violet"><CalendarClock size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{project.name}</p><p className="text-[10px] text-slate-400">{t.projects.dueDate}</p></div><span className="whitespace-nowrap text-[10px] text-slate-300">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(`${project.due_date}T00:00:00`))}</span></div>)}</div>}</aside>;
}
