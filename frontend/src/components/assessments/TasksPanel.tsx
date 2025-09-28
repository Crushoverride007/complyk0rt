"use client";

import React from 'react';
import type { TaskItem } from '../../services/assessments';

export default function TasksPanel({ tasks }: { tasks: TaskItem[] }){
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border">
              <th className="py-3 px-4">Task Name</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Due in</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t)=> (
              <tr key={t.id} className="border-b border">
                <td className="py-3 px-4 text-card-foreground">{t.name}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs ${t.status==='Completed'?'bg-green-700 text-white':'bg-yellow-700 text-white'}`}>{t.status}</span></td>
                <td className="py-3 px-4 text-muted-foreground">{t.due}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td className="py-6 px-4 text-muted-foreground" colSpan={3}>No tasks yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
