import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') ?? `design-system-${Date.now()}`;

  const blob = await put(`design-systems/${filename}`, request.body, {
    access: 'public',
  });

  return NextResponse.json(blob);
}
