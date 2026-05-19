import { NextResponse } from 'next/server';
import { createRole } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';
import { getGqlErrorMessage, getGqlErrorStatus } from '@/app/lib/utils/gql-error';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await createRole(body);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: getGqlErrorMessage(err, 'Failed to create role') },
      { status: getGqlErrorStatus(err) }
    );
  }
}
