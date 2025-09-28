"use client";
import * as React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssessments, AssessmentSummary } from '../../services/assessments';
import { syncNoteAdd, syncNoteUpdate, syncNoteDelete } from '../../services/notes';
import Avatar from '../../components/Avatar';

function parseDueDate(dueIn?: string | null): Date | null {
  if (!dueIn) return null;
  const parsed = Date.parse(dueIn);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  const m = dueIn.match(/(\d+)\s*(d|day|days|w|week|weeks|m|month|months|y|year|years)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = (m[2] as string).toLowerCase();
    const now = new Date();
    const d = new Date(now);
    if (unit.startsWith('d')) d.setDate(now.getDate() + n);
    else if (unit.startsWith('w')) d.setDate(now.getDate() + n * 7);
    else if (unit === 'm' || unit.startsWith('month')) d.setMonth(now.getMonth() + n);
    else if (unit === 'y' || unit.startsWith('year')) d.setFullYear(now.getFullYear() + n);
    return d;
  }
  return null;
}

export default function CalendarPage(){
  const { user } = useAuth();
  const [assessments, setAssessments] = React.useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await getAssessments();
        if (!alive) return;
        setAssessments(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false };
  }, []);

  const mine = React.useMemo(() => {
    if (!user) return [] as AssessmentSummary[];
    const nm = user.name?.toLowerCase() || '';
    const em = user.email?.toLowerCase() || '';
    return (assessments || []).filter(a => {
      const to = (a.assignedTo || '').toLowerCase();
      return to && (to.includes(nm) || to.includes(em));
    });
  }, [assessments, user]);

  const items = React.useMemo(() => {
    const arr = (mine.length ? mine : assessments).map(a => ({
      a,
      due: parseDueDate(a.dueIn),
    }));
    arr.sort((x, y) => {
      if (!x.due && !y.due) return 0;
      if (!x.due) return 1;
      if (!y.due) return -1;
      return x.due.getTime() - y.due.getTime();
    });
    return arr;
  }, [assessments, mine]);

  const barClass = (col?: string) => {
    switch ((col || "").toLowerCase()) {
      case "finished": return "bg-emerald-500/70";
      case "review": return "bg-amber-500/70";
      case "inprogress": return "bg-blue-500/70";
      default: return "bg-muted-foreground/60";
    }
  };

  // Outline version (cleaner for long spans)
  const barOutlineClass = (col?: string) => {
    switch ((col || "").toLowerCase()) {
      case "finished": return "border-emerald-500/70";
      case "review": return "border-amber-500/70";
      case "inprogress": return "border-blue-500/70";
      default: return "border-muted-foreground/60";
    }
  };

  const chipClass = (col?: string) => {
    switch ((col || "").toLowerCase()) {
      case "finished": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "review": return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      case "inprogress": return "bg-blue-500/15 text-blue-600 border-blue-500/30";
      default: return "bg-gray-500/10 text-muted-foreground border-gray-500/30";
    }
  };


  // Month calendar
  const now = new Date();
  const [viewDate, setViewDate] = React.useState<Date>(() => new Date());
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const days = end.getDate();
  const startDow = start.getDay();

  const itemsMonth = React.useMemo(() => (
    items.filter(it => it.due && it.due.getFullYear() === y && it.due.getMonth() === m)
  ), [items, y, m]);

  // Build calendar cells including previous/next month days
  type Cell = { day: number; date: Date; outside: boolean };
  const cells: Cell[] = [];

  // Leading days from previous month
  if (startDow > 0) {
    const prevMonthLast = new Date(y, m, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const day = prevMonthLast - i;
      const date = new Date(y, m - 1, day);
      cells.push({ day, date, outside: true });
    }
  }

  // Current month days
  for (let d = 1; d <= days; d++) {
    cells.push({ day: d, date: new Date(y, m, d), outside: false });
  }

  // Trailing days from next month
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= trailing; d++) {
    cells.push({ day: d, date: new Date(y, m + 1, d), outside: true });
  }

  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const isToday = (c: Cell) => (
    c.date.getFullYear() === now.getFullYear() &&
    c.date.getMonth() === now.getMonth() &&
    c.date.getDate() === now.getDate()
  );
  const dow = ['S','M','T','W','T','F','S'];

  const dueDays = new Set<number>();
  const dayToAnchor: Record<number, string> = {};
  const dayTitles: Record<number, string[]> = {};
  for (const it of itemsMonth) {
    const d = it.due!.getDate();
    dueDays.add(d);
    if (!dayToAnchor[d]) dayToAnchor[d] = `timeline-item-${it.a.id}`;
    (dayTitles[d] ||= []).push(it.a.title);
}


  // Project ranges: show a 7-day bar ending on due date (clamped to view)
  type ProjectRange = { id:string; title:string; col?:string; start: Date; end: Date };
  const viewStart = weeks[0][0].date;
  const viewEnd = weeks[weeks.length-1][6].date;
  const projectRanges: ProjectRange[] = React.useMemo(() => {
    const out: ProjectRange[] = [];
    for (const it of items) {
      if (!it.due) continue;
      const end = new Date(it.due);
      // Prefer explicit project startDate; else use backend-created; fallback to 7 days before due
      let start = new Date(end);
      const rawStart = (it.a as any).startDate || (it.a as any).created || null;
      if (rawStart) {
        const ts = Date.parse(rawStart as any);
        if (!Number.isNaN(ts)) start = new Date(ts); else start.setDate(start.getDate()-7);
      } else { start.setDate(start.getDate()-7); }
      // include if intersects view
      if (start <= viewEnd && end >= viewStart) {
        out.push({ id: it.a.id, title: it.a.title, col: it.a.col as any, start, end });
      }
    }

    return out;
  }, [items, viewStart.getTime(), viewEnd.getTime()]);

  const projectsForDay = (d: Date): ProjectRange[] => {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return projectRanges.filter(p => t >= new Date(p.start.getFullYear(), p.start.getMonth(), p.start.getDate()).getTime() && t <= new Date(p.end.getFullYear(), p.end.getMonth(), p.end.getDate()).getTime());
  };

  // --- Notes (local, per-day) ---
  type Note = { id: string; text: string; createdAt: string; authorName?: string; authorEmail?: string; authorId?: string };
  const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const initials = (name?: string) => {
  const n = (name || '?').trim().split(/\s+/).filter(Boolean);
  return (n[0]?.[0] || '') + (n[1]?.[0] || '');
};
  const [notesByDate, setNotesByDate] = React.useState<Record<string, Note[]>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('calendar_notes') || '{}'); } catch { return {}; }
  });
  React.useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('calendar_notes', JSON.stringify(notesByDate));
  }, [notesByDate]);

  const [noteOpen, setNoteOpen] = React.useState<{ open: boolean; date: Date | null }>({ open:false, date:null });
  const [noteText, setNoteText] = React.useState('');
  const openNoteFor = (d: Date) => { setNoteText(''); setNoteOpen({ open:true, date: d }); };
  const closeNote = () => setNoteOpen({ open:false, date:null });
  const addNote = () => {
    if (!noteOpen.date) return;
    const key = dateKey(noteOpen.date);
    const text = noteText.trim();
    if (!text) { closeNote(); return; }
    const n: Note = { id: `${Date.now()}`, text, createdAt: new Date().toISOString(), authorName: (user?.name || user?.email || 'You'), authorEmail: user?.email || undefined, authorId: (user as any)?.id };
    setNotesByDate(prev => ({ ...prev, [key]: [ ...(prev[key]||[]), n ] }));
    try { syncNoteAdd({ id: n.id, date: key, text: n.text, createdAt: n.createdAt, authorName: n.authorName, authorEmail: n.authorEmail, authorId: n.authorId }); } catch {}
    setNoteText('');
    closeNote();
  };

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState('');
  const startEdit = (d: Date, note: Note) => { setEditingId(note.id); setEditText(note.text); setNoteOpen({ open: true, date: d }); };
  const saveEdit = (d: Date) => {
    if (!editingId) return;
    const key = dateKey(d);
    setNotesByDate(prev => ({
      ...prev,
      [key]: (prev[key]||[]).map(n => n.id === editingId ? { ...n, text: editText } : n)
    }));
    setEditingId(null); setEditText('');
    try { syncNoteUpdate({ id: editingId!, date: key, text: editText, createdAt: new Date().toISOString(), authorName: user?.name || user?.email || undefined, authorEmail: user?.email || undefined, authorId: (user as any)?.id }); } catch {}
  };
  const deleteNote = (d: Date, id: string) => {
    const key = dateKey(d);
    setNotesByDate(prev => {
      const next = { ...prev };
      next[key] = (next[key]||[]).filter(n => n.id !== id);
      if (!next[key].length) delete next[key];
      return next;
    });
    try { syncNoteDelete(id); } catch {}
  };


  const monthNotes = React.useMemo(() => {
    const out: Array<{ key: string; date: Date; notes: Note[] }> = [];
    for (const [k, list] of Object.entries(notesByDate)) {
      const yk = Number(k.slice(0,4));
      const mk = Number(k.slice(5,7)) - 1;
      const dk = Number(k.slice(8,10));
      const d = new Date(yk, mk, dk);
      if (yk === y && mk === m) out.push({ key: k, date: d, notes: list as Note[] });
    }
    out.sort((a,b) => a.date.getTime() - b.date.getTime());
    return out;
  }, [notesByDate, y, m]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-8">
          <section className="flex-1 bg-card border rounded">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-lg font-semibold text-card-foreground">Calendar</h1>
              <div className="flex items-center gap-2">
                <button aria-label="Previous month" className="btn-ghost btn-xs border border-transparent" onClick={() => setViewDate(new Date(y, m - 1, 1))}>{"<"}</button>
                <div className="text-sm text-muted-foreground min-w-[120px] text-center">{new Date(y, m).toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
                <button aria-label="Next month" className="btn-ghost btn-xs border border-transparent" onClick={() => setViewDate(new Date(y, m + 1, 1))}>{">"}</button>
                <button className="btn-outline btn-xs ml-2" onClick={() => setViewDate(new Date())}>Today</button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 text-xs text-muted-foreground mb-1">
                {dow.map((d, i) => (<div key={`${d}-${i}`} className="text-center py-1">{d}</div>))}
              </div>
              <div className="grid grid-rows-6 gap-1">
                {weeks.map((w, wi) => (
                  <div key={wi} className="relative">
                    <div className="grid grid-cols-7 gap-1">
                    {w.map((c, di) => (
                      <button
                        key={di}
                        type="button"
                        onClick={() => openNoteFor(c.date)}
                        className={[
                          ((notesByDate[dateKey(c.date)]||[]).length>0 ? 'relative h-24 rounded border p-1 text-left transition-colors' : 'relative h-16 rounded border p-1 text-left transition-colors'),
                          c.outside ? 'bg-muted/40' : 'bg-accent/10',
                          c.outside ? 'text-muted-foreground/60' : 'text-card-foreground',
                          isToday(c) ? 'border-primary' : 'border-border',
                          'hover:bg-accent/20'
                        ].join(' ')}
                        title={c.outside ? c.date.toDateString() : ''}
                      >
                        <div className={[
                          'text-[13px] font-semibold',
                          c.outside ? 'text-muted-foreground/60' : 'text-muted-foreground'
                        ].join(' ')}>
                          {c.day}
                        </div>
                        {(() => {
                          const ps = projectsForDay(c.date);
                          if (!ps.length) return null;
                          return (
                            <>
                              <div className="pointer-events-none absolute inset-0 rounded ring-2 ring-emerald-500/60"></div>
                              {ps.length > 1 && (
                                <span
                                  className="absolute top-1 right-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-foreground/20 text-[10px] text-foreground"
                                  title={ps.map(p => p.title).join(' • ')}
                                >
                                  {ps.length}
                                </span>
                              )}
                            </>
                          );
                        })()}

                        {(() => {
                          const list = (notesByDate[dateKey(c.date)]||[]);
                          const cnt = list.length;
                          if (!cnt) return null;
                          const last = list[cnt-1];
                          return (
                            <>
                              <span className="absolute bottom-1 right-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary/80 text-[10px] text-white">{cnt}</span>
                              <Avatar name={last.authorName || ""} size="xs" className="absolute bottom-1 left-1" />
                              <div className="absolute left-5 right-5 bottom-1 text-[10px] text-muted-foreground/80 clamp-2 leading-snug">{last.text}</div>
                            </>
                          );
                        })()}
                      </button>
                    ))}
                  </div>
                    {(() => {
                      // Thin bars across the week to visualize project ranges
                      const weekStart = new Date(w[0].date.getFullYear(), w[0].date.getMonth(), w[0].date.getDate());
                      const weekEnd = new Date(w[6].date.getFullYear(), w[6].date.getMonth(), w[6].date.getDate());
                      const dayMs = 86400000;
                      const clampDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
                      type Seg = { id:string; title:string; col?:string; startCol:number; span:number; row:number };
                      const candidates = projectRanges.map(p => {
                        const s = clampDate(new Date(Math.max(clampDate(p.start).getTime(), weekStart.getTime())));
                        const e = clampDate(new Date(Math.min(clampDate(p.end).getTime(),   weekEnd.getTime())));
                        if (e.getTime() < s.getTime()) return null;
                        const startCol = Math.max(0, Math.min(6, Math.floor((s.getTime() - weekStart.getTime())/dayMs)));
                        const span = Math.max(1, Math.min(7-startCol, Math.floor((e.getTime()-s.getTime())/dayMs)+1));
                        return { id:p.id, title:p.title, col:p.col, startCol, span } as any;
                      }).filter(Boolean) as Array<{ id:string; title:string; col?:string; startCol:number; span:number }>;
                      candidates.sort((a,b)=> a.startCol - b.startCol || a.span - b.span);
                      const taken = [Array(7).fill(false), Array(7).fill(false)];
                      const segs: Seg[] = [];
                      for (const c of candidates) {
                        let placed = false;
                        for (let row=0; row<taken.length && !placed; row++) {
                          let ok = true;
                          for (let i=0;i<c.span;i++) { if (taken[row][c.startCol+i]) { ok = false; break; } }
                          if (ok) {
                            for (let i=0;i<c.span;i++) taken[row][c.startCol+i] = true;
                            segs.push({ ...c, row });
                            placed = true;
                          }
                        }
                      }
                      if (!segs.length) return null;
                      return (
                        <div className="absolute inset-x-0 bottom-1 top-7 px-0.5 pointer-events-none">
                          <div className="grid grid-cols-7 gap-1" style={{ gridTemplateRows: 'repeat(2, 0.25rem)' }}>
                            {segs.map((s, i) => (
                              <div key={s.id + '-' + i}
                                   title={s.title}
                                   className={[ 'rounded-full opacity-80', barClass(s.col) ].join(' ')}
                                   style={{ gridColumn: `${s.startCol+1} / span ${s.span}`, gridRow: `${s.row+1}` }} />
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]"></span>
                <span>Due date</span>
              </div>
              {noteOpen.open && noteOpen.date && (
                <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
                  <div className="bg-card border rounded-xl w-full max-w-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-card-foreground">Add note • {noteOpen.date.toLocaleDateString()}</h3>
                      <button onClick={closeNote} className="text-muted-foreground hover:text-card-foreground text-xl">×</button>
                    </div>
                    <div className="space-y-3">
                      {!!(notesByDate[dateKey(noteOpen.date)]||[]).length && (
                        <div className="max-h-40 overflow-auto border rounded p-2 bg-background/40">
                          {(notesByDate[dateKey(noteOpen.date)]||[]).map(n => (
                            <div key={n.id} className="text-xs text-card-foreground border-b last:border-b-0 border-border py-1 flex items-start gap-2">
                              <Avatar name={n.authorName || ""} size="xs" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-muted-foreground">{n.authorName || 'Unknown'} • {new Date(n.createdAt).toLocaleString()}</span>
                                  <span className="flex gap-2">
                                    <button className="text-[11px] text-blue-400 hover:underline" onClick={() => startEdit(noteOpen.date!, n)}>Edit</button>
                                    <button className="text-[11px] text-destructive hover:underline" onClick={() => deleteNote(noteOpen.date!, n.id)}>Delete</button>
                                  </span>
                                </div>
                                {editingId === n.id ? (
                                  <div className="mt-1">
                                    <textarea value={editText} onChange={(e)=>setEditText(e.target.value)} rows={3} className="w-full px-2 py-1 rounded bg-card border text-card-foreground" />
                                    <div className="flex justify-end gap-2 mt-1">
                                      <button className="text-[11px] text-muted-foreground" onClick={() => { setEditingId(null); setEditText(''); }}>Cancel</button>
                                      <button className="text-[11px] text-primary hover:underline" onClick={() => saveEdit(noteOpen.date!)}>Save</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-1 whitespace-pre-wrap">{n.text}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <textarea value={noteText} onChange={(e)=>setNoteText(e.target.value)} rows={3} placeholder="Write a quick note for this day" className="w-full px-3 py-2 rounded bg-card border text-card-foreground" />
                      <div className="flex justify-end gap-2">
                        <button onClick={closeNote} className="px-3 py-1 text-sm text-muted-foreground hover:text-card-foreground">Cancel</button>
                        <button onClick={addNote} className="px-3 py-1 text-sm bg-primary text-white rounded">Save note</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="w-full lg:w-[420px] bg-card border rounded">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">{user ? 'My Project Timeline' : 'Project Timeline'}</h2>
              <div className="text-xs text-muted-foreground">{loading ? 'Loading…' : `${itemsMonth.length} projects`}</div>
            </div>
            <div className="p-4">
              {itemsMonth.length === 0 && (
                <div className="text-sm text-muted-foreground">No projects found.</div>
              )}
              <ol id="timeline" className="relative border-l border-[hsl(var(--foreground)/0.10)] pl-3 space-y-2.5">
                {itemsMonth.map(({ a, due }) => (
                  <li key={a.id} id={`timeline-item-${a.id}`} className="relative -mx-2 px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors">
                    <span className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-[hsl(var(--primary))] border border-primary/40"></span>
                    <div className="flex items-center justify-between">
                      <a href={`/assessments/${a.id}`} className="text-sm text-card-foreground hover:underline">{a.title}</a>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${chipClass(a.col as any)}`}>{a.col}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Due: {due ? due.toLocaleDateString() : (a.dueIn || '—')}</div>
                  </li>
                ))}
              </ol>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-card-foreground">Notes this month</h3>
                  <span className="text-xs text-muted-foreground">{monthNotes.reduce((a,b)=>a+b.notes.length,0)} notes</span>
                </div>
                {monthNotes.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No notes yet.</div>
                ) : (
                  <ul className="space-y-1 max-h-60 overflow-auto">
                    {monthNotes.map(({ key, date, notes }) => { const last = notes[notes.length-1]; return (
                      <li key={key} className="text-xs p-2 rounded border hover:bg-accent/40">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{date.toLocaleDateString()}</span>
                          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary/80 text-[10px] text-white">{notes.length}</span>
                        </div>
                        <div className="mt-1 text-card-foreground truncate">{last.text}</div>
                        <div className="text-[10px] text-muted-foreground">by {last.authorName || 'Unknown'}</div>
                      </li>
                    ); })}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
