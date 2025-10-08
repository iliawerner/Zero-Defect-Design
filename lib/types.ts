export type EvaluationStepKey =
  | 'layoutOverview'
  | 'designQuality'
  | 'accessibility'
  | 'designSystem'
  | 'finalReport';

export interface EvaluationScoreSummary {
  label: string;
  value: string;
}

export interface EvaluationSummary {
  id: string;
  title: string;
  status: 'pending' | 'complete';
  projectSummary: string;
  createdAt: string;
  scores: EvaluationScoreSummary[];
}

export interface EvaluationRequest {
  projectTitle: string;
  layoutImageUrl: string;
}

export interface StepResult {
  step: EvaluationStepKey;
  content: string;
}

export interface EvaluationResult {
  id: string;
  summary: EvaluationSummary;
  steps: StepResult[];
  finalReportUrl?: string;
}
