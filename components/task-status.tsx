import type { Translations } from "@/lib/i18n";

export function TaskStatus({ t }: { t: Translations }) {
  return <article className="panel flex min-h-[264px] flex-col p-5"><div><h2 className="text-lg font-semibold">{t.dashboard.taskStatus}</h2><p className="mt-0.5 text-xs text-slate-400">{t.dashboard.workload}</p></div><div className="flex flex-1 flex-col items-center justify-center text-center"><strong className="text-3xl">0</strong><p className="mt-2 text-xs text-slate-400">{t.tasks.empty}</p></div><div className="border-t border-line pt-3 text-[10px] text-slate-400">{t.tasks.empty}</div></article>;
}
