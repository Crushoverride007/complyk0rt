"use client";

import React, { useEffect, useState } from "react";
import AssessmentsKanban from "./AssessmentsKanban";
import { useToast } from "./ToastProvider";
import type { AssessmentSummary } from "../services/assessments";
import { getAssessments } from "../services/assessments";

export default function AssessmentsView(){
  const { showToast } = useToast();
  const [items, setItems] = useState<AssessmentSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getAssessments();
        if (!alive) return;
        setItems(rows);
      } catch (e: any) {
        showToast(e?.message || "Failed to load assessments", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false };
  }, [showToast]);

  const onToast = (msg: string, type?: 'success'|'error'|'info') => showToast(msg, type || 'info');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-card-foreground">Assessments</h1>
      </div>
      {loading && (<div className="text-muted-foreground">Loading…</div>)}
      {!!items && (
        <AssessmentsKanban
          data={items}
          onToast={onToast}
        />
      )}
      {(!loading && (!items || items.length===0)) && (
        <div className="text-muted-foreground">No assessments</div>
      )}
    </div>
  );
}
