import type { Translations } from "@/lib/i18n";
import type { Task } from "./tasks-view";

export function TaskStatus({ t, tasks }: { t: Translations; tasks: Task[] }) {
  const counts = { pending: tasks.filter(task => task.status === "pending").length, in_progress: tasks.filter(task => task.status === "in_progress").length, completed: tasks.filter(task => task.status === "completed").length };
  const total = tasks.length;
  return <article className="panel status-card flex flex-col p-5 sm:p-6">
    <div><h2 className="section-title">{t.dashboard.taskStatus}</h2><p className="mt-1 text-xs text-slate-400">{t.dashboard.workload}</p></div>
    <div className="my-6 flex justify-center">
      <div className="status-ring grid h-36 w-36 place-items-center rounded-full p-2" style={{ background: total ? `conic-gradient(rgb(var(--cyan)) 0% ${counts.pending / total * 100}%, rgb(var(--violet)) ${counts.pending / total * 100}% ${(counts.pending + counts.in_progress) / total * 100}%, rgb(var(--mint)) ${(counts.pending + counts.in_progress) / total * 100}% 100%)` : "rgb(var(--elevated))" }}>
        <div className="status-ring-core flex h-full w-full flex-col items-center justify-center rounded-full bg-panel"><strong className="text-4xl font-semibold tracking-[-.05em]">{total}</strong><span className="mt-1 text-[11px] text-slate-400">{t.dashboard.totalTasks}</span></div>
      </div>
    </div>
    {total === 0 ? <p className="pb-4 text-center text-xs text-slate-400">{t.tasks.empty}</p> : <div className="space-y-4 pb-5">{(["pending", "in_progress", "completed"] as const).map(status => <div key={status}><div className="mb-2 flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-slate-400"><i className={`h-1.5 w-1.5 rounded-full ${status === "pending" ? "bg-cyan" : status === "in_progress" ? "bg-violet" : "bg-mint"}`} />{status === "in_progress" ? t.status.inProgress : t.status[status]}</span><strong className="font-medium text-slate-200">{counts[status]}</strong></div><div className="h-1 overflow-hidden rounded-full bg-white/[.06]"><div data-status={status} className={`status-fill h-full rounded-full ${status === "pending" ? "bg-cyan" : status === "in_progress" ? "bg-violet" : "bg-mint"}`} style={{ width: `${counts[status] / total * 100}%` }} /></div></div>)}</div>}
  </article>;
}
