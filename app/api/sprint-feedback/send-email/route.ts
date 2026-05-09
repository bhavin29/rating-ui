import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/utils/auth';

type SendSprintFeedbackEmailBody = {
  userId?: string;
  email?: string;
  name?: string;
};

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json()) as SendSprintFeedbackEmailBody;

    if (!body.userId?.trim()) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const endpoint = getBackendEmailEndpoint();
    const portalUrl = getFeedbackAuthUrl(req, body.userId);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId: body.userId,
        user_id: body.userId,
        email: body.email,
        name: body.name,
        portalUrl,
        portal_url: portalUrl,
        organizationName: process.env.VITE_ORGANIZATION_NAME,
        organization_name: process.env.VITE_ORGANIZATION_NAME
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      return NextResponse.json(
        { message: payload?.message ?? payload?.error ?? `Email request failed: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to send sprint feedback email' },
      { status: 500 }
    );
  }
}

function getBackendEmailEndpoint() {
  if (process.env.SPRINT_FEEDBACK_EMAIL_ENDPOINT) {
    return process.env.SPRINT_FEEDBACK_EMAIL_ENDPOINT;
  }

  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:3001/graphql';
  const backendOrigin = new URL(graphqlEndpoint).origin;

  return `${backendOrigin}/api/sprint-feedback/send-email`;
}

function getFeedbackAuthUrl(req: Request, userId: string) {
  const configuredPortalUrl = process.env.VITE_PORTAL_URL?.replace(/\/$/, '');
  const origin = configuredPortalUrl ?? new URL(req.url).origin;

  return `${origin}/feedback-auth?user=${encodeURIComponent(userId)}`;
}
