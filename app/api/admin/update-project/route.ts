import { NextResponse } from 'next/server';
import { updateProject } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const data = await updateProject(body);
  return NextResponse.json(data);
}
