import { NextResponse } from 'next/server';
import { assignProjectMembersToSprint, generatePeerRatings } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const { sprintId } = body;

  // First, assign project members to sprint
  await assignProjectMembersToSprint(sprintId);

  // Then, generate peer ratings
  const result = await generatePeerRatings(sprintId);

  return NextResponse.json({ success: result });
}
