"use client";

import React from 'react';
import { getAssessmentAnswers, getAssessmentStructure, saveAssessmentAnswers, uploadAttachment, linkSectionAttachments } from '../../services/assessments';
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

  // Special rendering rules
  // 1) For 1.8.1 "Identify sub-requirements with the following results/methods",
  //    render the six note areas as a neat two-column table instead of stacked boxes.
  const SUBREQ_HEADING_ID = 'summaryNoteHeading';
  const SUBREQ_NOTE_IDS: string[] = [
    'naNotes',      // Not Applicable
    'ntNotes',      // Not Tested
    'niplrNotes',   // Not in Place Due to a Legal Restriction
    'nipnlrNotes',  // Not in Place Not Due to a Legal Restriction
    'ccNotes',      // Compensating Control
    'caNotes',      // Customized Approach
  ];
  const fieldById: Record<string, FieldDef> = Object.fromEntries(fields.map(f => [f.id, f] as const));
  const consumed = new Set<string>();


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
          if (consumed.has(f.id)) return null;
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
            // Special-case: following the summaryNoteHeading, collect six note textareas
            if (f.id === SUBREQ_HEADING_ID) {
              const noteIds = SUBREQ_NOTE_IDS.filter(id => !!fieldById[id]);
              noteIds.forEach(id => consumed.add(id));
              return (
                <div key={f.id} className="md:col-span-2 mt-8">
                  {/* Heading visual */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 border-t" />
                    <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{f.label}</div>
                    <div className="flex-1 border-t" />
                  </div>
                  {/* Two-column table for sub-requirements notes */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-[hsl(var(--foreground)/0.08)] rounded-md overflow-hidden bg-card">
                      <thead>
                        <tr>
                          <th className="w-[28%] min-w-[220px] px-3 py-2 text-left bg-[hsl(var(--foreground)/0.06)] text-card-foreground">Result / Method</th>
                          <th className="px-3 py-2 text-left bg-[hsl(var(--foreground)/0.06)] text-card-foreground">Sub-requirements (list ranges or individual IDs)</th>
                        </tr>
                      </thead>
                      <tbody className="[&>tr:nth-child(odd)]:bg-[hsl(var(--foreground)/0.02)]">
                        {noteIds.map(id => {
                          const def = fieldById[id];
                          const value = form[id] ?? '';
                          return (
                            <tr key={id}>
                              <td className="align-top px-3 py-2 border-t text-card-foreground whitespace-pre-wrap">{def.label}</td>
                              <td className="px-3 py-2 border-t">
                                <textarea
                                  value={value}
                                  onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.value; setForm(prev=>({ ...prev, [id]: v })); }}
                                  className="w-full h-24 px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                                  placeholder={`Enter ${typeof def.label === 'string' ? def.label : ''}`}
                                  disabled={!canWrite}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
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
          
          // Alert (non-input informational note)
          if (f.type === "alert") {
            const v = (f as any).variant || "info";
            const color = v === "warning"
              ? "bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/40 dark:border-yellow-500 dark:text-yellow-100"
              : v === "success"
              ? "bg-green-100 border-green-300 text-green-900 dark:bg-green-900/40 dark:border-green-500 dark:text-green-100"
              : v === "error"
              ? "bg-red-100 border-red-300 text-red-900 dark:bg-red-900/40 dark:border-red-500 dark:text-red-100"
              : "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-100";
            return (
              <div key={f.id} className={`md:col-span-2 p-3 rounded border text-sm ${color}`} role="note" aria-label={String(f.label||'Note')}>
                <div className="font-medium mb-0.5">{f.label}</div>
                {f.help && (<div className="whitespace-pre-wrap text-xs opacity-90">{f.help}</div>)}
              </div>
            );
          }
          // Dropzone (upload to attachments and link to this subsection)
          if (f.type === "dropzone") {
            const accept = (f as any).accept || 'image/*,application/pdf';
            const multiple = !!(f as any).multiple;
            const onFiles = async (files: FileList | null) => {
              if (!files || files.length === 0) return;
              try {
                const addedIds: string[] = [];
                for (const file of Array.from(files)) {
                  const att = await uploadAttachment(assessmentId, file);
                  addedIds.push(att.id);
                }
                if (addedIds.length) {
                  await linkSectionAttachments(assessmentId, subsectionId, addedIds, []);
                }
              } catch (e) { /* optional toast */ }
            };
            const stop = (e: any) => { e.preventDefault(); e.stopPropagation(); };
            return (
              <div key={f.id} className="md:col-span-2">
                <div
                  onDragEnter={stop} onDragOver={stop} onDrop={(e:any)=>{stop(e); onFiles(e.dataTransfer.files);}}
                  className="border border-dashed rounded-md p-8 text-center text-muted-foreground bg-card hover:bg-[hsl(var(--foreground)/0.03)]"
                  aria-label={String(f.label || 'Upload files')}
                >
                  <div className="mb-2 text-card-foreground font-medium">{f.label || 'Upload files'}</div>
                  <div className="text-xs mb-3">Drag & drop files here or click to browse</div>
                  <label className="inline-flex items-center justify-center h-9 px-3 rounded-md border bg-card hover:bg-[hsl(var(--foreground)/0.06)] cursor-pointer">
                    Browse files
                    <input type="file" className="sr-only" accept={accept} multiple={multiple}
                      onChange={(e:any)=>{ onFiles(e.currentTarget.files); e.currentTarget.value=''; }} />
                  </label>
                </div>
                {f.help && (<div className="mt-2 text-xs text-muted-foreground">{f.help}</div>)}
              </div>
            );
          }
const fullWidth = (() => {
// Make inputs take the entire row by default when not part of multi-column tables
            if (['textarea','radio-table','checkbox-table','form-table','table-list'].includes(f.type)) return true;
            // Also extend common single inputs and groups to full row for better readability
            if (['text','number','date','radio','checkbox'].includes(f.type)) return true;
            return false;
          })();
          return (
          <div key={f.id} className={fullWidth ? 'md:col-span-2' : ''}>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : f.type==='checkbox-table' && Array.isArray(f.columns) && Array.isArray(f.rows) ? (
              <table className="w-full text-sm border border-[hsl(var(--foreground)/0.08)] rounded-md overflow-hidden bg-card">
                        
                <thead>
                  <tr>
                    <th className="px-3 py-2 bg-[hsl(var(--foreground)/0.06)] text-card-foreground text-left">PCI DSS Requirement</th>
                    {(() => {
                      const groups: Record<string, number> = {};
                      for (const c of f.columns!) {
                        const g = (c as any).group || '';
                        groups[g] = (groups[g] || 0) + 1;
                      }
                      return Object.entries(groups).map(([g, span]) => (
                        <th key={g+String(span)} colSpan={span} className="px-3 py-2 bg-[hsl(var(--foreground)/0.06)] text-card-foreground text-center border-l-2 border-[hsl(var(--foreground)/0.2)]">{g || f.label}</th>
                      ));
                    })()}
                  </tr>
                  <tr>
                    <th className="px-3 py-2 border-t text-card-foreground text-left"></th>
                    {f.columns!.map((c:any, idx:number) => (
                      <th key={c.id + String(idx)} className={"px-3 py-2 border-t text-card-foreground text-center " + (idx>0 && (((f.columns as any)[idx-1]?.group||"") !== ((c as any).group||"")) ? "border-l-2 border-[hsl(var(--foreground)/0.2)]" : "border-l")}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(odd)]:bg-[hsl(var(--foreground)/0.02)]">
                  {f.rows!.map((r:any) => {
                    const rowVals = (form[f.id] ?? {})[r.id] ?? {};
                    return (
                      <tr key={r.id}>
                        <td className="px-3 py-2 border-t text-card-foreground">{r.label}</td>
                        {f.columns!.map((c:any, idx:number) => {
                          const checked = !!rowVals[c.id];
                          return (
                            <td key={c.id} className="px-3 py-2 border-t text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e)=>{ if (!canWrite) return; const v = e.currentTarget.checked; setForm(prev=>{
                                  const cur = prev[f.id] ?? {};
                                  const row = { ...(cur[r.id] || {}) };
                                  row[c.id] = v;
                                  return { ...prev, [f.id]: { ...cur, [r.id]: row } };
                                }); }}
                                disabled={!canWrite}
                                className="h-4 w-4 accent-[hsl(var(--primary))]"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            ) : f.type==='checkbox' && Array.isArray(f.options) ? (
              <div className="space-y-2">
                {(() => {
                  const sel: Set<string> = new Set(Array.isArray(form[f.id]) ? form[f.id] : []);
                  return f.options.map((opt:any) => {
                    const checked = sel.has(String(opt));
                    return (
                      <label key={opt} className={
                        `flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ` +
                        (checked ? 'bg-[hsl(var(--primary)/0.06)] border-[hsl(var(--primary))]' : 'bg-card hover:bg-[hsl(var(--foreground)/0.03)] border')
                      }
                      >
                        <input
                          type="checkbox"
                          value={opt}
                          checked={checked}
                          onChange={(e)=>{ if (!canWrite) return; const v = e.currentTarget.checked; const val = String(opt); setForm(prev=>{ const cur = new Set(Array.isArray(prev[f.id]) ? prev[f.id] : []); if (v) cur.add(val); else cur.delete(val); return { ...prev, [f.id]: Array.from(cur) }; }); }}
                          className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                          disabled={!canWrite}
                        />
                        <div className="text-sm text-card-foreground">{opt}</div>
                      </label>
                    );
                  });
                })()}
              </div>

            ) : f.type==='form-table' && Array.isArray(f.rows) ? (
              <div className="space-y-1.5">
                {f.help && <div className="text-sm text-muted-foreground mb-1">{f.help}</div>}
                <table className="w-full table-fixed text-sm border rounded-md overflow-hidden bg-card">
                  <tbody className="[&>tr:nth-child(odd)]:bg-[hsl(var(--foreground)/0.02)]">
                    {f.rows.map((r:any) => {
                      const shouldShow = (() => {
                        const cond = (r && (r.when || r.showWhen)) || null;
                        if (!cond) return true;
                        const fieldId = cond.fieldId || cond.field || 'segmentationUsed';
                        const equals = cond.equals ?? cond.eq;
                        const nested = ((form[f.id] ?? {}) as any)[fieldId];
                        const v = (nested !== undefined) ? nested : (form as any)[fieldId];
                        return (typeof equals === 'undefined') ? !!v : v === equals;
                      })();
                      if (!shouldShow) return null;
                      const val = (form[f.id] ?? {})[r.id] ?? (r.type==='checkboxes' ? [] : '');
                      const setVal = (next:any) => setForm(prev => ({ ...prev, [f.id]: { ...(prev[f.id]||{}), [r.id]: next } }));
                      return (
                        <tr key={r.id}>
  <td className="p-0 border-t" colSpan={2}>
    <div className="px-3 py-1.5 bg-[hsl(var(--foreground)/0.03)]">
      <div className="font-medium text-[13px] text-card-foreground leading-snug">{r.label}</div>
      {r.help && <div className="mt-1 text-xs text-muted-foreground italic leading-snug whitespace-pre-wrap">{r.help}</div>}
    </div>
    <div className="px-3 py-1.5">
      {r.type==='textarea' ? (
        <textarea
          value={val}
          onChange={(e)=> { if (!canWrite) return; setVal(e.currentTarget.value); }}
          className="w-full h-24 px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
          disabled={!canWrite}
        />
      ) : r.type==='checkboxes' && Array.isArray(r.options) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 py-0.5">
          {r.options.map((opt:any) => {
            const selected: Set<string> = new Set(Array.isArray(val) ? val : []);
            const checked = selected.has(String(opt));
            return (
              <label key={opt} className="inline-flex items-center gap-2 text-card-foreground">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.checked; const sval = String(opt); const next = new Set(Array.isArray(val) ? val : []); if (v) next.add(sval); else next.delete(sval); setVal(Array.from(next)); }}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                  disabled={!canWrite}
                />
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      ) : r.type==='radio' && Array.isArray(r.options) ? (
        <div className="flex flex-wrap gap-2">
          {r.options.map((opt:any) => {
            const checked = String(val) === String(opt);
            return (
              <label key={opt} className="inline-flex items-center gap-2 text-card-foreground rounded-md border px-3 h-9 cursor-pointer">
                <input
                  type="radio"
                  name={`${f.id}-${r.id}`}
                  value={opt}
                  checked={checked}
                  onChange={(e)=> { if (!canWrite) return; setVal(e.currentTarget.value); }}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                  disabled={!canWrite}
                />
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <input
          type="text"
          value={val}
          onChange={(e)=> { if (!canWrite) return; setVal(e.currentTarget.value); }}
          className="w-full px-3 py-2 rounded bg-card border text-card-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
          disabled={!canWrite}
        />
      )}
    </div>
  </td>
</tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : f.type==='table-list' && Array.isArray(f.columns) ? (
              <div className="space-y-2">
                {f.help && !(((f as any).helpPosition === 'below') || (f as any).helpBelow || f.id === 'componentTypes') && (
                  <div className="text-sm text-muted-foreground">{f.help}</div>
                )}
                {(() => {
                  const cols: any[] = f.columns || [];
                  const minRows = Math.max(1, Math.min(20, Number((f as any).minRows || 3)));
                  const rows: any[] = Array.isArray(form[f.id]) ? form[f.id] : [];
                  while (rows.length < minRows) rows.push({});
                  const setRows = (next: any[]) => setForm(prev => ({ ...prev, [f.id]: next }));
                  const onCellChange = (rIdx: number, cId: string, value: any) => {
                    const next = rows.map((r:any, i:number)=> i===rIdx ? { ...r, [cId]: value } : r);
                    setRows(next);
                  };
                  const addRow = () => setRows([...rows, {}]);
                  const removeRow = (idx: number) => setRows(rows.filter((_,i)=>i!==idx));
                  return (
                    <div className="overflow-auto">
                      <table className="w-full text-sm border border-[hsl(var(--foreground)/0.08)] rounded-md overflow-hidden bg-card">
                        
                        <thead>
                          <tr>
                            {cols.map((c:any) => (
                              <th key={c.id} className="px-3 py-1.5 bg-[hsl(var(--foreground)/0.06)] text-card-foreground text-[11px] uppercase tracking-wide text-left whitespace-nowrap">{c.label}</th>
                            ))}
                            <th className="px-3 py-1.5 bg-[hsl(var(--foreground)/0.06)] text-card-foreground text-[11px] uppercase tracking-wide text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="[&>tr:nth-child(odd)]:bg-[hsl(var(--foreground)/0.02)]">
                          {rows.map((row:any, rIdx:number) => (
                            <tr key={rIdx}>
                              {cols.map((c:any) => {
                                const cond = (c.when || (c.showWhen)) as any;
                                let show = true;
                                if (cond) {
                                  const dep = cond.columnId || cond.colId || cond.fieldId || cond.field;
                                  const eq = (typeof cond.equals !== 'undefined') ? cond.equals : cond.eq;
                                  const v = row[dep];
                                  show = (typeof eq === 'undefined') ? !!v : v === eq;
                                }
                                return (
                                  <td key={c.id} className="px-3 py-2 border-t align-top">
                                    {c.type==='date' ? (
                                      show ? (
                                        <input
                                          type="date"
                                          value={toInputDate(row[c.id])}
                                          onChange={(e)=> { if (!canWrite) return; onCellChange(rIdx, c.id, e.currentTarget.value); }}
                                          className="w-full h-9 px-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                                          disabled={!canWrite}
                                        />
                                      ) : null
                                    ) : c.type==='number' ? (
                                      show ? (
                                        <input
                                          type="number"
                                          value={row[c.id] ?? ''}
                                          onChange={(e)=> { if (!canWrite) return; onCellChange(rIdx, c.id, e.currentTarget.value===''? '' : Number(e.currentTarget.value)); }}
                                          className="w-full h-9 px-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                                          disabled={!canWrite}
                                        />
                                      ) : null
                                    ) : c.type==='radio' ? (
                                      show ? (
                                        <div className="flex items-center gap-4">
                                          {((c.options && Array.isArray(c.options) && c.options.length)? c.options : ['Yes','No']).map((opt:any) => {
                                            const checked = String(row[c.id] ?? '') === String(opt);
                                            return (
                                              <label key={String(opt)} className="inline-flex items-center gap-2 text-card-foreground">
                                                <input type="radio" name={`${f.id}-${c.id}-${rIdx}`} value={String(opt)} checked={checked}
                                                  onChange={(e)=> { if (!canWrite) return; onCellChange(rIdx, c.id, e.currentTarget.value); }}
                                                  className="h-4 w-4 accent-[hsl(var(--primary))]" disabled={!canWrite} />
                                                <span className="text-sm">{String(opt)}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      ) : null
                                    ) : (
                                      show ? (
                                        <input
                                          type="text"
                                          value={row[c.id] ?? ''}
                                          onChange={(e)=> { if (!canWrite) return; onCellChange(rIdx, c.id, e.currentTarget.value); }}
                                          className="w-full h-9 px-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                                          disabled={!canWrite}
                                        />
                                      ) : null
                                    )}
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2 border-t text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={()=> { if (!canWrite) return; removeRow(rIdx); }}
                                  disabled={!canWrite || rows.length<=1}
                                  className="inline-flex items-center h-8 px-2 text-xs rounded border bg-card hover:bg-[hsl(var(--foreground)/0.06)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-2 flex justify-end">
                        <button type="button" onClick={()=> { if (!canWrite) return; addRow(); }} disabled={!canWrite}
                          className="inline-flex items-center h-8 px-3 rounded-md border bg-card hover:bg-[hsl(var(--foreground)/0.06)] text-xs disabled:opacity-50">
                          Add row
                        </button>
                      </div>
                      {f.help && (((f as any).helpPosition === 'below') || (f as any).helpBelow || f.id === 'componentTypes') && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {String(f.help).split('
').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
) : f.type === 'radio' && Array.isArray(f.options) ? (
              (() => {
                const opts = f.options;
                const short = Array.isArray(opts) && opts.length <= 3 && opts.every(o => String(o).length <= 12);
                return (
                  <div className={short ? 'space-y-1' : 'space-y-2'}>
                    {f.help && <div className="text-xs text-muted-foreground">{f.help}</div>}
                    <div className={short ? 'flex flex-wrap gap-2' : 'space-y-2'}>
                    {opts.map(opt => {
                      const checked = (form[f.id] ?? '') === opt;
                      const base = short
                        ? 'inline-flex items-center gap-2 rounded-md border px-3 h-9 cursor-pointer transition-colors'
                        : 'flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors';
                      const active = checked ? 'bg-[hsl(var(--primary)/0.08)] border-[hsl(var(--primary))]' : 'bg-card hover:bg-[hsl(var(--foreground)/0.03)] border';
                      return (
                        <label key={opt} className={`${base} ${active}`}>
                          <input
                            type="radio"
                            name={f.id}
                            value={opt}
                            checked={checked}
                            onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.value; setForm(prev=>({ ...prev, [f.id]: v })); }}
                            className={short ? 'h-4 w-4 accent-[hsl(var(--primary))]' : 'mt-1 h-4 w-4 accent-[hsl(var(--primary))]'}
                            disabled={!canWrite}
                          />
                          <div>
                            <div className={`text-sm font-medium ${checked ? 'text-[hsl(var(--primary))]' : 'text-card-foreground'}`}>{opt}</div>
                            {false && !short && String(opt).includes(' | ') && (
                              <div className="text-xs text-muted-foreground">{String(opt).split(' | ').slice(1).join(' | ')}</div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                    </div>
                  </div>
                );
              })()
            ) : (
              <input
                type="text"
                value={form[f.id] ?? ''}
                onChange={(e)=> { if (!canWrite) return; const v = e.currentTarget.value; setForm(prev=>({ ...prev, [f.id]: v })); }}
                className="w-full px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input"
                placeholder={`Enter ${typeof f.label === "string" ? f.label : ""}`}
              disabled={!canWrite}
              />
            )}
          </div>
          );
        })}
      </div>

      {/* Attachments callout */}
      <div className="mt-6 rounded-md border bg-card/60 p-4" role="note" aria-label="Attachments">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-card-foreground">Manage attachments for this section</div>
            <div className="text-xs text-muted-foreground">Upload files and link or unlink them to this section.</div>
          </div>
          <a className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--primary))]" href={`?tab=attachments&sub=${encodeURIComponent(subsectionId)}`}>Open attachments</a>
        </div>
      </div>
      <div className="flex justify-end mt-6 gap-2">
        <button onClick={onClear} disabled={!canWrite} className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md border bg-card hover:bg-[hsl(var(--foreground)/0.06)] text-card-foreground" title="Clear all answers in this section" aria-label="Clear all answers">Clear all</button>
        <button onClick={onSave} disabled={!canWrite} className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md border bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-[hsl(var(--success-foreground))]" title="Save answers" aria-label="Save answers">Save</button>
      </div>
    </div>
  );
}
