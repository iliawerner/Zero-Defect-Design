import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../lib/auth-options';
import { getEvaluation } from '../../../../lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Требуется авторизация' }, { status: 401 });
  }

  const evaluation = await getEvaluation(session.user.email, params.id);
  if (!evaluation) {
    return NextResponse.json({ message: 'Не найдено' }, { status: 404 });
  }

  return NextResponse.json(evaluation);
}
