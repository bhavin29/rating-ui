import { NextResponse } from 'next/server';
import { toggleQuestionCategoryStatus } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await toggleQuestionCategoryStatus(body.id, body.isActive);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update category status.' },
      { status: 400 }
    );
  }
}
