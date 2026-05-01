import { NextResponse } from 'next/server';
import { updateProjectMemberStatus } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await updateProjectMemberStatus(body.projectId, body.userId, body.isActive, body.roleId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update the project member.' },
      { status: 400 }
    );
  }
}
