
"use client";

import React, { useMemo, useRef, useState } from 'react';
import type { MessageItem, AttachmentItem, FrameworkStructure } from '../../services/assessments';

type MiniUser = { id: string; email: string; name?: string };

interface Props {
  items: MessageItem[];
  attachments?: AttachmentItem[];
  structure?: FrameworkStructure | null;
  currentSubId?: string;
  onSend: (text: string, opts?: { parentId?: string|null; sections?: string[]; attachments?: string[] }) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onJumpToSection?: (id: string) => void;
  onJumpToAttachment?: (id: string) => void;
}

type Option = { id: string; label: string };

function MultiTagSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  options: Option[];
  value: Option[];
  onChange: (next: Option[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const exclude = new Set(value.map(v => v.id));
    const list = options.filter(o => !exclude.has(o.id) && (!q || o.label.toLowerCase().includes(q)));
    return list.slice(0, 12);
  }, [options, query, value]);

  const add = (opt: Option) => {
    if (!value.find(v => v.id === opt.id)) onChange([...value, opt]);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };
  const remove = (id: string) => onChange(value.filter(v => v.id !== id));

  return (
    <div className="text-xs">
      <div className="mb-1 text-muted-foreground">{label}</div>
      <div
        className="min-h-10 w-full rounded border bg-card px-2 py-1 flex flex-wrap items-center gap-1"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {value.map(v => (
          <span key={v.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[hsl(var(--foreground)/0.08)] text-foreground">
            {v.label}
            <button className="text-muted-foreground hover:text-foreground" title="Remove" aria-label="Remove" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); remove(v.id); }}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e)=>{ setQuery(e.currentTarget.value); setOpen(true); }}
          onFocus={()=> setOpen(true)}
          onKeyDown={(e)=>{
            if (e.key === 'Backspace' && !query && value.length) {
              onChange(value.slice(0, -1));
            } else if (e.key === 'Enter' && filtered[0]) {
              e.preventDefault(); add(filtered[0]);
            }
          }}
          placeholder={placeholder || 'Type to search...'}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="mt-1 max-h-48 overflow-auto rounded border bg-card shadow-lg">
          {filtered.map(opt => (
            <button
              key={opt.id}
              onClick={()=> add(opt)}
              className="w-full text-left px-3 py-2 text-foreground hover:bg-[hsl(var(--foreground)/0.06)]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  let h = 0; for (let i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) % 360; }
  const bg = `hsl(${h}, 60%, 35%)`;
  const st: React.CSSProperties = { width: size, height: size, backgroundColor: bg, color: 'white' };
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-semibold shadow-sm" style={st} aria-hidden>
      {initial}
    </div>
  );
}

export default function MessagesPanel({ items, attachments = [], structure, currentSubId, onSend, onDelete, onJumpToSection, onJumpToAttachment }: Props){
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selSectionOpts, setSelSectionOpts] = useState<Option[]>([]);
  const [selAttachmentOpts, setSelAttachmentOpts] = useState<Option[]>([]);
  const [orgMembers, setOrgMembers] = useState<MiniUser[]>([]);
  const [collapsedById, setCollapsedById] = useState<Record<string, boolean>>({});
  const [replyOpenById, setReplyOpenById] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<Record<string, boolean>>({});

  const base = process.env.NEXT_PUBLIC_API_URL || 'http://95.217.190.154:3001';
  React.useEffect(()=>{
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
  }, []);

  const sectionOptions = useMemo<Option[]>(() => {
    const list: Option[] = [];
    if (!structure) return list;
    for (const part of structure.parts) {
      for (const sec of part.sections) {
        sec.items.forEach((it, idx) => {
          const id = it.id || `${sec.number}.${idx + 1}`;
          const label = `${sec.number}.${idx + 1} ${it.label}`;
          list.push({ id, label });
        });
      }
    }
    return list;
  }, [structure]);
  const attachmentOptions = useMemo<Option[]>(() => (attachments || []).map(a => ({ id: a.id, label: a.name })), [attachments]);

  const grouped = useMemo(() => {
    const roots: MessageItem[] = [];
    const children: Record<string, MessageItem[]> = {};
    for (const m of items) {
      if (m.parentId) {
        (children[m.parentId] = children[m.parentId] || []).push(m);
      } else {
        roots.push(m);
      }
    }
    return { roots, children } as { roots: MessageItem[]; children: Record<string, MessageItem[]> };
  }, [items]);

  const attIndex = useMemo(() => {
    const map: Record<string, AttachmentItem> = {};
    (attachments||[]).forEach(a => { map[a.id] = a; });
    return map;
  }, [attachments]);

  const renderText = (txt: string) => {
    const parts: React.ReactNode[] = [];
    let last = 0; const re = /@([a-z0-9_.-]+)/gi; let m;
    while ((m = re.exec(txt)) !== null) {
      const i = m.index;
      if (i > last) parts.push(<span key={`t-${i}`}>{txt.slice(last, i)}</span>);
      const val = m[0];
      parts.push(<span key={`m-${i}`} className="text-primary">{val}</span>);
      last = i + val.length;
    }
    if (last < txt.length) parts.push(<span key={`t-end`}>{txt.slice(last)}</span>);
    return parts;
  };

  const handleSend = async () => {
    setError(null);
    const value = text.trim();
    if (!value) { setError('Message cannot be empty'); return; }
    try {
      setSubmitting(true);
      const autoSections = Array.from(value.matchAll(/#([0-9]+(?:\.[0-9]+)*)/g)).map(m => m[1]);
      const autoMentions = Array.from(value.matchAll(/@([a-z0-9_\-.]+)/gi)).map(m => '@'+m[1]);
      const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
      await onSend(value, {
        parentId: null,
        sections: unique([...selSectionOpts.map(s=>s.id), ...autoSections]),
        attachments: unique(selAttachmentOpts.map(a=>a.id)),
      });
      setText('');
      setSelSectionOpts([]);
      setSelAttachmentOpts([]);
    } catch (e: any) {
      setError(e?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header with section title and prev/next */}
      {currentSubId && sectionOptions.length>0 && (()=>{
        const idx = sectionOptions.findIndex(o=>o.id===currentSubId);
        const prev = idx>0 ? sectionOptions[idx-1] : null;
        const next = idx>=0 && idx<sectionOptions.length-1 ? sectionOptions[idx+1] : null;
        const cur = sectionOptions[idx] || null;
        return (
          <div className="flex items-center justify-between border-b pb-2">
            <div className="text-base font-semibold text-card-foreground">{cur?.label || 'Messages'}</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 text-xs rounded border bg-card disabled:opacity-50" disabled={!prev} onClick={()=> prev && onJumpToSection?.(prev.id)}>Previous</button>
              <button className="px-2 py-1 text-xs rounded border bg-card disabled:opacity-50" disabled={!next} onClick={()=> next && onJumpToSection?.(next.id)}>Next</button>
            </div>
          </div>
        );})()}

      {/* Threads */}
      {grouped.roots.map((m) => {
        const replies = (grouped.children[m.id] || []);
        const uniqueUsers = Array.from(new Set(replies.map(r => r.user)));
        const isCollapsed = collapsedById[m.id] ?? true;
        const collapsedLabel = `${replies.length} repl${replies.length > 1 ? 'ies' : 'y'} • Last reply at ${replies[replies.length - 1]?.time}`;
        return (
        <div key={m.id} className="rounded-lg border bg-[hsl(var(--foreground)/0.03)]">
          {/* Header */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar name={m.user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="text-sm sm:text-base font-semibold text-card-foreground truncate">
                    {m.user}
                    <span className="text-xs text-muted-foreground ml-2">{m.time}</span>
                  </div>
                  {onDelete && (
                    <button
                      onClick={()=> onDelete && onDelete(m.id)}
                      className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded border border-red-700"
                      aria-label="Delete message"
                      title="Delete message"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="text-muted-foreground text-sm mt-1 whitespace-pre-wrap">{renderText(m.text)}</div>
                {Boolean(replies.length) && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {uniqueUsers.slice(0,5).map(u => (
                        <div key={u} className="inline-flex ring-1 ring-background rounded-full">
                          <Avatar name={u} size={20} />
                        </div>
                      ))}
                      {uniqueUsers.length > 5 && (
                        <span className="ml-2 text-[10px] text-muted-foreground">+{uniqueUsers.length-5}</span>
                      )}
                    </div>
                    <button onClick={()=> setCollapsedById(prev=>({...prev, [m.id]: !isCollapsed}))} className="text-xs text-primary underline">
                      {isCollapsed ? collapsedLabel : "Hide replies"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Body (replies) */}
          {!isCollapsed && Boolean(replies.length) && (
            <div className="px-4 pb-2">
              {replies.map(r => (
                <div key={r.id} className="mt-3 ml-7 rounded-md border bg-[hsl(var(--foreground)/0.04)] p-3">
                  <div className="flex items-start gap-2">
                    <Avatar name={r.user} size={22} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-card-foreground font-medium truncate">{r.user} <span className="ml-2 text-muted-foreground font-normal">{r.time}</span></div>
                      <div className="text-sm text-card-foreground mt-0.5 whitespace-pre-wrap">{renderText(r.text)}</div>
                      {(r.sections?.length || r.attachments?.length) ? (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {r.sections?.map(s => (
                            <button key={s} className="badge tone-inprogress" onClick={()=> onJumpToSection?.(s)} title={`Go to section ${s}`} aria-label={`Go to section ${s}`}>Req {s}</button>
                          ))}
                          {r.attachments?.map(aid => {
                            const a = attIndex[aid];
                            const label = a?.name || `Attachment ${aid}`;
                            return (
                              <button key={aid} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-[hsl(var(--foreground)/0.05)] hover:bg-[hsl(var(--foreground)/0.08)]" onClick={()=> onJumpToAttachment?.(aid)} title={`Go to attachment ${label}`} aria-label={`Go to attachment ${label}`}>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                                <span className="text-xs">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Footer (reply composer) */}
          <div className="border-t px-4 py-3">
            {!replyOpenById[m.id] ? (
              <button className="text-xs text-primary underline" onClick={()=> setReplyOpenById(prev=>({...prev, [m.id]: true}))}>Reply</button>
            ) : (
              <div className="flex items-start gap-2">
                <Avatar name={m.user} size={22} />
                <div className="flex-1">
                  <textarea
                    className="w-full h-16 px-3 py-2 rounded bg-card border text-card-foreground"
                    placeholder="Write a reply..."
                    value={replyDrafts[m.id] || ''}
                    onChange={(e)=>{ const v = e.currentTarget.value; setReplyDrafts(prev=>({...prev, [m.id]: v})); }}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                      disabled={replySubmitting[m.id] || !(replyDrafts[m.id]||'').trim()}
                      onClick={async ()=>{
                        const txt = (replyDrafts[m.id]||'').trim(); if (!txt) return;
                        setReplySubmitting(prev=>({...prev, [m.id]: true}));
                        try {
                          await onSend(txt, { parentId: m.id, sections: [], attachments: [] });
                          setReplyDrafts(prev=>({...prev, [m.id]: ''}));
                          setReplyOpenById(prev=>({...prev, [m.id]: false}));
                          setCollapsedById(prev=>({...prev, [m.id]: false}));
                        } finally {
                          setReplySubmitting(prev=>({...prev, [m.id]: false}));
                        }
                      }}
                    >Post reply</button>
                    <button className="px-3 py-1.5 text-xs rounded border" onClick={()=> setReplyOpenById(prev=>({...prev, [m.id]: false}))}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-muted-foreground">No messages yet</div>
      )}

      {/* New root message composer */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Insert mention:</span>
          <select onChange={(e)=>{ const v=e.currentTarget.value; if (!v) return; setText(t=> (t + ' @'+v)); e.currentTarget.value=''; }} className="px-2 py-1 rounded bg-card border" title="Insert a mention of an organization member">
            <option value="">Select user...</option>
            {orgMembers.map(u => (<option key={u.id} value={u.email}>{u.name || u.email} ({u.email})</option>))}
          </select>
        </div>
        <textarea
          className="w-full h-24 px-3 py-2 rounded bg-card border border text-card-foreground"
          placeholder="Write a message..."
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <MultiTagSelect
            label="Tag requirements"
            placeholder="Search sections..."
            options={sectionOptions}
            value={selSectionOpts}
            onChange={setSelSectionOpts}
          />
          <MultiTagSelect
            label="Tag attachments"
            placeholder="Search attachments..."
            options={attachmentOptions}
            value={selAttachmentOpts}
            onChange={setSelAttachmentOpts}
          />
        </div>
        {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2 mt-2">{error}</div>}
        <div className="flex justify-end mt-2">
          <button onClick={handleSend} disabled={submitting} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-card-foreground rounded disabled:opacity-50" title="Post message" aria-label="Post message">
            {submitting ? 'Sending...' : 'Post message'}
          </button>
        </div>
      </div>
    </div>
  );
}
