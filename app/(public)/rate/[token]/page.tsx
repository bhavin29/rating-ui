import { notFound } from 'next/navigation';
import { RatingCard } from '@/app/components/rating-card';
import { validateToken } from '@/app/lib/api/public-api';

export default async function MagicLinkRatingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = await validateToken(token);

  if (!payload?.isValid) {
    notFound();
  }

  if (payload.hasSubmitted) {
    return (
      <main className="mx-auto mt-10 max-w-3xl p-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700">
          Rating already submitted for this link.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-10 max-w-3xl p-4">
      <RatingCard token={token} payload={payload} />
    </main>
  );
}
