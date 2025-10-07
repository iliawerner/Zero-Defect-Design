import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildSummary, runEvaluation, validateInputs } from '../../../lib/evaluation';
import { saveEvaluation, listEvaluations } from '../../../lib/storage';
import type { EvaluationRequest, EvaluationResult } from '../../../lib/types';

const optionalText = z.preprocess(
  (value) => (typeof value === 'string' ? value : ''),
  z.string(),
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : ''),
  z.union([z.literal(''), z.string().url()]),
);

const requestSchema = z.object({
  projectTitle: optionalText,
  projectBrief: optionalText,
  structureJson: optionalText,
  designSystemUrl: optionalUrl,
  layoutImageUrl: optionalUrl,
});

export async function GET() {
  try {
    const summaries = await listEvaluations();
    return NextResponse.json(summaries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Не удалось загрузить оценки' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const confirmGoal = url.searchParams.has('confirmGoal');

  let payload: EvaluationRequest;
  try {
    const json = await request.json();
    payload = requestSchema.parse(json);
    payload = {
      ...payload,
      projectTitle: payload.projectTitle.trim(),
      projectBrief: payload.projectBrief.trim(),
    };
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Некорректные данные' }, { status: 400 });
  }

  try {
    const validation = await validateInputs(payload);

    if (!validation.jsonMatchesImage) {
      return NextResponse.json({ message: 'JSON не соответствует изображению' }, { status: 409 });
    }

    if (!confirmGoal && validation.needsBusinessGoalConfirmation) {
      return NextResponse.json(
        {
          message: 'Требуется подтвердить бизнес-задачу',
          businessGoal: validation.businessGoal,
        },
        { status: 428 },
      );
    }

    const steps = await runEvaluation(payload);
    const summary = buildSummary(steps, payload);
    const evaluation: EvaluationResult = {
      id: summary.id,
      summary,
      steps,
    };

    await saveEvaluation(evaluation);

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Ошибка при обработке оценки' }, { status: 500 });
  }
}
