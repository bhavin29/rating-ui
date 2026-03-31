import { notFound } from 'next/navigation';
import { validateToken } from '@/app/lib/api/public-api';

export default async function MagicLinkRatingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = await validateToken(token);

  if (!payload?.valid) {
    notFound();
  }

  return (
    <main className="mx-auto mt-10 max-w-3xl p-4">
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Rating link verified</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your token is valid for user <span className="font-medium text-slate-900">{payload.userId}</span>.
        </p>
        <p className="mt-4 text-sm text-slate-600">
          The current GraphQL API only exposes token validation on this route, so the peer-rating form has been
          removed until the backend returns the sprint, teammates, and question set needed to submit ratings.
        </p>
      </div>
    </main>
  );
}
