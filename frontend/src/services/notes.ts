"use client";

function getAuthHeaders(init?: Record<string,string>) {
  if (typeof window === 'undefined') return init || {};
  try { const t = localStorage.getItem('auth_token'); return t ? { ...(init||{}), Authorization: `Bearer ${t}` } : (init||{}); } catch { return init||{} }
}

const BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://95.217.190.154:3001';

export interface CalendarNote {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  createdAt: string;
  authorName?: string;
  authorEmail?: string;
  authorId?: string;
}

async function safeFetch(url: string, init: RequestInit) {
  try { await fetch(url, init); } catch { /* swallow */ }
}

export async function syncNoteAdd(note: CalendarNote) {
  await safeFetch(`${BASE}/calendar/notes`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(note)
  });
}

export async function syncNoteUpdate(note: CalendarNote) {
  await safeFetch(`${BASE}/calendar/notes/${encodeURIComponent(note.id)}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(note)
  });
}

export async function syncNoteDelete(id: string) {
  await safeFetch(`${BASE}/calendar/notes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}
