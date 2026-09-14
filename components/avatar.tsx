export function Avatar({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" }) {
  return <span className={`${size === "sm" ? "h-7 w-7 text-[9px]" : "h-8 w-8 text-[10px]"} grid shrink-0 place-items-center rounded-full border border-white/10 font-semibold text-white`} style={{ background: color }}>{initials}</span>;
}
