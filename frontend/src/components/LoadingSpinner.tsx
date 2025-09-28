"use client";

import React from 'react';

/**
 * Full-page branded loader used while the app initializes/auth loads.
 * Accessible, with subtle brand animation and no layout shift.
 */
export const FullPageLoader: React.FC<{ withinAppShell?: boolean }> = ({ withinAppShell = true }) => {
  // When rendered within the app shell (with a 56px top nav), subtract its height to avoid scroll.
  const containerClass = withinAppShell
    ? 'min-h-[calc(100vh-56px)]'
    : 'min-h-screen';

  return (
    <div className={`${containerClass} bg-background grid place-items-center overflow-hidden`}
         role="status" aria-live="polite" aria-busy="true">
      {/* Decorative background (very subtle) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-tr from-primary/10 via-sky-400/10 to-emerald-400/10 blur-3xl" />
      </div>

      <div className="flex flex-col items-center">
        {/* Brand mark with animated ring */}
        <div className="relative">
          {/* outer animated ring */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary/20 via-primary/0 to-primary/20 p-[2px]">
            <div className="h-full w-full rounded-full bg-background" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '1.6s' }} />
          {/* inner logo */}
          <div className="absolute inset-2 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">C</div>
        </div>

        {/* Progress shimmer bar */}
        <div className="mt-6 w-40 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 bg-primary/70 animate-[shimmer_1.4s_ease_infinite]" />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">Loading ComplykOrt…</p>
      </div>

      {/* Keyframes for shimmer (Tailwind arbitrary animation) */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(140%); }
        }
      `}</style>
    </div>
  );
};

/** Inline spinner for small areas (buttons, small panels). */
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  } as const;

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-muted border-t-primary`} aria-hidden="true" />
  );
};

export default FullPageLoader;
