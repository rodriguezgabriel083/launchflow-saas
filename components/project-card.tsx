import { CalendarDays, Eye, Pencil, Trash2 } from "lucide-react";
import type { Translations } from "@/lib/i18n";
import { ProgressBar } from "./progress-bar";
import type { Project } from "./projects-view";
import type { Task } from "./tasks-view";

export function ProjectProgress({ t, projects, tasks, canEdit, onViewAll, onOpen, onEdit, onDelete }: { t: Translations; projects: Project[]; tasks: Task[]; canEdit: boolean; onViewAll?: () => void; onOpen: (project: Project) => void; onEdit: (project: Project) => void; onDelete: (project: Project) => void }) {
  return <section>
    <div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-semibold">{t.dashboard.projectProgress}</h2><p className="text-xs text-slate-400">{t.dashboard.projectSubtitle}</p></div>{onViewAll && <button onClick={onViewAll} className="text-xs text-violet hover:text-white">{t.dashboard.viewAll}</button>}</div>
    {projects.length === 0 ? <div className="panel p-4 text-xs text-slate-400">{t.projects.empty}</div> : <div className="grid gap-3 md:grid-cols-3">{projects.slice(0, 3).map(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      const progress = projectTasks.length ? Math.round(projectTasks.filter(task => task.status === "completed").length / projectTasks.length * 100) : 0;
      return <article key={project.id} className="panel p-4"><div className="flex items-start justify-between gap-2"><span className="rounded-full border border-violet/25 bg-violet/15 px-2 py-0.5 text-[10px] text-[#c8b5ff]">{project.status === "planning" ? t.projects.planning : project.status === "in_progress" ? t.projects.inProgress : t.projects.completed}</span><span className="flex items-center gap-2"><span className="text-[10px] text-slate-300">{t.priority[project.priority]}</span><button onClick={() => onOpen(project)} className="text-slate-400 hover:text-white" aria-label={`${t.projects.view}: ${project.name}`}><Eye size={14} /></button>{canEdit && <><button onClick={() => onEdit(project)} className="text-slate-400 hover:text-white" aria-label={`${t.projects.edit}: ${project.name}`}><Pencil size={13} /></button><button onClick={() => onDelete(project)} className="text-rose-300 hover:text-rose-200" aria-label={`${t.projects.delete}: ${project.name}`}><Trash2 size={13} /></button></>}</span></div><button onClick={() => onOpen(project)} className="mt-3 block max-w-full text-left"><h3 className="truncate text-sm font-semibold hover:text-violet">{project.name}</h3><p className="mt-1 truncate text-[11px] text-slate-400">{project.description || "—"}</p></button><div className="mt-5 flex justify-between text-[10px]"><span>{t.dashboard.progress}</span><strong>{progress}%</strong></div><div className="mt-2"><ProgressBar value={progress} color="bg-violet" /></div><div className="mt-4 flex items-center justify-between border-t border-line pt-3"><span className="text-[10px] text-slate-400">{t.dashboard.due}</span><span className="flex items-center gap-1 text-[10px] text-slate-400"><CalendarDays size={13} /> {project.due_date || "—"}</span></div></article>;
    })}</div>}
  </section>;
}
