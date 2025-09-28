"use client";

import React from "react";
import type { BoardColumn, AssessmentSummary } from "../../services/assessments";

interface Props {
  open: boolean;
  item: AssessmentSummary | null;
  onClose: () => void;
  onSave: (id: string, payload: Partial<{ title: string; col: BoardColumn; dueIn: string; framework: string }>) => Promise<void> | void;
}

// Temporary stub to satisfy TypeScript until full implementation is needed.
const EditAssessmentModal: React.FC<Props> = () => {
  return null;
};

export default EditAssessmentModal;
