import { NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/graphql/public-client';
import { UPDATE_SPRINT_RATING_REQUESTS } from '@/app/lib/graphql/mutations';

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const client = createPublicClient();
    const data = await client.request(UPDATE_SPRINT_RATING_REQUESTS, { input });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit sprint rating';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
