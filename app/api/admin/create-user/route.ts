import { NextResponse } from 'next/server';
import { createUser } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await createUser(body);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ message: getErrorMessage(err) }, { status: 500 });
  }
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  }

  return 'Failed to create user';
}
