import { useEffect, useState } from "react";
import { Building2, ImagePlus, LogOut, ShieldCheck, SlidersHorizontal, Trash2, UserRound } from "lucide-react";
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
  return <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4"><button type="submit" disabled={field.saving || !field.changed} className="btn-primary min-h-9">{field.saving ? t.settings.saving : t.settings.save}</button>{field.feedback && <p role={field.feedback === "saved" ? "status" : "alert"} className={`text-xs ${field.feedback === "saved" ? "text-mint" : "text-rose-300"}`}>{t.settings[field.feedback]}</p>}</div>;
}

export function SettingsView({ t, language, setLanguage, onLogout, userName, userEmail, workspaceName, canEditWorkspace, onSaveWorkspaceName, onSaveProfileName }: { t: Translations; language: Language; setLanguage: (language: Language) => void; onLogout: () => Promise<{ error: Error | null }>; userName: string; userEmail: string; workspaceName: string; canEditWorkspace: boolean; onSaveWorkspaceName: (name: string) => Promise<void>; onSaveProfileName: (name: string) => Promise<void> }) {
  const workspace = useNameSetting(workspaceName, onSaveWorkspaceName);
  const profile = useNameSetting(userName, onSaveProfileName);
  return <section className="max-w-4xl py-2"><div><h1 className="page-heading">{t.settings.title}</h1><p className="page-subtitle">{t.settings.subtitle}</p></div>
    <div className="mt-6 space-y-5"><form onSubmit={workspace.save} className="settings-panel"><h2 className="section-title"><Building2 size={17} />{t.settings.workspace}</h2><div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]"><label className="block text-xs font-medium text-slate-300">{t.settings.workspaceName}<input value={workspace.name} onChange={event => workspace.change(event.target.value)} readOnly={!canEditWorkspace} disabled={workspace.saving} className="field mt-1.5" /></label><div><p className="text-xs font-medium text-slate-300">{t.settings.workspaceLogo}</p><div className="mt-1.5 flex h-16 items-center gap-3 rounded-lg border border-dashed border-line bg-elevated px-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-violet/15 text-violet"><ImagePlus size={17} /></span><p className="text-[11px] leading-4 text-slate-400">{t.settings.logoHelper}</p></div></div></div>{canEditWorkspace ? <SaveAction field={workspace} t={t} /> : <p className="mt-3 text-xs text-slate-500">{t.settings.workspaceReadOnly}</p>}</form>
      <form onSubmit={profile.save} className="settings-panel"><h2 className="section-title"><UserRound size={17} />{t.settings.profile}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-xs font-medium text-slate-300">{t.settings.name}<input value={profile.name} onChange={event => profile.change(event.target.value)} disabled={profile.saving} className="field mt-1.5" /></label><label className="block text-xs font-medium text-slate-300">{t.settings.email}<input value={userEmail} readOnly type="email" className="field mt-1.5" /></label></div><SaveAction field={profile} t={t} /></form>
      <section className="settings-panel"><h2 className="section-title"><SlidersHorizontal size={17} />{t.settings.preferences}</h2><div className="mt-4"><p className="text-xs font-medium text-slate-300">{t.common.language}</p><div className="segmented-control mt-1.5"><button onClick={() => setLanguage("en")} className={`segment ${language === "en" ? "segment-active" : ""}`}>EN · {t.common.english}</button><button onClick={() => setLanguage("es")} className={`segment ${language === "es" ? "segment-active" : ""}`}>ES · {t.common.spanish}</button></div></div></section>
      <section className="settings-panel"><h2 className="section-title"><ShieldCheck size={17} />{t.settings.account}</h2><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button onClick={() => void onLogout()} className="btn-secondary"><LogOut size={15} />{t.settings.logout}</button><div className="flex items-center gap-3"><p className="text-[11px] text-slate-500">{t.settings.deleteHelper}</p><button disabled title={t.settings.deleteHelper} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-rose-400/25 px-3 text-xs text-rose-300 cursor-not-allowed opacity-50"><Trash2 size={15} />{t.settings.deleteAccount}</button></div></div></section>
    </div>
  </section>;
}
