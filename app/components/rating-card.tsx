import { Card } from '@/app/components/ui';
import { MemberRatingForm } from '@/app/components/member-rating-form';
import type { ValidateTokenPayload } from '@/app/lib/api/types';

export function RatingCard({ token, payload }: { token: string; payload: ValidateTokenPayload }) {
  return (
    <Card className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Rate your sprint peers</h1>
        <p className="text-sm text-slate-600">
          Sprint: {payload.sprint.name} · Rater: {payload.rater.name}
        </p>
      </div>
      <MemberRatingForm token={token} members={payload.members} questionsByRole={payload.questionsByRole} />
    </Card>
  );
}
