import { Card } from '@/app/components/ui';
import type { TokenValidationResult } from '@/app/lib/api/types';

export function RatingCard({ payload }: { payload: TokenValidationResult }) {
  return (
    <Card className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Rating link verified</h1>
        <p className="text-sm text-slate-600">User ID: {payload.userId ?? 'Unavailable'}</p>
      </div>
      <p className="text-sm text-slate-600">
        The current API validates tokens successfully, but it does not return the sprint, teammate, or question data
        needed to render the rating form here.
      </p>
    </Card>
  );
}
