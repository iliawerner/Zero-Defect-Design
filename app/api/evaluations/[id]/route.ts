import { NextResponse } from 'next/server';
import { getEvaluation } from '../../../../lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const evaluation = await getEvaluation(params.id);

  if (!evaluation) {
    return NextResponse.json({ message: 'Не найдено' }, { status: 404 });
  }

  return NextResponse.json(evaluation);
}
