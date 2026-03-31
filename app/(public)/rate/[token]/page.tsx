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
      <RatingCard payload={payload} />
    </main>
  );
}
