"use client";

import React from 'react';
import { api } from '../../services/api';

type Collaborator = { userId: string; role: 'viewer'|'editor' };
type MiniUser = { id: string; email: string; name?: string };

export default function CollaboratorsPanel({ assessmentId }: { assessmentId: string }){
  const [items, setItems] = React.useState<Collaborator[]>([]);
  const [loading, setLoading] = React.useState(true);
  // Invite-by-email flow
  const [email, setEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'viewer'|'editor'>('editor');
  // Add-from-organization flow
  const [orgMembers, setOrgMembers] = React.useState<MiniUser[]>([]);
  const [selectedOrgUserId, setSelectedOrgUserId] = React.useState('');
  const [orgRole, setOrgRole] = React.useState<'viewer'|'editor'>('editor');
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://95.217.190.154:3001';
  const [userIndex, setUserIndex] = React.useState<Record<string, MiniUser>>({});

  async function refresh(){
    try {
      setLoading(true);
      const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
      const r = await fetch(`${base}/assessments/${assessmentId}/collaborators`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
      const j = await r.json();
      if (r.ok && j.success) setItems(j.collaborators || []);
      try {
        const users = await api.getUsers();
        if (users.success && users.data) {
          const idx: Record<string, MiniUser> = {};
          users.data.forEach(u => { idx[u.id] = { id: u.id, email: (u.email||''), name: u.name }; });
          setUserIndex(idx);
        }
      } catch {}
    } finally { setLoading(false); }
  }

  React.useEffect(()=>{ refresh(); }, [assessmentId]);

  // Load organization members for the dropdown (clear, explicit source of truth)
  React.useEffect(() => {
    (async () => {
      try {
        const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
        const me = await fetch(`${base}/api/me/roles`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
        const mj = await me.json();
        const oid = (mj.rolesByOrg && mj.rolesByOrg[0] && mj.rolesByOrg[0].orgId) || null;
        if (oid) {
          const mem = await fetch(`${base}/api/orgs/${oid}/members`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
          const mj2 = await mem.json();
          if (mem.ok && mj2.success) {
            const list = (mj2.members || []).map((m:any)=>({ id: m.user?.id || m.userId, email: (m.user?.email||''), name: m.user?.name }));
            setOrgMembers(list);
          }
        }
      } catch {}
    })();
  }, [base]);

  async function addFromOrg(){
    if (!selectedOrgUserId) return;
    const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
    const r = await fetch(`${base}/assessments/${assessmentId}/collaborators`, { method:'POST', headers: t ? { 'Content-Type':'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type':'application/json' }, body: JSON.stringify({ userId: selectedOrgUserId, role: orgRole }) });
    const j = await r.json();
    if (!r.ok || !j.success) { alert(j.message || 'Failed to add collaborator'); return; }
    setSelectedOrgUserId(''); setOrgRole('editor');
    refresh();
  }

  async function inviteAndAdd(){
    if (!email) return;
    // Find or invite user by email
    const usersRes = await api.getUsers();
    let found = usersRes.success ? (usersRes.data || []).find(u => (u.email||'').toLowerCase() === email.toLowerCase()) : null;
    if (!found) {
      const t = (typeof window!== 'undefined') ? localStorage.getItem('auth_token') : null;
      const inv = await fetch(`${base}/api/users/invite`, { method:'POST', headers: t ? { 'Content-Type':'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type':'application/json' }, body: JSON.stringify({ email, role: 'consultant' }) });
      const j = await inv.json();
      if (!inv.ok || !j.success) { alert(j.message || 'Failed to invite'); return; }
      found = j.data?.user || null;
    }
    if (!found) { alert('User not found'); return; }
    const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
    const r = await fetch(`${base}/assessments/${assessmentId}/collaborators`, { method:'POST', headers: t ? { 'Content-Type':'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type':'application/json' }, body: JSON.stringify({ userId: found.id, role: inviteRole }) });
    const j = await r.json();
    if (!r.ok || !j.success) { alert(j.message || 'Failed to add collaborator'); return; }
    setEmail(''); setInviteRole('editor');
    refresh();
  }

  async function remove(userId: string){
    const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
    const r = await fetch(`${base}/assessments/${assessmentId}/collaborators/${userId}`, { method:'DELETE', headers: t ? { Authorization: `Bearer ${t}` } : {} });
    const j = await r.json();
    if (!r.ok || !j.success) { alert(j.message || 'Failed to remove'); return; }
    refresh();
  }

  async function updateRole(userId: string, role: 'viewer'|'editor'){
    const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
    const r = await fetch(`${base}/assessments/${assessmentId}/collaborators`, { method:'POST', headers: t ? { 'Content-Type':'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type':'application/json' }, body: JSON.stringify({ userId, role }) });
    const j = await r.json();
    if (!r.ok || !j.success) { alert(j.message || 'Failed to update role'); return; }
    refresh();
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-2">Collaborators</h2>
      <p className="text-sm text-muted-foreground mb-4">Add people to collaborate on this assessment. Admins always have edit rights.</p>
      {/* Add from organization */}
      <div className="mb-3">
        <label className="block text-xs text-muted-foreground mb-1">Add from organization</label>
        <div className="flex gap-2">
          <select
            aria-label="Select an organization member to add as collaborator"
            title="Select an organization member to add as collaborator"
            value={selectedOrgUserId}
            onChange={(e)=> setSelectedOrgUserId(e.currentTarget.value)}
            className="flex-1 px-3 py-2 rounded bg-card border"
          >
            <option value="">Select member…</option>
            {orgMembers.map(u => (
              <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
            ))}
          </select>
          <select
            aria-label="Select access level"
            title="Select access level"
            value={orgRole}
            onChange={(e)=>setOrgRole(e.currentTarget.value as any)}
            className="px-3 py-2 rounded bg-card border"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            onClick={addFromOrg}
            disabled={!selectedOrgUserId}
            aria-label="Add collaborator"
            title="Add collaborator"
            className="px-3 py-2 rounded bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border disabled:opacity-50"
          >
            Add collaborator
          </button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Select an existing org member to add as a collaborator. Viewer: read-only. Editor: can edit answers and comments.</div>
      </div>

      {/* Invite by email */}
      <div className="mb-6">
        <label className="block text-xs text-muted-foreground mb-1">Invite by email</label>
        <div className="flex gap-2">
          <input type="email" value={email} onChange={(e)=>setEmail(e.currentTarget.value)} placeholder="name@example.com" className="flex-1 px-3 py-2 rounded bg-card border" />
          <select
            aria-label="Select access level for invitee"
            title="Select access level for invitee"
            value={inviteRole}
            onChange={(e)=>setInviteRole(e.currentTarget.value as any)}
            className="px-3 py-2 rounded bg-card border"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            onClick={inviteAndAdd}
            disabled={!email}
            aria-label="Invite and add collaborator"
            title="Invite and add collaborator"
            className="px-3 py-2 rounded bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border disabled:opacity-50"
          >
            Invite and add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading collaborators…</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-left">
              <th className="py-2">Collaborator</th>
              <th className="py-2">Access level</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} className="py-4 text-muted-foreground">No collaborators yet.</td></tr>
            ) : items.map(c => (
              <tr key={userIndex[c.userId]?.email || c.userId} className="border-t">
                <td className="py-2">
                  <div className="flex flex-col">
                    <span className="text-card-foreground">{userIndex[c.userId]?.name || userIndex[c.userId]?.email || c.userId}</span>
                    <span className="text-xs text-muted-foreground">{userIndex[c.userId]?.email && userIndex[c.userId]?.email !== userIndex[c.userId]?.name ? userIndex[c.userId]?.email : ''}</span>
                  </div>
                </td>
                <td className="py-2">
                  <select
                    aria-label={`Change access level for ${userIndex[c.userId]?.email || c.userId}`}
                    title="Change access level"
                    value={c.role}
                    onChange={(e)=> updateRole(c.userId, e.currentTarget.value as 'viewer'|'editor')}
                    className="px-2 py-1 rounded bg-card border"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={()=>remove(c.userId)}
                    className="px-2 py-1 rounded border hover:bg-[hsl(var(--foreground)/0.06)]"
                    aria-label="Remove collaborator"
                    title="Remove collaborator"
                  >
                    Remove collaborator
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
