"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { api, type User } from '../../services/api';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  // Note: backend only needs name/status/due for now. Extra fields are UI-only until backend supports them.
  onCreate: (payload: { name: string; status?: string; due?: string }) => Promise<void> | void;
}

export default function CreateTaskModal({ open, onClose, onCreate }: CreateTaskModalProps){
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [assignees, setAssignees] = useState<User[]>([]);
  const [createDate, setCreateDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [expectedDate, setExpectedDate] = useState<string>(() => new Date(Date.now()+7*86400000).toISOString().slice(0,10));
  const [reminderDays, setReminderDays] = useState<number>(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Load users for assignee picker
    api.getUsers().then(res => { if (res.success && res.data) setUsers(res.data); }).catch(()=>{});
  }, [open]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users.slice(0,5);
    return users.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q)).slice(0,5);
  }, [users, userQuery]);

  const addAssignee = (u: User) => {
    if (assignees.some(a => a.id === u.id)) return;
    setAssignees(prev => [...prev, u]);
    setUserQuery('');
  };
  const removeAssignee = (id: string) => setAssignees(prev => prev.filter(a => a.id !== id));

  const addCategory = () => {
    const t = categoryInput.trim();
    if (!t) return;
    if (!categories.includes(t)) setCategories(prev => [...prev, t]);
    setCategoryInput('');
  };
  const removeCategory = (t: string) => setCategories(prev => prev.filter(x => x !== t));

  const computeDue = () => {
    // Convert dates to a human-friendly due (e.g., "7 Days")
    try {
      const start = new Date(createDate + 'T00:00:00');
      const end = new Date(expectedDate + 'T00:00:00');
      const diffDays = Math.max(1, Math.round((end.getTime()-start.getTime())/86400000));
      return `${diffDays} Days`;
    } catch (e) {
      return '7 Days';

    }
      return '7 Days'

  };

  if (!open) return null;

  const handleCreate = async () => {
    setError(null);
    if (!name.trim()) { setError('Task name is required'); return; }
    try {
      setSubmitting(true);
      await onCreate({ name: name.trim(), status: 'In Progress', due: computeDue() });
      // Reset
      setName(''); setSection(''); setCategories([]); setCategoryInput(''); setDescription(''); setAssignees([]);
      setCreateDate(new Date().toISOString().slice(0,10));
      setExpectedDate(new Date(Date.now()+7*86400000).toISOString().slice(0,10));
      setReminderDays(7);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
      <div className="bg-card border border rounded-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-card-foreground">Create New Task</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground text-xl">×</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {/* Task name */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Task Name *</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 rounded bg-card border border text-card-foreground" placeholder="Scoping assessment 1" />
          </div>
          {/* Section / Requirement */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Requirement / Section</label>
            <input value={section} onChange={(e)=>setSection(e.target.value)} className="w-full px-3 py-2 rounded bg-card border border text-card-foreground" placeholder="Select requirement or enter a reference" />
          </div>
          {/* Categories chips */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Task category</label>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(t => (
                <span key={t} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-xs text-foreground">
                  {t}
                  <button className="text-muted-foreground hover:text-card-foreground" onClick={()=>removeCategory(t)}>×</button>
                </span>
              ))}
              <input value={categoryInput} onChange={(e)=>setCategoryInput(e.target.value)} onKeyDown={(e)=>{ if(e.key=='Enter'){ e.preventDefault(); addCategory(); } }} placeholder="Type and press Enter" className="flex-1 min-w-[160px] px-2 py-1 rounded bg-card border border text-card-foreground" />
              <button className="px-2 py-1 text-xs bg-card border border text-foreground rounded" onClick={addCategory}>Add</button>
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Task Description</label>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded bg-card border border text-card-foreground" placeholder="Enter description here" />
          </div>
          {/* Assignees */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Assign to</label>
            <input value={userQuery} onChange={(e)=>setUserQuery(e.target.value)} placeholder="Search" className="w-full px-3 py-2 rounded bg-card border border text-card-foreground" />
            {!!filteredUsers.length && (
              <div className="mt-1 border border rounded bg-card divide-y divide-border">
                {filteredUsers.map(u => (
                  <button key={u.id} type="button" onClick={()=>addAssignee(u)} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-gray-700 flex items-center justify-between">
                    <span>{u.name} <span className="text-muted-foreground">• {u.email}</span></span>
                    {assignees.some(a=>a.id===u.id) && <span className="text-green-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
            {!!assignees.length && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {assignees.map(a => (
                  <span key={a.id} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-xs text-foreground">
                    {a.name}
                    <button className="text-muted-foreground hover:text-card-foreground" onClick={()=>removeAssignee(a.id)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Create date</label>
              <input type="date" value={createDate} onChange={(e)=>setCreateDate(e.target.value)} className="w-full px-3 py-2 rounded bg-card border border text-card-foreground" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Expected Closure Date</label>
              <input type="date" value={expectedDate} onChange={(e)=>setExpectedDate(e.target.value)} className="w-full px-3 py-2 rounded bg-card border border text-card-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={true} readOnly className="accent-blue-600" />
              Set a reminder
            </label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={reminderDays} onChange={(e)=>setReminderDays(parseInt(e.target.value || '1',10))} className="w-20 px-2 py-1 rounded bg-card border border text-card-foreground" />
              <span className="text-sm text-muted-foreground">Days</span>
            </div>
          </div>

          {error && <div className="text-destructive text-sm bg-destructive/20 border rounded p-2">{error}</div>}
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-card-foreground">Cancel</button>
          <button onClick={handleCreate} disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-card-foreground rounded disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
