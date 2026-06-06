import { NextResponse } from 'next/server';
import { getSkills } from '@/app/lib/api/admin-api';
import { requireAdmin } from '@/app/lib/utils/auth';

export async function GET() {
  try {
    await requireAdmin();
    const skills = await getSkills();
    return NextResponse.json({ skills });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
