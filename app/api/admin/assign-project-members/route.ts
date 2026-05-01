import { NextResponse } from 'next/server';
import { addProjectMembers } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (!body.roleId) {
      return NextResponse.json({ message: 'Select a role before adding project members.' }, { status: 400 });
    }

    const data = await addProjectMembers(body.projectId, body.memberIds, body.roleId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to add project team members.' },
      { status: 400 }
    );
  }
}
