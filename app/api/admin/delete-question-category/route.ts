import { NextResponse } from 'next/server';
import { deleteQuestionCategory } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    await deleteQuestionCategory(body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete question category.' },
      { status: 400 }
    );
  }
}
