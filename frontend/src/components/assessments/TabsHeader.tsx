"use client";

export type TabKey = 'section' | 'tasks' | 'attachments' | 'messages' | 'collaborators';

export default function TabsHeader({ active, onChange }: { active: TabKey; onChange: (t: TabKey)=>void }){
  const tabs: {key: TabKey; label: string}[] = [
    { key: 'section', label: 'Section' },
    { key: 'tasks', label: 'Task' },
    { key: 'attachments', label: 'Attachments' },
    { key: 'messages', label: 'Messages' },
    { key: 'collaborators', label: 'Collaborators' },
  ];
  return (
    <div className="flex items-center justify-center gap-8 px-4 bg-background border-b transition-colors">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} className={`py-3 text-sm ${active===t.key?'text-foreground border-b-2 border-primary':'text-muted-foreground hover:text-foreground'}`}>{t.label}</button>
      ))}
    </div>
  );
}
