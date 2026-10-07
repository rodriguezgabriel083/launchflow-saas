import type { LucideIcon } from "lucide-react";
import { ProgressBar } from "./progress-bar";

export function StatCard({ label, value, note, icon: Icon, accent, progress, tone = "violet" }: { label: string; value: string; note: string; icon: LucideIcon; accent: string; progress?: number; tone?: "violet" | "cyan" | "mint" | "aurora" }) {
  return <article className="metric-card group" data-tone={tone}>
    <div className="flex items-start justify-between"><p className="pt-1 text-[11px] font-medium uppercase tracking-[.06em] text-slate-400">{label}</p><span className={`metric-icon grid h-9 w-9 shrink-0 sm:h-10 sm:w-10 place-items-center rounded-xl border ${accent}`}><Icon size={17} /></span></div>
    <div><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><strong className="metric-value text-[32px] font-semibold sm:text-[38px] leading-none tracking-[-.055em] text-slate-100">{value}</strong><span className="text-[11px] text-slate-400">{note}</span></div>{progress !== undefined && <div className="mt-3"><ProgressBar value={progress} /></div>}</div>
  </article>;
}
