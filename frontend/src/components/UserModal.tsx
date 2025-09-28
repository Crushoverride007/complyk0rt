"use client";

import React, { useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (user: User) => void;
  editUser?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSaved, editUser = null }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('viewer');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editUser) {
      setEmail(editUser.email);
      setName(editUser.name);
      setRole(editUser.role);
    } else {
      setEmail('');
      setName('');
      setRole('viewer');
    }
    setError(null);
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editUser) {
        const res = await api.updateUser(editUser.id, { name, role });
        if (!res.success || !res.data) throw new Error(res.message || 'Failed to update');
        onSaved(res.data);
      } else {
        const res = await api.createUser({ email, name, role });
        if (!res.success || !res.data) throw new Error(res.message || 'Failed to create');
        onSaved(res.data);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card border border rounded-xl w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-4">{editUser ? 'Edit User' : 'Add User'}</h3>
        {error && <div className="mb-3 text-sm text-destructive">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editUser && (
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded bg-card border border-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Name</label>
            <input
              className="w-full px-3 py-2 rounded bg-card border border-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Role</label>
            <select
              className="w-full px-3 py-2 rounded bg-card border border-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="qa">QA</option>
              <option value="assessor">Assessor</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer/Guest</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 text-muted-foreground hover:text-card-foreground" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-card-foreground rounded disabled:opacity-50" disabled={saving}>
              {saving ? 'Saving...' : editUser ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
