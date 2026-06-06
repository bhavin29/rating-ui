import { NextResponse } from 'next/server';
import { getAvailableQuestions } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId');
    if (!roleId) {
      return NextResponse.json({ message: 'roleId is required.' }, { status: 400 });
    }
    const search = searchParams.get('search') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const data = await getAvailableQuestions(roleId, search, categoryId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch available questions.' },
      { status: 400 }
    );
  }
}
