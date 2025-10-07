import { list, put } from '@vercel/blob';
import type { EvaluationResult, EvaluationSummary } from './types';

const EVALUATIONS_PREFIX = 'evaluations/';

export async function listEvaluations(): Promise<EvaluationSummary[]> {
  const blobs = await list({ prefix: EVALUATIONS_PREFIX });

  const evaluations = await Promise.all(
    blobs.blobs.map(async (blob) => {
      const response = await fetch(blob.downloadUrl ?? blob.url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Не удалось загрузить файл оценки: ${blob.pathname}`);
      }
      const evaluation = (await response.json()) as EvaluationResult;
      return evaluation.summary;
    }),
  );

  return evaluations.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function saveEvaluation(evaluation: EvaluationResult) {
  const key = `${EVALUATIONS_PREFIX}${evaluation.summary.id}.json`;
  await put(key, JSON.stringify(evaluation, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });
}

export async function getEvaluation(id: string) {
  const blobs = await list({ prefix: `${EVALUATIONS_PREFIX}${id}` });
  const target = blobs.blobs.find((blob) => blob.pathname.endsWith(`${id}.json`));
  if (!target) {
    return null;
  }
  const response = await fetch(target.downloadUrl ?? target.url, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as EvaluationResult;
}
