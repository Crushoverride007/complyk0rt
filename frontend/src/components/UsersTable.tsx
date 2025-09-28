"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { api, User } from '../services/api';
import UserModal from './UserModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ToastProvider';

function roleLabel(role: string) {
  const r = String(role||'').toLowerCase();
  if (r === 'viewer') return 'Viewer/Guest';
  if (r === 'qa') return 'QA';
  if (r === 'assessor') return 'Assessor';
  if (r === 'manager') return 'Manager';
  if (r === 'admin') return 'Admin';
  return role || 'viewer';
}

function RoleBadge({ role }: { role: string }) {
  const tone = useMemo(() => {
    const r = String(role || '').toLowerCase();
    if (r === 'admin') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-700/40';
    if (r === 'manager') return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-200 dark:border-indigo-700/40';
    if (r === 'assessor') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-700/40';
    if (r === 'qa') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-700/40';
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:border-slate-700/40';
  }, [role]);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${tone}`}>{roleLabel(role)}</span>
  );
}

function StatusPill({ active }: { active?: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-2 text-xs text-foreground">
      <span className="dot dot-success" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="dot dot-danger" /> Inactive
    </span>
  );
}

const UsersTable: React.FC = () => {
  const { showToast } = useToast();
  const { user: authUser } = useAuth() as any;
  const currentRole: string = (
    authUser?.role || authUser?.organizations?.[0]?.role ||
    (String(authUser?.email||'').toLowerCase()==='admin@acme.example.com' ? 'admin' : 'viewer')
  ).toLowerCase();
  const canManage = ['admin','manager'].includes(currentRole);
  const canActivate = currentRole === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all'|'admin'|'manager'|'assessor'|'qa'|'viewer'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await api.getUsers();
    if (res.success && res.data) {
      setUsers(res.data);
      setError(null);
    } else {
      setError(res.message || 'Failed to load users');
      showToast(res.message || 'Failed to load users', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const onSaved = (u: User) => { showToast('User saved', 'success');
    setUsers(prev => {
      const idx = prev.findIndex(x => x.id === u.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = u; return copy; }
      return [u, ...prev];
    });
  };

  const toggleActive = async (u: User) => {
    const action = u.active ? 'Deactivated' : 'Activated';
    if (u.active) {
      const res = await api.deactivateUser(u.id);
      if (res.success && res.data) { setUsers(prev => prev.map(x => x.id === u.id ? res.data! : x)); showToast(`${action} ${u.email}`, 'success'); } else { showToast(res.message || 'Failed to deactivate', 'error'); }
    } else {
      const res = await api.updateUser(u.id, { active: true });
      if (res.success && res.data) { setUsers(prev => prev.map(x => x.id === u.id ? res.data! : x)); showToast(`${action} ${u.email}`, 'success'); } else { showToast(res.message || 'Failed to activate', 'error'); }
    }
  };


  const deleteUser = async (u: User) => {
    if (!canActivate) return;
    const ok = typeof window === 'undefined' ? true : window.confirm(`Delete user ${u.email}? This will deactivate their account.`);
    if (!ok) return;
    const res = await api.deleteUserHard(u.id);
    if (res.success) {
      setUsers(prev => prev.filter(x => x.id !== u.id));
      showToast(`Deleted ${u.email}`, 'success');
    } else {
      showToast(res.message || 'Failed to delete user', 'error');
    }
  };
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter(u => {
      if (roleFilter !== 'all' && String(u.role || '').toLowerCase() !== roleFilter) return false;
      if (!term) return true;
      return (
        String(u.name||'').toLowerCase().includes(term) ||
        String(u.email||'').toLowerCase().includes(term)
      );
    });
  }, [users, q, roleFilter]);

  return (
    <div className="bg-card rounded-lg border">
      <div className="flex items-center justify-between p-4 border-b gap-4 flex-wrap">
        <div className="min-w-[220px]">
          <h4 className="text-card-foreground font-semibold">Users</h4>
          
<div className="flex items-center gap-2 text-xs text-muted-foreground">
            <p>Invite users, assign roles, and manage access.</p>
            <span className="mx-1">•</span>
            <span className="inline-flex items-center gap-1">Your role: <RoleBadge role={currentRole} /></span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            placeholder="Search name or email..."
            className="h-9 px-3 rounded border bg-card text-sm"
            value={q}
            onChange={(e)=>setQ(e.currentTarget.value)}
          />
          <select
            className="h-9 px-2 rounded border bg-card text-sm"
            value={roleFilter}
            onChange={(e)=>setRoleFilter(e.currentTarget.value as any)}
            title="Filter by role"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="assessor">Assessor</option>
            <option value="qa">QA</option>
            <option value="viewer">Viewer/Guest</option>
          </select>
          <button
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border ${canManage ? 'bg-primary text-primary-foreground hover:brightness-110' : 'text-muted-foreground cursor-not-allowed opacity-60'}`}
            onClick={() => { if (canManage) { setEditUser(null); setModalOpen(true); } }}
            title={canManage ? 'Add user' : 'Insufficient role (admin/manager only)'}
            aria-label="Add user"
            disabled={!canManage}
          >
            + Add user
          </button>
        </div>
      </div>
      {loading ? (
        <div className="p-6 text-muted-foreground">Loading users...</div>
      ) : error ? (
        <div className="p-6 text-destructive">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[hsl(var(--foreground)/0.04)]">
              <tr className="text-left text-muted-foreground">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? 'border-t' : 'border-t bg-[hsl(var(--foreground)/0.03)]'}>
                  <td className="py-3 px-4 text-card-foreground font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-4"><RoleBadge role={String(u.role||'viewer')} /></td>
                  <td className="py-3 px-4"><StatusPill active={u.active} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button className={`px-2 py-1 text-xs rounded border hover:bg-[hsl(var(--foreground)/0.06)] ${canActivate ? '' : 'opacity-50 cursor-not-allowed'}`}
                        onClick={() => { if (canManage) { setEditUser(u); setModalOpen(true); } }} title="Edit user" aria-label="Edit user" disabled={!canManage}>Edit</button>
                      <button className={`px-2 py-1 text-xs rounded border hover:bg-[hsl(var(--foreground)/0.06)] ${canActivate ? '' : 'opacity-50 cursor-not-allowed'}`}
                        onClick={() => { if (canActivate) toggleActive(u); }} title={u.active ? 'Deactivate user' : 'Activate user'} aria-label={u.active ? 'Deactivate user' : 'Activate user'} disabled={!canActivate}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                      {canActivate && (<button className="px-2 py-1 text-xs rounded border hover:bg-[hsl(var(--foreground)/0.06)]" onClick={() => deleteUser(u)} title="Delete user" aria-label="Delete user">Delete</button>)}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="p-6 text-muted-foreground" colSpan={5}>No users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={onSaved} editUser={editUser} />
    </div>
  );
};

export default UsersTable;
