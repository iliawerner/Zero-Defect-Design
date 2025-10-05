import { list, put } from '@vercel/blob';
import type { EvaluationResult, EvaluationSummary } from './types';

const EVALUATIONS_PREFIX = 'users';

function emailToPrefix(email: string) {
  const safeEmail = email.replace(/[^a-zA-Z0-9@._-]/g, '_');
  return `${EVALUATIONS_PREFIX}/${safeEmail}/evaluations/`;
}

export async function listEvaluations(email: string): Promise<EvaluationSummary[]> {
  const prefix = emailToPrefix(email);
  const blobs = await list({ prefix });

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

export async function saveEvaluation(email: string, evaluation: EvaluationResult) {
  const prefix = emailToPrefix(email);
  const key = `${prefix}${evaluation.summary.id}.json`;
  await put(key, JSON.stringify(evaluation, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });
}

export async function getEvaluation(email: string, id: string) {
  const prefix = emailToPrefix(email);
  const blobs = await list({ prefix: `${prefix}${id}` });
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
