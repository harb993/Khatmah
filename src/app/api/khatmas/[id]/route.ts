import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getKhatma, deleteKhatma } from '@/lib/data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const khatma = getKhatma(id);
  if (!khatma) {
    return NextResponse.json({ error: 'Khatma not found' }, { status: 404 });
  }
  return NextResponse.json(khatma);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const khatma = getKhatma(id);
  if (!khatma) {
    return NextResponse.json({ error: 'Khatma not found' }, { status: 404 });
  }

  if (khatma.creatorId !== userId) {
    return NextResponse.json({ error: 'Only the creator can delete this khatma' }, { status: 403 });
  }

  deleteKhatma(id);
  return NextResponse.json({ success: true });
}
