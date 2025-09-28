"use client";
import * as React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const sizeToClass: Record<NonNullable<AvatarProps['size']>, { box: string; text: string }> = {
  xs: { box: 'h-4 w-4', text: 'text-[9px]' },
  sm: { box: 'h-6 w-6', text: 'text-[11px]' },
  md: { box: 'h-8 w-8', text: 'text-sm' },
};

function initials(name?: string) {
  const n = (name || '?').trim().split(/\s+/).filter(Boolean);
  return ((n[0]?.[0] || '') + (n[1]?.[0] || '') || '?').toUpperCase();
}

export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  const s = sizeToClass[size];
  return (
    <span
      className={[
        'inline-grid place-items-center rounded-full bg-foreground/20 text-foreground',
        s.box,
        s.text,
        className || '',
      ].join(' ')}
      title={name || undefined}
    >
      {initials(name)}
    </span>
  );
}

export default Avatar;
