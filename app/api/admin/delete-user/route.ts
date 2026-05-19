import { NextResponse } from 'next/server';
import { deleteUser } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await deleteUser(body.userId);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
}
