import { NextResponse } from 'next/server';
import { createUser } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const data = await createUser(body);
  return NextResponse.json(data);
}
