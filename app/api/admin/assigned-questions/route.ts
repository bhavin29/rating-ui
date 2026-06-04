import { NextResponse } from 'next/server';
import { getAssignedQuestions } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId');
    if (!roleId) {
      return NextResponse.json({ message: 'roleId is required.' }, { status: 400 });
    }
    const data = await getAssignedQuestions(roleId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch assigned questions.' },
      { status: 400 }
    );
  }
}
