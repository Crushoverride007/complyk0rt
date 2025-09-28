"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Action = {
  id: string;
  title: string;
  hint?: string; // small kbd hint text
  icon?: React.ReactNode;
  onRun: () => void;
};

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
  };

  const icon = {
    home: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>),
    board: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>),
    file: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>),
    library: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 21V7m8 14V7M3 21h18"/></svg>),
    theme: (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.41-1.41M7.05 7.05L5.64 5.64m12.02 0l-1.41 1.41M7.05 16.95l-1.41 1.41"/></svg>),
    search: (<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 103.89 9.39l3.11 3.1a1 1 0 001.42-1.42l-3.1-3.11A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd"/></svg>)
  } as const;

  const actions: Action[] = useMemo(() => [
    { id: 'go-home', title: 'Go to Dashboard', hint: 'G D', icon: icon.home, onRun: () => router.push('/') },
    { id: 'go-assessments', title: 'Go to Assessments', hint: 'G A', icon: icon.board, onRun: () => router.push('/assessments') },
    { id: 'go-calendar', title: 'Go to Calendar', hint: 'G C', icon: icon.board, onRun: () => router.push('/calendar') },
    { id: 'go-files', title: 'Go to Files', hint: 'G F', icon: icon.file, onRun: () => router.push('/files') },
    { id: 'go-frameworks', title: 'Go to Frameworks', hint: 'G R', icon: icon.library, onRun: () => router.push('/frameworks') },
    { id: 'toggle-theme', title: 'Toggle Theme (Dark/Light)', hint: 'T', icon: icon.theme, onRun: toggleTheme },
  ], [router]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return actions;
    return actions.filter(a => a.title.toLowerCase().includes(t) || (a.hint || '').toLowerCase().includes(t));
  }, [q, actions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen(v => !v);
      } else if (open) {
        if (e.key === 'Escape') {
          setOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setIdx(i => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          filtered[idx]?.onRun();
          setOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, idx]);

  // Global two-key sequences when palette is closed: g + d/a/c/f/r/u
  useEffect(() => {
    const state = { first: null as null | string, at: 0 };
    const onKey = (e: KeyboardEvent) => {
      if (open) return; // don't interfere when palette is open
      const key = (e.key || '').toLowerCase();
      const now = Date.now();
      if (state.first && now - state.at > 900) { state.first = null; }
      if (!state.first) {
        if (key === 'g') { state.first = 'g'; state.at = now; }
        return;
      }
      if (state.first === 'g') {
        if (key === 'd') { e.preventDefault(); router.push('/'); }
        else if (key === 'a') { e.preventDefault(); router.push('/assessments'); }
        else if (key === 'c') { e.preventDefault(); router.push('/calendar'); }
        else if (key === 'f') { e.preventDefault(); router.push('/files'); }
        else if (key === 'r') { e.preventDefault(); router.push('/frameworks'); }
        else if (key === 'u') { e.preventDefault(); router.push('/users'); }
        state.first = null;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, router]);


  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ('');
      setIdx(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/80 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 backdrop-blur divide-y divide-black/5 dark:divide-white/5 text-foreground">
        {/* Search bar */}
        <div className="relative px-4 py-3">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground">{icon.search}</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            placeholder="Search actions… (Ctrl/Cmd+K)"
            className="h-11 w-full rounded-md bg-transparent pl-10 pr-4 text-sm outline-none placeholder-muted-foreground"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto py-2">
          <div className="px-4 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground">Recent searches</div>
          <ul className="space-y-1">
            {filtered.length === 0 && (
              <li className="px-4 py-2 text-sm text-muted-foreground">No results</li>
            )}
            {filtered.map((a, i) => (
              <li key={a.id}>
                <button
                  onClick={() => { a.onRun(); setOpen(false); }}
                  className={`group w-full text-left px-4 py-2 text-sm flex items-center justify-between rounded-md ${i === idx ? 'bg-indigo-500/15 dark:bg-indigo-400/15 ring-1 ring-indigo-500/20 dark:ring-indigo-400/20 text-foreground' : 'hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 text-muted-foreground hover:text-foreground'}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-muted/60 ring-1 ring-inset ring-border text-foreground">{a.icon}</span>
                    <span className="truncate">{a.title}</span>
                  </span>
                  {a.hint && <span className="kbd">{a.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
