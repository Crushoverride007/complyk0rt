"use client";

import React, { useState } from "react";

type ToolbarProps = {
  onCreateTask: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  onReview?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onAddMembers?: () => void;
  onHelp?: () => void;
  onSearch?: (q: string) => void;
  defaultQuery?: string;
};

function Tool({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/40 text-muted-foreground hover:text-foreground">
      {icon}
      <span className="hidden sm:block text-sm">{label}</span>
    </button>
  );
}

export default function Toolbar({ onCreateTask, onFilter, onExport, onReview, onAccept, onReject, onAddMembers, onHelp, onSearch, defaultQuery = "" }: ToolbarProps) {
  const [q, setQ] = useState(defaultQuery);

  return (
    <div className="border-b border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          <div className="flex items-center gap-1">
            <Tool onClick={onFilter} label="Filter" icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
            } />
            <div className="h-5 w-px bg-muted mx-2" />
            <Tool onClick={onExport} label="Export" icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 19h14"/></svg>
            } />
            <Tool onClick={onReview} label="Review" icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-9 9-4-4"/></svg>
            } />
            <Tool onClick={onAccept} label="Accept" icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            } />
            <Tool onClick={onReject} label="Reject" icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            } />
            <Tool onClick={onAddMembers} label="Add Members" icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11v-3m-1.5 1.5H22"/></svg>
            } />
            <Tool onClick={onHelp} label="Help?" icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
            } />
          </div>

          <div className="flex-1" />

          <div className="hidden md:block">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 103.89 9.39l3.11 3.1a1 1 0 001.42-1.42l-3.1-3.11A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd"/></svg>
              </div>
              <input
                value={q}
                onChange={(e)=>{ setQ(e.target.value); onSearch?.(e.target.value); }}
                placeholder="Search"
                className="pl-8 pr-3 py-1.5 rounded-md bg-card border text-sm text-foreground placeholder-muted-foreground focus:border-input focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="ml-auto">
            <button onClick={onCreateTask} className="px-3 py-2 bg-primary hover:brightness-110 text-primary-foreground rounded text-sm">+ Create New Task</button>
          </div>
        </div>
      </div>
    </div>
  );
}
