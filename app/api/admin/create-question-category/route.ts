import { NextResponse } from 'next/server';
import { createQuestionCategory } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';
import { getGqlErrorMessage, getGqlErrorStatus } from '@/app/lib/utils/gql-error';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await createQuestionCategory(body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: getGqlErrorMessage(error, 'Failed to create question category.') },
      { status: getGqlErrorStatus(error, 400) }
    );
  }
}
