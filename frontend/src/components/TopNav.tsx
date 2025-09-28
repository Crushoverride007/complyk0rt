"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
  { href: '/', label: 'Dashboard' },
  { href: '/assessments', label: 'Assessments' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/files', label: 'Files' },
  { href: '/frameworks', label: 'Frameworks' },
  { href: '/users', label: 'Users' },
  { href: '/settings', label: 'Settings' },
];

export default function TopNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-background border-b transition-colors">
      {/* Top row: brand, centered search, actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">C</span>
            <span className="hidden sm:block text-base font-semibold text-foreground">ComplykOrt</span>
          </Link>

          {/* Centered search (authenticated only) */}
          {isAuthenticated && (
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-xl">
              <label htmlFor="global-search" className="sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 103.89 9.39l3.11 3.1a1 1 0 001.42-1.42l-3.1-3.11A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="global-search"
                  placeholder="Search"
                  className="block w-full rounded-md border bg-card py-2 pl-10 pr-3 text-sm text-foreground placeholder-muted-foreground shadow-sm focus:border-input focus:ring-2 focus:ring-primary/20"
                  type="search"
                />
              </div>
            </div>
          </div>
          )}

          {/* Theme toggle: always visible */}
          <ThemeToggle />
          {/* Actions (authenticated only) */}
          {isAuthenticated && (<div className="flex items-center gap-3">
            <UserBadge />
            <button aria-label="Notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent text-foreground">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>
            <UserMenu />
          </div>) }
        </div>
      </div>

      {/* Secondary row: tabs (authenticated only) */}
      {isAuthenticated && (<nav className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map(t => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={
                    active
                      ? 'whitespace-nowrap border-b-2 border-primary px-1 py-3 text-sm font-medium text-foreground'
                      : 'whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border'
                  }
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>) }
    </header>
  );
}


function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium hover:brightness-105" aria-haspopup="menu" aria-expanded={open}>
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card shadow-lg z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground">Signed in</div>
          {isAuthenticated && user && (
            <div className="px-3 pb-2 text-sm text-foreground truncate">{user.name || user.email}</div>
          )}
          <div className="border-t" />
          {isAuthenticated ? (
            <button onClick={() => { setOpen(false); logout(); }} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent">Logout</button>
          ) : (
            <Link href="/" className="block px-3 py-2 text-sm text-foreground hover:bg-accent">Sign in</Link>
          )}
        </div>
      )}
    </div>
  );
}


function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<'light'|'dark'>('light');

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('ck_theme');
      let initial: 'light'|'dark' = 'light';
      if (stored === 'dark' || stored === 'light') initial = stored as any;
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) initial = 'dark';
      setTheme(initial);
      const el = document.documentElement;
      if (initial === 'dark') el.classList.add('dark'); else el.classList.remove('dark');
      localStorage.setItem('ck_theme', initial);
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const el = document.documentElement;
    if (theme === 'dark') el.classList.add('dark'); else el.classList.remove('dark');
    try { localStorage.setItem('ck_theme', theme); } catch {}
  }, [theme, mounted]);

  if (!mounted) return null;
  return (
    <button
      onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent text-foreground  transition-colors"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        // sun icon
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      ) : (
        // moon icon
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      )}
    </button>
  );
}


function UserBadge() {
  const { user } = useAuth() as any;
  const email = String(user?.email || '').toLowerCase();
  const role = (user?.role || user?.organizations?.[0]?.role || (email === 'admin@acme.example.com' ? 'admin' : 'viewer')).toLowerCase();
  const label = role === 'viewer' ? 'Viewer/Guest' : role === 'aoc' ? 'AOC' : role.charAt(0).toUpperCase()+role.slice(1);
  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border bg-secondary text-xs text-foreground">
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{user?.email}</span>
    </div>
  );
}
