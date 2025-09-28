"use client";

import React, { useState } from 'react';
import type { BoardColumn } from '../../services/assessments';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { title: string; col: BoardColumn; dueIn: string; framework: string; description?: string; assignedTo?: string; template?: string; created?: string; startDate?: string }) => Promise<void> | void;
}

const columns: { key: BoardColumn; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'finished', label: 'Finished' },
];

export default function CreateAssessmentModal({ open, onClose, onCreate }: Props){
  const [title, setTitle] = useState('Assessment / Project Name');
  const [col, setCol] = useState<BoardColumn>('backlog');
  const [dueIn, setDueIn] = useState('7 Days');
  const [framework, setFramework] = useState<string>('PCI DSS 3.2.1');
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [template, setTemplate] = useState<string>('Standard');
  const [startLocal, setStartLocal] = useState<string>(() => new Date().toISOString().slice(0,16));
  const [createdLocal, setCreatedLocal] = useState<string>(() => new Date().toISOString().slice(0,16));
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleCreate = async () => {
    setError(null);
    const t = title.trim();
    if (!t) { setError('Title is required'); return; }
    try {
      setSubmitting(true);
      const createdIso = createdLocal ? new Date(createdLocal).toISOString() : undefined;
      const startIso = startLocal ? new Date(startLocal).toISOString() : undefined;
      await onCreate({ title: t, col, dueIn, framework, description, assignedTo, template, created: createdIso, startDate: startIso });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to create assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
      <div className="bg-card border rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-card-foreground">Create Assessment</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground text-xl">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Title *</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input" placeholder="Assessment / Project Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Status</label>
              <select value={col} onChange={(e)=>setCol(e.target.value as BoardColumn)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground focus:ring-2 focus:ring-primary/20 focus:border-input">
                {columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Due in</label>
              <input value={dueIn} onChange={(e)=>setDueIn(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input" placeholder="e.g. 7 Days or Complete" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Framework</label>
            <select value={framework} onChange={(e)=>setFramework(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground focus:ring-2 focus:ring-primary/20 focus:border-input">
              {['PCI DSS 3.2.1','PCI DSS 4.0','ISO/IEC 27001:2013','ISO/IEC 27001:2022','SOC 2 Type I','SOC 2 Type II','HIPAA','GDPR'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Description</label>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input min-h-[90px]" placeholder="Describe the assessment..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Project start date/time</label>
              <input type="datetime-local" value={startLocal} onChange={(e)=>setStartLocal(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Created date/time</label>
              <input type="datetime-local" value={createdLocal} onChange={(e)=>setCreatedLocal(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Assigned to</label>
              <input value={assignedTo} onChange={(e)=>setAssignedTo(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-input" placeholder="Names or emails (comma-separated)" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Template Standard</label>
              <select value={template} onChange={(e)=>setTemplate(e.target.value)} className="w-full px-3 py-2 rounded bg-card border text-card-foreground focus:ring-2 focus:ring-primary/20 focus:border-input">
                {['Standard','Light','From Framework'].map((t)=> (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          </div>
          {error && <div className="text-red-400 text-sm bg-destructive/20 border rounded p-2">{error}</div>}
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleCreate} disabled={submitting} className="px-4 py-2 bg-primary hover:brightness-110 text-primary-foreground rounded border disabled:opacity-50">{submitting ? 'Creating...' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
