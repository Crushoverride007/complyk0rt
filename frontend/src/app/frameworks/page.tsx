"use client";
import * as React from 'react';
import { getAssessments, AssessmentSummary, getAssessmentMeta } from '../../services/assessments';

type FW = { key: string; label: string; synonyms: RegExp[] };
const SUPPORTED: FW[] = [
  { key: 'pci32', label: 'PCI DSS v3.2.1', synonyms: [/pci\s*dss\s*3/i, /pci\s*3/i] },
  { key: 'pci40', label: 'PCI DSS v4.0', synonyms: [/pci\s*dss\s*4/i, /pci\s*4/i] },
  { key: 'iso27001', label: 'ISO 27001', synonyms: [/iso\s*-?\s*27001/i] },
  { key: 'dora', label: 'DORA', synonyms: [/\bdora\b/i] },
  { key: 'soc2', label: 'SOC 2', synonyms: [/soc\s*-?\s*2/i] },
  { key: 'hipaa', label: 'HIPAA', synonyms: [/hipaa/i] },
];

function categorize(a: AssessmentSummary): string | null {
  const fw = a.framework || '';
  for (const f of SUPPORTED) {
    if (f.synonyms.some(rx => rx.test(fw))) return f.key;
  }
  return null;
}

export default function Frameworks(){
  const [assessments, setAssessments] = React.useState<AssessmentSummary[]>([]);
  const [progressByFw, setProgressByFw] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const list = await getAssessments().catch(() => [] as AssessmentSummary[]);
      if (!alive) return;
      setAssessments(list);
      // Compute average progress per framework (cap to 30 assessments for perf)
      const buckets: Record<string, AssessmentSummary[]> = {};
      for (const a of list) {
        const k = categorize(a);
        if (!k) continue;
        (buckets[k] ||= []).push(a);
      }
      const unique: AssessmentSummary[] = Array.from(new Set(Object.values(buckets).flat())).slice(0, 30);
      const meta = await Promise.all(unique.map(a => getAssessmentMeta(a.id).catch(()=>({ progress: 0, attachments:0, messages:0 }) as any)));
      const progressMap: Record<string, number> = {};
      for (const f of SUPPORTED) {
        const xs = (buckets[f.key] || []);
        if (!xs.length) { progressMap[f.key] = 0; continue; }
        let sum = 0, n = 0;
        for (const a of xs) {
          const idx = unique.indexOf(a);
          if (idx >= 0) { sum += (meta[idx]?.progress || 0); n++; }
        }
        progressMap[f.key] = n ? Math.round(sum / n) : 0;
      }
      if (alive) setProgressByFw(progressMap);
    })();
    return () => { alive = false };
  }, []);

  const counts: Record<string, number> = {};
  for (const f of SUPPORTED) counts[f.key] = 0;
  for (const a of assessments) {
    const k = categorize(a);
    if (k) counts[k]++;
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-card-foreground mb-6">Security Frameworks</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED.map(f => (
            <div key={f.key} className="bg-card border rounded p-5">
              <div className="flex items-center justify-between">
                <div className="text-card-foreground font-semibold">{f.label}</div>
                <div className="text-xs text-muted-foreground">{counts[f.key]} project{counts[f.key] === 1 ? '' : 's'}</div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Avg. completion</span>
                  <span>{progressByFw[f.key] ?? 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" style={{ width: `${progressByFw[f.key] ?? 0}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
