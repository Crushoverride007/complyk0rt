"use client";

import React from 'react';
import { getAssessmentAnswers, getAssessmentStructure, saveAssessmentAnswers } from '../../services/assessments';
import type { FieldDef, FrameworkStructure } from '../../services/assessments';

interface Props {
  assessmentId: string;
  subsectionId: string;
  onSubsectionChange?: (id: string) => void;
}



function toInputDate(v:any): string {
  if (!v) return '';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const da = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${da}`;
  } catch { return ''; }
}

export default function SectionPanel({ assessmentId, subsectionId }: Props){
  const [structure, setStructure] = React.useState<FrameworkStructure | null>(null);
  const [form, setForm] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [canWrite, setCanWrite] = React.useState<boolean>(true);
  // Section-specific attachments were shown here previously. The UX has changed so
  // attachments are now managed exclusively in the Attachments tab. We keep state
  // only for form data in this panel.

  React.useEffect(() => {
    let mounted = true;
    async function load(){
      try {
        setLoading(true); setError(null);
        const [s, a] = await Promise.all([
          getAssessmentStructure(assessmentId),
          getAssessmentAnswers(assessmentId)
        ]);
        if (!mounted) return;
        setStructure(s);
        setForm(a[subsectionId] || {});
        // permissions check
        try {
          const base = process.env.NEXT_PUBLIC_API_URL || "http://95.217.190.154:3001";
          const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
          const res = await fetch(`${base}/assessments/${assessmentId}/permissions`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
          const j = await res.json();
          if (res.ok && j?.success) setCanWrite(!!j.permissions?.canWrite);
        } catch {}
        
      } catch (e: any) { if (!mounted) return; setError(e?.message || 'Failed to load section'); } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [assessmentId, subsectionId]);

  const item = React.useMemo(() => {
    if (!structure) return null;
    for (const part of structure.parts) {
      for (const sec of part.sections) {
        for (const it of sec.items) {
          if (it.id === subsectionId) return { part, sec, it };
        }
      }
    }
    return null;
  }, [structure, subsectionId]);

  const onSave = async () => {
    try {
      const patch: any = { [subsectionId]: form };
      const updated = await saveAssessmentAnswers(assessmentId, patch);
      setForm(updated[subsectionId] || {});
      // notify global listeners (page) that answers changed
      const ev = new CustomEvent('answers-saved', { detail: { assessmentId, subsectionId } });
      if (typeof window !== 'undefined') window.dispatchEvent(ev as any);
    } catch (e) {
      // could add toast here
    }
  };

  const onClear = async () => {
    try {
      setForm({});
      // Persist null to clear the subsection entirely (server stores null)
      const patch: any = { [subsectionId]: null };
      const updated = await saveAssessmentAnswers(assessmentId, patch);
      setForm(updated[subsectionId] || {});
      const ev = new CustomEvent('answers-saved', { detail: { assessmentId, subsectionId } });
      if (typeof window !== 'undefined') window.dispatchEvent(ev as any);
    } catch (e) {
      // optional: toast
    }
  };


  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading section…</div>;
  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>;
  if (!item) return <div className="p-6 text-sm text-muted-foreground">No section found.</div>;

  const fields: FieldDef[] = item.it.fields || [ { id:'notes', type:'textarea', label:'Notes' } ];

  return (
    <div className="p-6">
      {!canWrite && (
        <div className="mb-4 p-3 rounded border text-sm bg-warning/10 border-yellow-700 text-yellow-300">
          You have read-only access to this assessment. Ask an editor or admin for edit permissions.
        </div>
      )}
      <h2 className="text-lg font-semibold text-card-foreground">{(() => { const n:any = item.it.number ?? item.sec.number; const sep = (typeof n === "string" && n.includes(".")) ? " " : ". "; return `${n}${sep}${(item.it && (item.it as any).label) || item.sec.heading}`; })()}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((f) => {
          // Conditional display for top-level fields (e.g., show a table only if a prior radio is "Yes")
          const fWhen: any = (f as any).when || (f as any).showWhen;
          if (fWhen) {
            const fld = fWhen.fieldId || fWhen.field;
            const eq = (typeof fWhen.equals !== 'undefined') ? fWhen.equals : fWhen.eq;
            const cur = (form as any)[fld];
            const ok = (typeof eq === 'undefined') ? !!cur : cur === eq;
            if (!ok) return null;
          }

          if (f.type === 'divider') {
            return <div key={f.id} className="md:col-span-2 my-4 border-t" role="separator" />
          }
          if (f.type === 'heading') {
            return (
              <div key={f.id} className="md:col-span-2 mt-8">
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t" />
                  <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{f.label}</div>
                  <div className="flex-1 border-t" />
                </div>
              </div>
            );
          }
          return (
          <div key={f.id} className={(f.type==='textarea' || f.type==='radio-table' || f.type==='checkbox-table' || f.type==='form-table' || f.type==='table-list') ? 'md:col-span-2' : ''}>
            {f.type !== 'radio-table' && (
              <label className="block text-sm text-muted-foreground mb-1">{f.label}{f.required ? ' *' : ''}</label>
            )}
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.id] ?? ''}
                onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.value; setForm(prev=>({ ...prev, [f.id]: v })); }}
                className="w-full h-32 px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                placeholder={`Enter ${typeof f.label === "string" ? f.label : ""}`}
              disabled={!canWrite}
              />
            ) : f.type==='date' ? (
              <input
                type="date"
                value={toInputDate(form[f.id])}
                onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.value; setForm(prev=>({ ...prev, [f.id]: v })); }}
                className="w-full px-3 py-2 rounded bg-card border text-card-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                disabled={!canWrite}
              />
            ) : f.type==='number' ? (
              <input
                type="number"
                value={form[f.id] ?? ''}
                onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.value === '' ? '' : Number(e.currentTarget.value); setForm(prev=>({ ...prev, [f.id]: v })); }}
                className="w-full px-3 py-2 rounded bg-card border text-card-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                disabled={!canWrite}
              />
            
            ) : f.type==='radio-table' && Array.isArray(f.options) ? (
              <table className="w-full text-sm border border-[hsl(var(--foreground)/0.08)] rounded-md overflow-hidden bg-card">
                        <colgroup>
                          {cols.map((c:any, i:number) => (
                            <col key={c.id || i} style={{ width: (c.width || undefined) as any }} />
                          ))}
                        </colgroup>
                {f.label && (
                  <thead>
                    <tr>
                      <th colSpan={2} className="text-left px-3 py-2 bg-[hsl(var(--foreground)/0.06)] text-card-foreground">{f.label}</th>
                    </tr>
                  </thead>
                )}
                <tbody className="[&>tr:nth-child(odd)]:bg-[hsl(var(--foreground)/0.02)]">
                  {f.options.map(opt => {
                    const checked = (form[f.id] ?? '') === opt;
                    const parts = String(opt).split(' | ');
                    const title = parts[0];
                    const desc = parts.slice(1).join(' | ');
                    return (
                      <tr key={opt} className={checked ? 'bg-[hsl(var(--primary)/0.06)]' : ''}>
                        <td className="align-top w-10 px-3 py-3 border-t">
                          <input
                            type="radio"
                            name={f.id}
                            value={opt}
                            checked={checked}
                            onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.value; setForm(prev=>({ ...prev, [f.id]: v })); }}
                            className="h-4 w-4 accent-[hsl(var(--primary))]"
                            disabled={!canWrite}
                          />
                        </td>
                        <td className="px-3 py-3 border-t">
                          <div className="text-card-foreground font-medium">{title}</div>
                          {!!desc && <div className="text-xs text-muted-foreground mt-1">{desc}</div>}
                        </td>
