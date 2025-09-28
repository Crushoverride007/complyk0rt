"use client";

import React from "react";

export interface SettingsCheckboxRowProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}

/**
 * A clean, accessible checkbox row with label + description on the left
 * and the checkbox on the right, matching the style in the provided screenshot.
 */
export default function SettingsCheckboxRow({ id, label, description, checked, onChange, disabled }: SettingsCheckboxRowProps){
  return (
    <div className="flex items-start justify-between border-t border-border py-4">
      <div className="pr-4">
        <label htmlFor={id} className="text-sm font-medium text-card-foreground">
          {label}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="pl-4">
        <input
          id={id}
          type="checkbox"
          className="h-5 w-5 rounded border-muted text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50"
          checked={checked}
          onChange={(e)=> onChange?.(e.currentTarget.checked)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
