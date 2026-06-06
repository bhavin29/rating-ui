import { NextResponse } from 'next/server';
import { updateUser } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await updateUser(body);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ message: extractErrorMessage(err, 'Failed to update user') }, { status: 500 });
  }
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const first = (err as { response?: { errors?: Array<{ message?: string }> } })
      .response?.errors?.[0]?.message;
    if (first) return first;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
