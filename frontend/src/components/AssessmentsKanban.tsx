"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AssessmentSummary } from '../services/assessments';
import { getAssessmentMeta, type AssessmentMeta, updateAssessment } from '../services/assessments';

const sample = {
  columns: [
    { key: 'backlog', title: 'Backlog' },
    { key: 'inprogress', title: 'In progress' },
    { key: 'review', title: 'In review' },
    { key: 'finished', title: 'Finished' },
  ],
};

function Badge({ text, tone }: { text: string; tone?: 'danger' | 'finished' | 'backlog' | 'review' }) {
  const map = {
    danger: 'tone-danger',
    finished: 'tone-finished',
    review: 'tone-review',
    backlog: 'tone-backlog',
  } as const;
  const cls = map[tone || 'backlog'];
  return <span className={`badge ${cls}`}>{text}</span>;
}

function Indicator({ icon, count, title }: { icon: React.ReactNode; count: number; title: string }){
  if (!count) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground" title={title}>
      {icon}
      <span>{count}</span>
    </div>
  );
}

function Avatar({ name }: { name: string }){
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className="h-6 w-6 -ml-2 first:ml-0 rounded-full border bg-secondary text-foreground flex items-center justify-center text-xs font-semibold">
      {initial}
    </div>
  );
}

function Card({ c, meta }: { c: any; meta?: AssessmentMeta }) {
  return (
    <Link href={`/assessments/${c.id}`} className="block bg-card border rounded-lg p-6 hover:brightness-110 transition-colors relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {c.badges?.slice(0, 2).map((b: string, i: number) => (
            <Badge key={i} text={b} tone={b === 'Urgent' ? 'danger' : b === 'Complete' ? 'finished' : 'backlog'} />
          ))}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{c.title}</div>
      <div className="text-sm font-semibold text-card-foreground mt-1">{c.title}</div>
      {/* Framework + date + indicators */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
            {c.framework || '—'}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            {c.dueIn || '—'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Indicator
            title="Attachments"
            count={meta?.attachments || 0}
            icon={<svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48"/></svg>}
          />
          <Indicator
            title="Messages"
            count={meta?.messages || 0}
            icon={<svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>}
          />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="h-1.5 w-full rounded bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500" style={{ width: `${meta?.progress || 0}%` }} />
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">{meta?.progress || 0}% complete</div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
        <div className="flex items-center -space-x-1">
          {(meta?.assignees || []).map((n, i) => (<Avatar key={i} name={n} />))}
        </div>
        <div className="italic">Due in: <span className="text-destructive/80">{c.dueIn}</span></div>
      </div>
    </Link>
  );
}

export default function AssessmentsKanban({ data, onToast }: { data?: AssessmentSummary[]; onToast?: (msg: string, type?: 'success' | 'error') => void }) {
  const cards = (data && data.length)
    ? data.map(a => ({ id: a.id, col: a.col, title: a.title, dueIn: a.dueIn, framework: (a as any).framework, badges: [a.col === 'finished' ? 'Complete' : 'Assessment'] }))
    : [];

  const [meta, setMeta] = useState<Record<string, AssessmentMeta>>({});
  useEffect(() => {
    let alive = true;
    (async () => {
      const ids = cards.map(c => c.id);
      const results = await Promise.all(ids.map(async id => ({ id, meta: await getAssessmentMeta(id) })));
      if (!alive) return;
      const map: Record<string, AssessmentMeta> = {};
      results.forEach(r => { map[r.id] = r.meta; });
      setMeta(map);
    })();
    return () => { alive = false; };
  }, [data?.length]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sample.columns.map(col => (
          <div key={col.key}
               onDragOver={(e) => e.preventDefault()}
               onDrop={async (e) => {
                 const id = e.dataTransfer.getData('text/id');
                 if (id) {
                   try {
                     await updateAssessment(id, { col: col.key as any });
                     onToast?.('Moved', 'success');
                   } catch (err: any) {
                     onToast?.(err?.message || 'Failed to move', 'error');
                   }
                 }
               }}
          >
            <h3 className="text-xl font-semibold text-card-foreground mb-3">{col.title}</h3>
            <div className="space-y-4">
              {cards.filter(c => c.col === col.key).map(c => (
                <div key={c.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/id', c.id); }}>
                  <Card c={c} meta={meta[c.id]} />
                </div>
              ))}
              {cards.filter(c => c.col === col.key).length === 0 && (
                <div className="text-muted-foreground text-sm">No items</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
