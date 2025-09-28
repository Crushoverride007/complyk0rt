"use client";

import * as React from 'react';
import type { FrameworkPart } from '../../services/assessments';
import { getAssessmentStructure, getAssessmentAnswers } from '../../services/assessments';

type Status = 'success' | 'warning' | 'danger';

export default function LeftTree({ assessmentId, activeSub, onSelect, refreshKey }: { assessmentId?: string; activeSub?: string; onSelect?: (id: string)=>void; refreshKey?: number }) {
  // status coloring for demo dots
  const statusForIndex = (n: number): Status => (n % 3 === 0 ? 'success' : n % 3 === 1 ? 'warning' : 'danger');
  const dotClass = (s: Status) => (s === 'success' ? 'dot-success' : s === 'warning' ? 'dot-warning' : 'dot-danger');

  const [parts, setParts] = React.useState<FrameworkPart[] | null>(null);
  const [internalActive, setInternalActive] = React.useState<string>('');
  const active = activeSub ?? internalActive;
  const [err, setErr] = React.useState<string | null>(null);
  const [answersMap, setAnswersMap] = React.useState<Record<string, any>>({});

  // Determine if a subsection has meaningful (non-empty) answers
  const hasAnswer = React.useCallback((key: string): boolean => {
    const v = (answersMap as any)[key];
    if (!v) return false;
    if (typeof v !== 'object' || Array.isArray(v)) return !!v; // primitive truthy
    // object: check any non-empty value
    return Object.values(v).some((val: any) => {
      if (val == null) return false;
      if (typeof val === 'string') return val.trim().length > 0;
      if (typeof val === 'boolean') return val; // true means filled
      if (typeof val === 'number') return !Number.isNaN(val);
      if (Array.isArray(val)) return val.length > 0;
      // any other object considered filled
      return true;
    });
  }, [answersMap]);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setErr(null);
        if (!assessmentId) return;
        const [s, a] = await Promise.all([
          getAssessmentStructure(assessmentId),
          getAssessmentAnswers(assessmentId).catch(()=>({}))
        ]);
        if (!mounted) return;
        setParts(s.parts);
        setAnswersMap(a as any);
        const first = s.parts[0]?.sections[0]?.items[0];
        if (first && !active) { onSelect ? onSelect(first.id || '1-1') : setInternalActive(first.id || '1-1'); }
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load structure');
      }
    }
    load();
    return () => { mounted = false; };
  }, [assessmentId, refreshKey]);

  // Listen for saves and refresh answers to update dots
  React.useEffect(() => {
    if (!assessmentId || typeof window === 'undefined') return;
    const handler = (e: any) => {
      const d = e?.detail || {};
      if (d.assessmentId !== assessmentId) return;
      getAssessmentAnswers(assessmentId).then((a)=> setAnswersMap(a as any)).catch(()=>{});
    };
    window.addEventListener('answers-saved', handler as any);
    return () => window.removeEventListener('answers-saved', handler as any);
  }, [assessmentId]);

  if (err) {
    return <div className="text-sm text-destructive">{err}</div>;
  }
  if (!parts) {
    return <div className="h-[calc(100vh-56px-48px-48px)] overflow-auto pr-1 sm:pr-2 text-sm text-muted-foreground">Loading sections…</div>;
  }

  return (
    <div className="h-[calc(100vh-56px-48px-48px)] overflow-auto pr-1 sm:pr-2">
      {parts.map((part, partIdx) => (
        <div key={partIdx} className={partIdx > 0 ? 'mt-8' : ''}>
          <div className="sticky top-0 z-10 -mx-2 mb-3 px-2 py-2 bg-card/90 supports-[backdrop-filter]:bg-card/60 backdrop-blur border-b border-[hsl(var(--foreground)/0.08)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground border-l-2 border-[hsl(var(--primary))] pl-2">{part.title}</div>
          </div>

          {part.sections.map((sec, sIdx) => {
            const secNumber = sec.number; // already provided by backend
            return (
              <div key={`${partIdx}-${sIdx}`} className="mb-6">
                <div className="text-[13px] font-medium tracking-[-0.01em] text-foreground mb-2">
                  {secNumber}. {sec.heading}
                </div>

                {/* vertical guide only for subsection rows */}
                <div className="relative pl-4">
                  <div className="pointer-events-none absolute left-0 top-1 bottom-1 w-px bg-[hsl(var(--foreground)/0.12)]"></div>
                  <ul className="mt-1 space-y-1.5">
                    {sec.items.map((item, i) => {
                      const key = item.id || `${secNumber}-${i + 1}`;
                      const isActive = active === key;
                      const label = item.label;
                      const subNumber = item.number ?? `${secNumber}.${i + 1}`;
                      return (
                        <li
                          key={key}
                          onClick={() => (onSelect ? onSelect(key) : setInternalActive(key))}
                          className={[
                            'relative -mx-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                            'flex items-center gap-2 text-[13px] leading-[1.45]',
                            isActive
                              ? 'bg-[hsl(var(--foreground)/0.10)] text-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--foreground)/0.06)]',
                          ].join(' ')}
                        >
                          {isActive && (
                            <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-[hsl(var(--primary))]"></span>
                          )}
                          <span className={`dot ${hasAnswer(key) ? 'dot-success' : 'dot-warning'}`}></span>
                          <span>{label.startsWith('Appendix ') ? label : `${subNumber} ${label}`}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
