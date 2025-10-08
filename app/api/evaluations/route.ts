import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildSummary, runEvaluation } from '../../../lib/evaluation';
import { saveEvaluation, listEvaluations } from '../../../lib/storage';
import type { EvaluationRequest, EvaluationResult } from '../../../lib/types';

const requestSchema = z.object({
  projectTitle: z.preprocess((value) => (typeof value === 'string' ? value : ''), z.string()),
  layoutImageUrl: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string().url(),
  ),
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
  let payload: EvaluationRequest;
  try {
    const json = await request.json();
    payload = requestSchema.parse(json);
    payload = {
      projectTitle: payload.projectTitle.trim(),
      layoutImageUrl: payload.layoutImageUrl,
    };
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Некорректные данные' }, { status: 400 });
  }

  try {
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
