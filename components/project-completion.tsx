import type { Task } from "./tasks-view";
import { ProgressBar } from "./progress-bar";

export function ProjectCompletion({ projectId, tasks, label }: { projectId: string; tasks: Task[]; label: string }) {
  const projectTasks = tasks.filter(task => task.project_id === projectId);
  const progress = projectTasks.length ? Math.round(projectTasks.filter(task => task.status === "completed").length / projectTasks.length * 100) : 0;
  return <div className="mt-5" data-progress={progress >= 80 ? "high" : undefined}><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-400">{label}</span><strong className="font-medium text-slate-200">{progress}%</strong></div><ProgressBar value={progress} /></div>;
}
