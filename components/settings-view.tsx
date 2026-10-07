import { useEffect, useState } from "react";
import { ImagePlus, LogOut, Trash2 } from "lucide-react";
import type { Language, Translations } from "@/lib/i18n";

type SaveFeedback = "saved" | "saveError" | "nameRequired" | null;

function useNameSetting(savedName: string, onSave: (name: string) => Promise<void>) {
  const [name, setName] = useState(savedName);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback>(null);
  useEffect(() => { setName(savedName); }, [savedName]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const trimmedName = name.trim();
    if (!trimmedName) { setFeedback("nameRequired"); return; }
    setSaving(true); setFeedback(null);
    try { await onSave(trimmedName); setName(trimmedName); setFeedback("saved"); }
    catch { setFeedback("saveError"); }
    finally { setSaving(false); }
  }
  return { name, saving, feedback, save, change: (value: string) => { setName(value); setFeedback(null); }, changed: name.trim() !== savedName };
}

function SaveAction({ field, t }: { field: ReturnType<typeof useNameSetting>; t: Translations }) {
  return <div className="mt-3 flex items-center gap-3"><button type="submit" disabled={field.saving || !field.changed} className="h-8 shrink-0 rounded-lg bg-violet px-3 text-xs font-medium text-[#1d1035] disabled:opacity-50">{field.saving ? t.settings.saving : t.settings.save}</button>{field.feedback && <p role={field.feedback === "saved" ? "status" : "alert"} className={`text-xs ${field.feedback === "saved" ? "text-mint" : "text-rose-300"}`}>{t.settings[field.feedback]}</p>}</div>;
}

export function SettingsView({ t, language, setLanguage, onLogout, userName, userEmail, workspaceName, canEditWorkspace, onSaveWorkspaceName, onSaveProfileName }: { t: Translations; language: Language; setLanguage: (language: Language) => void; onLogout: () => Promise<{ error: Error | null }>; userName: string; userEmail: string; workspaceName: string; canEditWorkspace: boolean; onSaveWorkspaceName: (name: string) => Promise<void>; onSaveProfileName: (name: string) => Promise<void> }) {
  const workspace = useNameSetting(workspaceName, onSaveWorkspaceName);
  const profile = useNameSetting(userName, onSaveProfileName);
  return <section className="max-w-4xl py-2"><div><h1 className="text-2xl font-bold tracking-tight">{t.settings.title}</h1><p className="mt-1 text-xs leading-5 text-slate-400">{t.settings.subtitle}</p></div>
    <div className="mt-5 space-y-4"><form onSubmit={workspace.save} className="panel p-4"><h2 className="text-base font-semibold">{t.settings.workspace}</h2><div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]"><label className="block text-[11px] font-medium text-slate-300">{t.settings.workspaceName}<input value={workspace.name} onChange={event => workspace.change(event.target.value)} readOnly={!canEditWorkspace} disabled={workspace.saving} className="mt-1.5 h-9 w-full rounded-lg border border-line bg-elevated px-3 text-xs outline-none focus:border-violet focus:ring-1 focus:ring-violet" /></label><div><p className="text-[11px] font-medium text-slate-300">{t.settings.workspaceLogo}</p><div className="mt-1.5 flex h-16 items-center gap-3 rounded-lg border border-dashed border-line bg-elevated px-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-violet/15 text-violet"><ImagePlus size={17} /></span><p className="text-[10px] leading-4 text-slate-400">{t.settings.logoHelper}</p></div></div></div>{canEditWorkspace ? <SaveAction field={workspace} t={t} /> : <p className="mt-3 text-xs text-slate-500">{t.settings.workspaceReadOnly}</p>}</form>
      <form onSubmit={profile.save} className="panel p-4"><h2 className="text-base font-semibold">{t.settings.profile}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-[11px] font-medium text-slate-300">{t.settings.name}<input value={profile.name} onChange={event => profile.change(event.target.value)} disabled={profile.saving} className="mt-1.5 h-9 w-full rounded-lg border border-line bg-elevated px-3 text-xs outline-none focus:border-violet focus:ring-1 focus:ring-violet" /></label><label className="block text-[11px] font-medium text-slate-300">{t.settings.email}<input value={userEmail} readOnly type="email" className="mt-1.5 h-9 w-full rounded-lg border border-line bg-elevated px-3 text-xs outline-none focus:border-violet focus:ring-1 focus:ring-violet" /></label></div><SaveAction field={profile} t={t} /></form>
      <section className="panel p-4"><h2 className="text-base font-semibold">{t.settings.preferences}</h2><div className="mt-4"><p className="text-[11px] font-medium text-slate-300">{t.common.language}</p><div className="mt-1.5 inline-flex rounded-lg bg-elevated p-1 text-xs"><button onClick={() => setLanguage("en")} className={`rounded px-3 py-1.5 transition ${language === "en" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>EN · {t.common.english}</button><button onClick={() => setLanguage("es")} className={`rounded px-3 py-1.5 transition ${language === "es" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>ES · {t.common.spanish}</button></div></div></section>
      <section className="panel p-4"><h2 className="text-base font-semibold">{t.settings.account}</h2><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button onClick={() => void onLogout()} className="flex h-9 w-fit items-center gap-1.5 rounded-lg bg-elevated px-3 text-xs text-slate-200 transition hover:bg-slate-700"><LogOut size={15} />{t.settings.logout}</button><div className="flex items-center gap-3"><p className="text-[10px] text-slate-500">{t.settings.deleteHelper}</p><button disabled title={t.settings.deleteHelper} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-rose-400/25 px-3 text-xs text-rose-300 cursor-not-allowed opacity-50"><Trash2 size={15} />{t.settings.deleteAccount}</button></div></div></section>
    </div>
  </section>;
}
