import type { Translations } from "@/lib/i18n";
import type { Task } from "./tasks-view";

export function TaskStatus({ t, tasks }: { t: Translations; tasks: Task[] }) {
  const counts = { pending: tasks.filter(task => task.status === "pending").length, in_progress: tasks.filter(task => task.status === "in_progress").length, completed: tasks.filter(task => task.status === "completed").length };
  const total = tasks.length;
  return <article className="panel flex min-h-[264px] flex-col p-5"><div><h2 className="text-lg font-semibold">{t.dashboard.taskStatus}</h2><p className="mt-0.5 text-xs text-slate-400">{t.dashboard.workload}</p></div>{total === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><strong className="text-3xl">0</strong><p className="mt-2 text-xs text-slate-400">{t.tasks.empty}</p></div> : <div className="flex flex-1 flex-col justify-center gap-4 py-4">{(["pending", "in_progress", "completed"] as const).map(status => <div key={status}><div className="mb-1.5 flex justify-between text-[11px]"><span>{status === "in_progress" ? t.status.inProgress : t.status[status]}</span><strong>{counts[status]}</strong></div><div className="h-2 overflow-hidden rounded-full bg-elevated"><div className={`h-full rounded-full ${status === "pending" ? "bg-blue" : status === "in_progress" ? "bg-violet" : "bg-mint"}`} style={{ width: `${counts[status] / total * 100}%` }} /></div></div>)}</div>}<div className="border-t border-line pt-3 text-[10px] text-slate-400">{t.dashboard.totalTasks}: {total}</div></article>;
}
