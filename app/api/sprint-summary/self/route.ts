import { NextResponse } from 'next/server';
import { getAdminSprintRatingSummary } from '@/app/lib/api/admin-api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // userId is passed explicitly by the component (which got it from the validated page)
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    // Security: ensure the sprint_auth cookie matches the requested userId
    const cookieHeader = req.headers.get('cookie') ?? '';
    const sprintAuth = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('sprint_auth='))
      ?.slice('sprint_auth='.length);

    if (!sprintAuth || sprintAuth !== userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const projectId = searchParams.get('projectId') ?? undefined;
    const sprintId = searchParams.get('sprintId') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;

    // Use server-side admin credentials (ADMIN_API_TOKEN env) to fetch the
    // summary for this specific user — more reliable than cookie-based auth.
    const data = await getAdminSprintRatingSummary(userId, { projectId, sprintId, categoryId });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch rating summary.' },
      { status: 500 }
    );
  }
}
