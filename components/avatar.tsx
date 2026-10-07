export function Avatar({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" }) {
  return <span className={`${size === "sm" ? "h-7 w-7 text-[9px]" : "h-8 w-8 text-[10px]"} grid shrink-0 place-items-center rounded-xl border border-white/15 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_2px_8px_rgba(0,0,0,.2)]`} style={{ background: color }}>{initials}</span>;
}
