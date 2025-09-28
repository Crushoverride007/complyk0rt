"use client";

import * as React from 'react';

type Status = 'success' | 'warning' | 'danger';
type Part = { title: string; sections: { heading: string; items: string[] }[] };

// Sample projects list. Replace with real projects from your API when available.
const projects = ['Project A — ABC Inc. ROC 2025', 'Project B — XYZ LLC SAQ 2024'];

// Shared section model (matches Assessments left sidebar)
const parts: Part[] = [
  {
    title: 'Part I: Assessment Overview',
    sections: [
      {
        heading: 'Contact Information and Summary of Results',
        items: [
          'Contact Information',
          'Date and timeframe of',
          'PCI DSS version',
          'Additional services provided',
          'Summary of Findings',
        ],
      },
      {
        heading: 'Business Overview',
        items: [
          'Business description',
          'Organizational structure',
          'Products and services',
          'Locations and channels',
        ],
      },
      {
        heading: 'Description of Scope of Work and Approach Taken',
        items: [
          "Assessor's validation of",
          'Cardholder Data',
          'Network segmentation',
          'Network segment details',
        ],
      },
      {
        heading: 'Details about Reviewed Environment',
        items: [
          'System components',
          'In-scope applications',
          'Payment channels',
          'Third-party service providers',
        ],
      },
      { heading: 'Quarterly Scan Results', items: ['Q1', 'Q2', 'Q3', 'Q4'] },
    ],
  },
  {
    title: 'Part II: Sampling and Evidence, Findings and Observations',
    sections: [
      {
        heading: 'Sampling and Evidence',
        items: ['Sampling approach', 'Evidence collected', 'Sampled entities', 'Deviations'],
      },
      {
        heading: 'Findings and Observations',
        items: [
          'Build and Maintain a Secure Network and Systems',
          'Protect Account Data',
          'Maintain a Vulnerability Management Program',
          'Implement Strong Access Control Measures',
          'Regularly Monitor and Test Networks',
          'Maintain an Information Security Policy',
          'Appendix A: Additional PCI DSS Requirements',
          'Appendix B: Compensating Controls',
          'Appendix C: Compensating Controls Worksheet',
          'Appendix D: Customized Approach',
          'Appendix E: Customized Approach Template',
        ],
      },
    ],
  },
];

export default function Files(){
  const files = [
    { name:'Finalized Evidence', created:'May 1, 2020 15:00:00 AM', modified:'May 14, 2019 15:00:00 AM', size:'1 Item' },
    { name:'Evidence1 Version 1.doc', created:'Nov 13, 2020 12:01:05 AM', modified:'Nov 13, 2020 12:01:05 AM', size:'10 MB' },
    { name:'Evidence1 Version 2.doc', created:'Nov 18, 2020 12:01:05 AM', modified:'Nov 18, 2020 12:01:05 AM', size:'10 MB' },
    { name:'Evidence1 Version 3.doc', created:'Dec 13, 2020 12:01:05 AM', modified:'Dec 13, 2020 12:01:05 AM', size:'10 MB' },
    { name:'Evidence1 Version 4.doc', created:'Dec 13, 2020 10:01:05 PM', modified:'Dec 13, 2020 10:01:05 PM', size:'10 MB' },
  ];

  const dotClass = (i: number) => (i % 3 === 0 ? 'dot-success' : i % 3 === 1 ? 'dot-warning' : 'dot-danger');
  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  const [activeSub, setActiveSub] = React.useState<string>('1-1'); // section-sub index like '1-1'

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-4 xl:col-span-3 bg-card border rounded p-4">
          <div className="text-muted-foreground text-sm mb-3">Projects</div>
          <div className="mb-6 relative pl-4">
            <div className="pointer-events-none absolute left-0 top-1 bottom-1 w-px bg-[hsl(var(--foreground)/0.12)]"></div>
            <ul className="space-y-1.5">
              {projects.map((p, i) => {
                const isActive = p === activeProject;
                return (
                  <li
                    key={p}
                    onClick={() => { setActiveProject(p); setActiveSub('1-1'); }}
                    className={[
                      'relative -mx-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                      'flex items-center gap-2 text-[13px] leading-[1.45]',
                      isActive
                        ? 'bg-[hsl(var(--foreground)/0.10)] text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--foreground)/0.06)]',
                    ].join(' ')}
                  >
                    {isActive && (
                      <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-[hsl(var(--primary))]"></span>
                    )}
                    <span className={`dot ${dotClass(i)}`}></span>
                    <span>{p}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {activeProject ? (
          <>
          <div className="text-muted-foreground text-sm mb-2">Sections</div>
          <div>
            {parts.map((part, idx) => (
              <div key={idx} className={idx > 0 ? 'mt-8' : ''}>
                <div className="sticky top-0 z-10 -mx-2 mb-3 px-2 py-2 bg-card/90 supports-[backdrop-filter]:bg-card/60 backdrop-blur border-b border-[hsl(var(--foreground)/0.08)]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-foreground border-l-2 border-[hsl(var(--primary))] pl-2">{part.title}</div>
                </div>
                <div className="space-y-6">
                  {part.sections.map((sec, sIdx) => {
                    const sectionNumber = parts
                      .slice(0, idx)
                      .reduce((acc, p) => acc + p.sections.length, 0) + (sIdx + 1);
                    return (
                      <div key={sIdx} className="mb-2">
                        <div className="text-[13px] font-medium tracking-[-0.01em] text-foreground mb-2">
                          {sectionNumber}. {sec.heading}
                        </div>
                        <div className="relative pl-4">
                          <div className="pointer-events-none absolute left-0 top-1 bottom-1 w-px bg-[hsl(var(--foreground)/0.12)]"></div>
                          <ul className="space-y-1.5">
                            {sec.items.map((label, i) => {
                              const key = `${sectionNumber}-${i + 1}`;
                              const isActive = activeSub === key;
                              const subNumber = `${sectionNumber}.${i + 1}`;
                              return (
                                <li
                                  key={key}
                                  onClick={() => setActiveSub(key)}
                                  className={[
                                    'relative -mx-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                                    'flex items-center gap-2 text-[13px] leading-[1.45]',
                                    isActive
                                      ? 'bg-[hsl(var(--foreground)/0.10)] text-foreground'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--foreground)/0.06)]',
                                  ].join(' ')}
                                >
                                  {isActive && (
                                    <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-[hsl(var(--primary))]"></span>
                                  )}
                                  <span className={`dot ${dotClass(i)}`}></span>
                                  <span>{label.startsWith('Appendix ') ? label : `${subNumber} ${label}`}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Select a project to view sections.</div>
        )}
        </aside>

        <section className="col-span-12 md:col-span-8 xl:col-span-9 bg-card border rounded">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="text-card-foreground font-semibold">{activeProject ? `${activeProject} — ${activeSub}` : `Select a project — ${activeSub}`} </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-secondary rounded text-foreground border hover:bg-gray-700">Upload</button>
              <button className="px-3 py-2 bg-secondary rounded text-foreground border hover:bg-gray-700">Create New Folder</button>
            </div>
          </div>
          {activeProject ? (
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-3 px-4">Folder Name</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Last Modified Date</th>
                  <th className="py-3 px-4">File size</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f,i)=> (
                  <tr key={i} className="border-b">
                    <td className="py-3 px-4 text-blue-300 hover:text-blue-200 cursor-pointer">{f.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{f.created}</td>
                    <td className="py-3 px-4 text-muted-foreground">{f.modified}</td>
                    <td className="py-3 px-4 text-muted-foreground">{f.size}</td>
                    <td className="py-3 px-4 text-muted-foreground"><button className="px-2 py-1 bg-secondary rounded border hover:brightness-110 mr-2">Download</button><button className="px-2 py-1 bg-secondary rounded border hover:brightness-110">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Select a project to view its files.</div>
          )}
        </section>
      </div>
    </div>
  );
}
