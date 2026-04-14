import { NextResponse } from 'next/server';
import { deleteRole } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const deleted = await deleteRole(body.roleId);
  return NextResponse.json({ deleteRole: deleted });
}
