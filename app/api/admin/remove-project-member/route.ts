import { NextResponse } from 'next/server';
import { removeProjectMember } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await removeProjectMember(body.membershipId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to remove project member.' },
      { status: 400 }
    );
  }
}
