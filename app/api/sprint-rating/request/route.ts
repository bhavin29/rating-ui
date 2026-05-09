import { NextResponse } from 'next/server';
import { getSprintRatingRequest } from '@/app/lib/api/public-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spmId = searchParams.get('spmId') ?? searchParams.get('spmid');

  if (!spmId?.trim()) {
    return NextResponse.json({ error: 'Missing spmId parameter' }, { status: 400 });
  }

  try {
    const data = await getSprintRatingRequest(spmId);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load rating data' },
      { status: 500 }
    );
  }
}
