import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { assignPart, unassignPart } from '@/lib/data';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.emailAddresses?.[0]?.emailAddress || 'Unknown';

  const { id } = await params;
  const body = await req.json();
  const { juz } = body;

  if (!juz || typeof juz !== 'number' || juz < 1 || juz > 30) {
    return NextResponse.json({ error: 'Invalid juz number' }, { status: 400 });
  }

  const khatma = assignPart(id, juz, userId, userName);
  if (!khatma) {
    return NextResponse.json({ error: 'Could not assign part. It may already be taken.' }, { status: 400 });
  }

  return NextResponse.json(khatma);
}

export async function DELETE(
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

  const khatma = unassignPart(id, juz, userId);
  if (!khatma) {
    return NextResponse.json({ error: 'Could not unassign part.' }, { status: 400 });
  }

  return NextResponse.json(khatma);
}
