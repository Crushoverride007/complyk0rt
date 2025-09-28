"use client";

import React, { useState } from 'react';

export type Status = 'Backlog' | 'In Progress' | 'Review' | 'Done';

interface Task {
  id: string;
  title: string;
  owner: string;
  priority: 'low' | 'medium' | 'high';
  status: Status;
}

const initialTasks: Task[] = [
  { id: 'T-101', title: 'Design onboarding checklist', owner: 'Jane', priority: 'high', status: 'Backlog' },
  { id: 'T-102', title: 'Encrypt DB backups', owner: 'Alex', priority: 'medium', status: 'In Progress' },
  { id: 'T-103', title: 'SOC2 evidence map', owner: 'Sam', priority: 'high', status: 'Review' },
  { id: 'T-104', title: 'Update access policy', owner: 'Rita', priority: 'low', status: 'Done' },
];

const columns: Status[] = ['Backlog', 'In Progress', 'Review', 'Done'];

function priorityBadge(priority: Task['priority']) {
  const map: Record<Task['priority'], string> = {
    low: 'tone-backlog',
    medium: 'tone-review',
    high: 'tone-danger',
  };
  return map[priority];
}

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const move = (id: string, dir: -1 | 1) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const idx = columns.indexOf(t.status);
        const next = Math.min(Math.max(idx + dir, 0), columns.length - 1);
        return { ...t, status: columns[next] };
      })
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map(col => (
        <div key={col} className="bg-card rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-card-foreground font-semibold">{col}</h4>
            <span className="text-xs text-muted-foreground">{tasks.filter(t => t.status === col).length}</span>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => t.status === col).map(t => (
              <div key={t.id} className="bg-card rounded-lg p-3 border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-card-foreground text-sm font-medium">{t.title}</span>
                  <span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Owner: {t.owner}</span>
                  <span>#{t.id}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    className="px-2 py-1 text-xs bg-secondary hover:brightness-110 text-foreground rounded border border-gray-700 disabled:opacity-40"
                    onClick={() => move(t.id, -1)}
                    disabled={t.status === 'Backlog'}
                  >
                    ←
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-card-foreground rounded"
                    onClick={() => move(t.id, 1)}
                    disabled={t.status === 'Done'}
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === col).length === 0 && (
              <div className="text-xs text-muted-foreground italic">No tasks</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
