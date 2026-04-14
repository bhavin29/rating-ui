import { NextResponse } from 'next/server';
import { updateProjectMemberStatus } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const data = await updateProjectMemberStatus(body.projectId, body.userId, body.isActive);
  return NextResponse.json(data);
}
