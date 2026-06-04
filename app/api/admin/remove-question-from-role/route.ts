import { NextResponse } from 'next/server';
import { removeQuestionFromRole } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await removeQuestionFromRole({ roleId: body.roleId, questionId: body.questionId });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to remove question.' },
      { status: 400 }
    );
  }
}
