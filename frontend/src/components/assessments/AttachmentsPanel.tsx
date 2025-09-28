
"use client";

import React from "react";
import type { AttachmentItem } from "../../services/assessments";

interface Props {
  items: AttachmentItem[];
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  // Linking controls
  activeSub?: string;               // current subsection id (optional)
  linkedIds?: string[];             // which attachment ids are linked to activeSub
  onToggleLink?: (id: string, next: boolean) => void; // toggle link/unlink
  onUpload?: (file: File, linkToCurrent: boolean) => void; // upload file and optionally link
}

export default function AttachmentsPanel({ items, onDelete, onDownload, activeSub, linkedIds = [], onToggleLink, onUpload }: Props){
  const [linkOnUpload, setLinkOnUpload] = React.useState(true);
  const canLink = !!activeSub && !!onToggleLink;
  return (
    <div className="p-6">
      {/* Upload box */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <span className="text-muted-foreground">Upload:</span>
          <input type="file" onChange={(e)=>{ const f=e.currentTarget.files?.[0]; if (!f) return; onUpload?.(f, !!(canLink && linkOnUpload)); e.currentTarget.value=''; }} />
        </label>
        {canLink && (
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={linkOnUpload} onChange={(e)=>setLinkOnUpload(e.currentTarget.checked)} />
            <span className="text-muted-foreground">Link to current section</span>
          </label>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Modified</th>
              <th className="py-3 px-4">Size</th>
              {canLink && <th className="py-3 px-4">Linked</th>}
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f)=> {
              const linked = linkedIds.includes(f.id);
              return (
                <tr key={f.id} className="border-b border">
                  <td className="py-3 px-4 text-card-foreground">{f.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{f.created}</td>
                  <td className="py-3 px-4 text-muted-foreground">{f.modified}</td>
                  <td className="py-3 px-4 text-muted-foreground">{f.size}</td>
                  {canLink && (
                    <td className="py-3 px-4">
                      <button className={`px-2 py-1 rounded border ${linked? 'bg-[hsl(var(--success)/0.15)]' : 'bg-card'}`} onClick={()=>onToggleLink?.(f.id, !linked)} title={linked? 'Unlink from current section' : 'Link to current section'} aria-label={linked? 'Unlink from current section' : 'Link to current section'}>
                        {linked ? 'Unlink from section' : 'Link to section'}
                      </button>
                    </td>
                  )}
                  <td className="py-3 px-4 text-muted-foreground">
                    <button onClick={()=>onDownload?.(f.id)} className="px-2 py-1 bg-card border border rounded hover:brightness-110 mr-2" title="Download file" aria-label="Download file">Download file</button>
                    <button className="px-2 py-1 bg-card border border rounded hover:brightness-110" onClick={()=>onDelete?.(f.id)} title="Delete file" aria-label="Delete file">Delete file</button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td className="py-6 px-4 text-muted-foreground" colSpan={canLink?6:5}>No attachments</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
