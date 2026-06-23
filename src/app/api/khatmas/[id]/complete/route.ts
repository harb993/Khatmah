import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { completePart } from '@/lib/data';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { juz } = body;

  if (!juz || typeof juz !== 'number' || juz < 1 || juz > 30) {
    return NextResponse.json({ error: 'Invalid juz number' }, { status: 400 });
  }

  const khatma = completePart(id, juz, userId);
  if (!khatma) {
    return NextResponse.json({ error: 'Could not complete part. You may not be assigned to it.' }, { status: 400 });
  }

  return NextResponse.json(khatma);
}
