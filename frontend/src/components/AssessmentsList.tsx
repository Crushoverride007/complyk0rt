
"use client";

import React, { useMemo, useState } from 'react';
import type { AssessmentSummary, BoardColumn } from '../services/assessments';
import { updateAssessment, archiveAssessment, unarchiveAssessment, deleteAssessment } from '../services/assessments';

interface Props {
  rows: AssessmentSummary[];
  archived?: boolean;
  onUpdated?: (row: AssessmentSummary) => void;
  onRemoved?: (id: string) => void;
  onToast?: (msg: string, type?: 'success'|'error') => void;
}

export default function AssessmentsList({ rows, archived=false, onUpdated, onRemoved, onToast }: Props){
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCol, setEditCol] = useState<BoardColumn>('backlog');
  const [editDueIn, setEditDueIn] = useState('');
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allSelected = useMemo(()=> rows.length>0 && rows.every(r => selected[r.id]), [rows, selected]);
  const selectedIds = useMemo(()=> rows.filter(r => selected[r.id]).map(r=>r.id), [rows, selected]);

  const startEdit = (r: AssessmentSummary) => {
    setEditingId(r.id); setEditTitle(r.title); setEditCol(r.col as BoardColumn); setEditDueIn(r.dueIn);
  };
  const saveEdit = async (r: AssessmentSummary) => {
    try {
      setSaving(true);
      const updated = await updateAssessment(r.id, { title: editTitle, col: editCol, dueIn: editDueIn || r.dueIn });
      onUpdated?.(updated); setEditingId(null);
      onToast?.('Assessment updated', 'success');
    } catch (e:any) { onToast?.(e?.message || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  };
  const doArchive = async (id: string) => {
    if (!confirm('Archive this assessment?')) return;
    try { await archiveAssessment(id); onRemoved?.(id); onToast?.('Archived', 'success'); }
    catch(e:any){ onToast?.(e?.message||'Failed to archive', 'error'); }
  };
  const doUnarchive = async (id: string) => {
    if (!confirm('Unarchive this assessment?')) return;
    try { const restored = await unarchiveAssessment(id); onRemoved?.(id); onUpdated?.(restored); onToast?.('Unarchived', 'success'); }
    catch(e:any){ onToast?.(e?.message||'Failed to unarchive', 'error'); }
  };

  const bulkArchive = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Archive ${selectedIds.length} selected item(s)?`)) return;
    let ok = 0; let fail = 0;
    for (const id of selectedIds) {
      try { await archiveAssessment(id); onRemoved?.(id); ok++; } catch { fail++; }
    }
    onToast?.(`Archived ${ok}${fail?` (${fail} failed)`:''}` , fail? 'error':'success');
    setSelected({});
  };
  const bulkUnarchive = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Unarchive ${selectedIds.length} selected item(s)?`)) return;
    let ok = 0; let fail = 0;
    for (const id of selectedIds) {
      try { const restored = await unarchiveAssessment(id); onRemoved?.(id); onUpdated?.(restored); ok++; } catch { fail++; }
    }
    onToast?.(`Unarchived ${ok}${fail?` (${fail} failed)`:''}` , fail? 'error':'success');
    setSelected({});
  };

    const doDelete = async (id: string) => {
    if (!confirm('Permanently delete this assessment? This cannot be undone.')) return;
    try { await deleteAssessment(id); onRemoved?.(id); onToast?.('Deleted', 'success'); }
    catch(e:any){ onToast?.(e?.message||'Failed to delete', 'error'); }
  };

const toneFor = (col: string) => col==='finished' ? 'tone-finished'
  : col==='review' ? 'tone-review'
  : col==='inprogress' ? 'tone-inprogress'
  : 'tone-backlog';
  const dueTone = (due: string) => {
    const m = /([0-9]+)\s*Days?/i.exec(due || '');
    if (!m) return 'text-muted-foreground';
    const n = parseInt(m[1],10);
    if (n <= 2) return 'text-red-300';
    if (n <= 5) return 'text-yellow-300';
    return 'text-muted-foreground';
  };


  return (
    <div className="bg-card border rounded">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="font-semibold text-card-foreground font-semibold">{archived ? 'Archived Assessments' : 'Assessments'}</div>
        <div className="text-muted-foreground text-sm">{rows.length} items</div>
      </div>
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Selected: {selectedIds.length}</span>
        {!archived ? (
          <button disabled={!selectedIds.length} onClick={bulkArchive} className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded border disabled:opacity-50">Archive selected</button>
        ) : (
          <button disabled={!selectedIds.length} onClick={bulkUnarchive} className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded border disabled:opacity-50">Unarchive selected</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="py-3 px-4"><input type="checkbox" checked={allSelected} onChange={(e)=>{
                const v = e.target.checked; const next: Record<string, boolean> = {}; rows.forEach(r=> next[r.id]=v); setSelected(next);
              }} /></th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Due in</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const isEditing = editingId === r.id;
              return (
                <tr key={r.id} className="border-b hover:bg-accent/40">
                  <td className="py-3 px-4">
                    <input type="checkbox" checked={!!selected[r.id]} onChange={(e)=> setSelected(prev => ({...prev, [r.id]: e.target.checked}))} />
                  </td>
                  <td className="py-3 px-4 font-semibold text-card-foreground">
                    {isEditing ? (
                      <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 font-semibold text-card-foreground" />
                    ) : r.title}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {isEditing ? (
                      <select value={editCol} onChange={e=>setEditCol(e.target.value as BoardColumn)} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 font-semibold text-card-foreground">
                        <option value="backlog">backlog</option>
                        <option value="inprogress">inprogress</option>
                        <option value="review">review</option>
                        <option value="finished">finished</option>
                      </select>
                    ) : (
                      <span className={`badge ${toneFor(r.col)}`}>{r.col}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {isEditing ? (
                      <input value={editDueIn} onChange={e=>setEditDueIn(e.target.value)} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 font-semibold text-card-foreground" />
                    ) : (
                      <span className={dueTone(r.dueIn)}>{r.dueIn}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      {isEditing ? (
                        <>
                          <button disabled={saving} onClick={()=>saveEdit(r)} className="text-xs px-2 py-1 bg-green-700 font-semibold text-card-foreground rounded border border-green-600 disabled:opacity-50">Save</button>
                          <button disabled={saving} onClick={()=>setEditingId(null)} className="text-xs px-2 py-1 bg-secondary text-foreground rounded border">Cancel</button>
                        </>
                      ) : (
                        <>
                          {!archived && (<button onClick={()=>startEdit(r)} className="text-xs px-2 py-1 bg-secondary text-foreground rounded border">Edit</button>)}
                          {!archived && (<button onClick={()=>doArchive(r.id)} className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded border">Archive</button>)}
                          {!archived && (<button onClick={()=>doDelete(r.id)} className="text-xs px-2 py-1 bg-destructive/80 text-destructive-foreground rounded border">Delete</button>)}
                          {archived && (<button onClick={()=>doUnarchive(r.id)} className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded border">Unarchive</button>)}
                        </>
                      )}
                    </div>
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
