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

function mapErrorToResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('Zero_Defect_Gemini')) {
      return {
        status: 503,
        message:
          'Интеграция Gemini не настроена. Убедитесь, что переменная окружения Zero_Defect_Gemini задана.',
      };
    }

    if (error.message.includes('Gemini API вернул ошибку')) {
      return {
        status: 502,
        message: 'Gemini вернул ошибку. Проверьте ключ и доступность сервиса.',
      };
    }

    if (error.message.includes('VERCEL_BLOB')) {
      return {
        status: 503,
        message:
          'Хранилище Vercel Blob недоступно. Проверьте VERCEL_BLOB_TOKEN и настройки доступа.',
      };
    }

    if (error.message.includes('Не удалось сохранить файл оценки')) {
      return {
        status: 503,
        message: 'Не удалось сохранить результат оценки. Проверьте настройки хранилища.',
      };
    }

    if (error.message.includes('Не удалось загрузить изображение макета')) {
      return {
        status: 400,
        message: error.message,
      };
    }

    return {
      status: 500,
      message: error.message || 'Ошибка при обработке оценки',
    };
  }

  return {
    status: 500,
    message: 'Ошибка при обработке оценки',
  };
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
    const { status, message } = mapErrorToResponse(error);
    return NextResponse.json({ message }, { status });
  }
}
