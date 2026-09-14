import type { Translations } from "@/lib/i18n";

export function TaskList({ t }: { t: Translations }) {
  return <section className="panel min-w-0 p-4"><div className="flex items-center gap-2"><h2 className="text-lg font-semibold">{t.dashboard.assignedTasks}</h2><span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-slate-300">0</span></div><div className="grid min-h-40 place-items-center text-center"><p className="text-sm text-slate-400">{t.tasks.empty}</p></div></section>;
}
