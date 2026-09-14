import { MoreHorizontal, ShieldCheck, UserPlus } from "lucide-react";
import type { Translations } from "@/lib/i18n";
import { Avatar } from "./avatar";

const mockMembers = [
  { name: "", email: "", initials: "", color: "#4c1d95", role: "admin", projects: 0, tasks: 0 },
  { name: "Maya Chen", email: "maya@launchflow.com", initials: "MC", color: "#7c3aed", role: "employee", projects: 0, tasks: 0 },
  { name: "Noah Davis", email: "noah@launchflow.com", initials: "ND", color: "#2563eb", role: "employee", projects: 0, tasks: 0 },
  { name: "Olivia Rhye", email: "olivia@launchflow.com", initials: "OR", color: "#db2777", role: "employee", projects: 0, tasks: 0 },
  { name: "Liam Johnson", email: "liam@launchflow.com", initials: "LJ", color: "#059669", role: "employee", projects: 0, tasks: 0 },
];

export function TeamView({ t, userName, userEmail }: { t: Translations; userName: string; userEmail: string }) {
  const initials = userName.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "U";
  const members = [{ ...mockMembers[0], name: userName, email: userEmail, initials }, ...mockMembers.slice(1)];
  return <section className="py-2">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">{t.team.title}</h1><p className="mt-1 text-xs leading-5 text-slate-400">{t.team.subtitle}</p></div><button className="flex h-9 w-fit items-center gap-1.5 rounded-lg bg-violet px-4 text-xs font-medium text-[#1d1035] transition hover:bg-[#ac8cff]"><UserPlus size={16} />{t.common.inviteMember}</button></div>
    <section className="panel mt-5 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4"><div><h2 className="text-lg font-semibold">{t.team.members}</h2><p className="mt-0.5 text-[11px] text-slate-400">{t.team.permissions}</p></div><span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-slate-300">{members.length}</span></div>
      <div className="overflow-x-auto"><div className="min-w-[760px]"><div className="grid grid-cols-[minmax(190px,1.5fr)_minmax(180px,1.35fr)_100px_115px_95px_85px_94px] gap-3 border-b border-line px-4 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500"><span>{t.team.name}</span><span>{t.team.email}</span><span>{t.team.role}</span><span>{t.team.assignedProjects}</span><span>{t.team.activeTasks}</span><span>{t.team.status}</span><span>{t.team.actions}</span></div>
        <div className="divide-y divide-line">{members.map(member => <div key={member.email} className="grid grid-cols-[minmax(190px,1.5fr)_minmax(180px,1.35fr)_100px_115px_95px_85px_94px] items-center gap-3 px-4 py-3.5 transition hover:bg-white/[.015]"><div className="flex min-w-0 items-center gap-2.5"><Avatar initials={member.initials} color={member.color} size="sm" /><span className="truncate text-xs font-medium">{member.name}</span></div><span className="truncate text-[11px] text-slate-400">{member.email}</span><span className={`w-fit rounded-full border px-2 py-0.5 text-[9px] ${member.role === "admin" ? "border-violet/25 bg-violet/15 text-[#c8b5ff]" : "border-white/10 bg-slate-500/15 text-slate-300"}`}>{member.role === "admin" ? t.common.admin : t.common.employee}</span><span className="text-[11px]">{member.projects}</span><span className="text-[11px]">{member.tasks}</span><span className="flex items-center gap-1.5 text-[10px] text-mint"><i className="h-1.5 w-1.5 rounded-full bg-mint" />{t.status.active}</span><div className="flex items-center gap-1"><button aria-label={`${t.common.editPermissions}: ${member.name}`} className="icon-button h-7 w-7"><ShieldCheck size={14} /></button><button aria-label={`${t.common.removeMember}: ${member.name}`} className="icon-button h-7 w-7 text-slate-400"><MoreHorizontal size={15} /></button></div></div>)}</div></div></div>
    </section>
  </section>;
}
