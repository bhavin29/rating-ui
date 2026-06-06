import { NextResponse } from 'next/server';
import { getAdminSprintRatingSummary } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }
    const projectId = searchParams.get('projectId') ?? undefined;
    const sprintId = searchParams.get('sprintId') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;

    const data = await getAdminSprintRatingSummary(userId, { projectId, sprintId, categoryId });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch rating summary.' },
      { status: 500 }
    );
  }
}
