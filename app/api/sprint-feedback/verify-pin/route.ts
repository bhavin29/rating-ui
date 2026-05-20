import { NextResponse } from 'next/server';

type VerifyPinBody = {
  userId?: string;
  pin?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyPinBody;

    if (!body.userId?.trim()) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    if (!body.pin?.trim()) {
      return NextResponse.json({ success: false, message: 'Security PIN is required' }, { status: 400 });
    }

    const response = await fetch(getBackendVerifyPinEndpoint(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId: body.userId,
        user_id: body.userId,
        pin: body.pin
      })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: payload?.message ?? payload?.error ?? `PIN verification failed: ${response.status}`
        },
        { status: response.status }
      );
    }

    const json = NextResponse.json({
      success: Boolean(payload?.success),
      message: payload?.message
    });

    json.cookies.set('sprint_auth', body.userId, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    });

    return json;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to verify Security PIN'
      },
      { status: 500 }
    );
  }
}

function getBackendVerifyPinEndpoint() {
  if (process.env.SPRINT_FEEDBACK_VERIFY_PIN_ENDPOINT) {
    return process.env.SPRINT_FEEDBACK_VERIFY_PIN_ENDPOINT;
  }

  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:3001/graphql';
  const backendOrigin = new URL(graphqlEndpoint).origin;

  return `${backendOrigin}/api/sprint-feedback/verify-pin`;
}
