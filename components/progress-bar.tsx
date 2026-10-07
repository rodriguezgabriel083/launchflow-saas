export function ProgressBar({ value, color = "bg-violet" }: { value: number; color?: string }) {
  return <div className="progress-track h-1.5 overflow-hidden rounded-full"><div className={`progress-fill h-full rounded-full ${color} transition-[width] duration-300`} style={{ width: `${value}%` }} /></div>;
}
