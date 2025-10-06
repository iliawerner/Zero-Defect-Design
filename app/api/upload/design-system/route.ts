import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') ?? `design-system-${Date.now()}`;

  const body = request.body;

  if (!body) {
    return NextResponse.json(
      { error: 'Missing file body in upload request' },
      { status: 400 },
    );
  }

  const blob = await put(`design-systems/${filename}`, body, {
    access: 'public',
  });

  return NextResponse.json(blob);
}
