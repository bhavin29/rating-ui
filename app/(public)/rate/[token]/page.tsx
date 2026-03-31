import { notFound } from 'next/navigation';
import { RatingCard } from '@/app/components/rating-card';
import { validateToken } from '@/app/lib/api/public-api';

export default async function MagicLinkRatingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = await validateToken(token);

  if (!payload?.valid) {
    notFound();
  }

  return (
    <main className="mx-auto mt-10 max-w-3xl p-4">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User Rating Portal</p>
          <h1 className="text-2xl font-bold text-slate-900">Peer feedback access</h1>
          <p className="text-sm text-slate-600">
            This page is currently driven by the live GraphQL token validation response.
          </p>
        </div>
        <RatingCard payload={payload} />
      </div>
    </main>
  );
}
