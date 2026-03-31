import { Card } from '@/app/components/ui';
import { MemberRatingForm } from '@/app/components/member-rating-form';
import type { TokenValidationResult } from '@/app/lib/api/types';

export function RatingCard({ payload }: { payload: TokenValidationResult }) {
  return (
    <Card className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Rating link verified</h1>
        <p className="text-sm text-slate-600">User ID: {payload.userId ?? 'Unavailable'}</p>
      </div>
      {payload.reason ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          API note: {payload.reason}
        </div>
      ) : null}
      <MemberRatingForm />
    </Card>
  );
}
