import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function POST(req: Request) {
  await requireAdmin();
  await req.json();

  return NextResponse.json(
    {
      error:
        'Role rename is not supported by the current backend GraphQL schema. Ask backend to add updateRole mutation and UpdateRoleInput type.'
    },
    { status: 501 }
  );
}
