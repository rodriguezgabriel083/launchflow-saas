import type { LucideIcon } from "lucide-react";
import { ProgressBar } from "./progress-bar";

export function StatCard({ label, value, note, icon: Icon, accent, progress }: { label: string; value: string; note: string; icon: LucideIcon; accent: string; progress?: number }) {
  return <article className="panel group flex min-h-36 flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:bg-[#151e2e]">
    <div className="flex items-start justify-between"><p className="text-[11px] font-medium uppercase tracking-[.08em] text-slate-300">{label}</p><span className={`grid h-8 w-8 place-items-center rounded-lg bg-elevated ${accent}`}><Icon size={17} /></span></div>
    <div><div className="flex items-end gap-2"><strong className="text-3xl tracking-tight text-slate-100">{value}</strong><span className="mb-1 text-[10px] text-mint">{note}</span></div>{progress !== undefined && <div className="mt-3"><ProgressBar value={progress} /></div>}</div>
  </article>;
}
