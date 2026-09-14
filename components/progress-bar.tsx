export function ProgressBar({ value, color = "bg-violet" }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/70"><div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} /></div>;
}
