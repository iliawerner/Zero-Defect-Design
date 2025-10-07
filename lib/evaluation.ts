import { callGemini } from './gemini';
import type { EvaluationRequest, EvaluationResult, StepResult } from './types';

const PROMPT_LAYOUT_OVERVIEW = '[[PROMPT_LAYOUT_OVERVIEW]]';
const PROMPT_DESIGN_QUALITY = '[[PROMPT_DESIGN_QUALITY]]';
const PROMPT_ACCESSIBILITY = '[[PROMPT_ACCESSIBILITY]]';
const PROMPT_DESIGN_SYSTEM = '[[PROMPT_DESIGN_SYSTEM]]';
const PROMPT_FINAL_REPORT = '[[PROMPT_FINAL_REPORT]]';
const PROMPT_VALIDATE_JSON = '[[PROMPT_VALIDATE_JSON]]';
const PROMPT_VALIDATE_BRIEF = '[[PROMPT_VALIDATE_BRIEF]]';

export interface ValidationResult {
  jsonMatchesImage: boolean;
  businessGoal?: string;
  needsBusinessGoalConfirmation: boolean;
}

export async function validateInputs(request: EvaluationRequest): Promise<ValidationResult> {
  const hasLayoutReference = request.layoutImageUrl.trim().length > 0;
  const hasStructure = request.structureJson.trim().length > 0;

  if (!hasLayoutReference || !hasStructure) {
    return {
      jsonMatchesImage: true,
      needsBusinessGoalConfirmation: false,
    };
  }

  const jsonCheck = await callGemini(PROMPT_VALIDATE_JSON, {
    structureJson: request.structureJson,
    layoutImageUrl: request.layoutImageUrl,
  });

  const matches = /\b(да|yes|true)\b/i.test(jsonCheck);

  if (!matches) {
    return {
      jsonMatchesImage: false,
      needsBusinessGoalConfirmation: false,
    };
  }

  const briefText = request.projectBrief.trim();
  if (!briefText) {
    return {
      jsonMatchesImage: true,
      needsBusinessGoalConfirmation: false,
    };
  }

  const briefCheck = await callGemini(PROMPT_VALIDATE_BRIEF, {
    projectBrief: request.projectBrief,
    structureJson: request.structureJson,
  });

  const goalMatch = briefCheck.match(/goal:(.*)/i);
  const goalText = (goalMatch ? goalMatch[1].trim() : briefCheck.trim()) || request.projectBrief;
  const confident = /\b(уверен|понятно|clear|definite)\b/i.test(briefCheck);

  return {
    jsonMatchesImage: true,
    businessGoal: goalText,
    needsBusinessGoalConfirmation: !confident,
  };
}

export async function runEvaluation(request: EvaluationRequest) {
  const steps: StepResult[] = [];

  const hasVisualContext = request.layoutImageUrl.trim().length > 0 || request.structureJson.trim().length > 0;

  if (hasVisualContext) {
    const layoutOverview = await callGemini(PROMPT_LAYOUT_OVERVIEW, request);
    steps.push({ step: 'layoutOverview', content: layoutOverview });

    const designQuality = await callGemini(PROMPT_DESIGN_QUALITY, request);
    steps.push({ step: 'designQuality', content: designQuality });

    const accessibility = await callGemini(PROMPT_ACCESSIBILITY, request);
    steps.push({ step: 'accessibility', content: accessibility });
  } else {
    const placeholder =
      'Недостаточно данных макета (JSON или изображение не загружены), поэтому автоматическая оценка пропущена.';
    steps.push({ step: 'layoutOverview', content: placeholder });
    steps.push({ step: 'designQuality', content: placeholder });
    steps.push({ step: 'accessibility', content: placeholder });
  }

  if (request.designSystemUrl.trim().length > 0) {
    const designSystem = await callGemini(PROMPT_DESIGN_SYSTEM, request);
    steps.push({ step: 'designSystem', content: designSystem });
  } else {
    steps.push({
      step: 'designSystem',
      content: 'Дизайн-система не предоставлена, оценка этого пункта пропущена.',
    });
  }

  const finalReport = await callGemini(PROMPT_FINAL_REPORT, {
    ...request,
    steps,
  });
  steps.push({ step: 'finalReport', content: finalReport });

  return steps;
}

export function buildSummary(steps: StepResult[], request: EvaluationRequest): EvaluationResult['summary'] {
  const createdAt = new Date().toISOString();
  const normalizedTitle = request.projectTitle.trim();
  return {
    id: `${Date.now()}`,
    title: normalizedTitle || 'Оценка макета',
    status: 'complete',
    projectSummary: request.projectBrief.trim().slice(0, 160),
    createdAt,
    scores: [
      { label: 'Обзор', value: extractScore(steps, 'layoutOverview') },
      { label: 'Качество', value: extractScore(steps, 'designQuality') },
      { label: 'Доступность', value: extractScore(steps, 'accessibility') },
      { label: 'Дизайн-система', value: extractScore(steps, 'designSystem') },
    ],
  };
}

function extractScore(steps: StepResult[], key: StepResult['step']) {
  const text = steps.find((step) => step.step === key)?.content ?? '';
  const match = text.match(/score\s*[:=]\s*(\d{1,2}\/?10)/i);
  return match ? match[1] : 'n/a';
}
