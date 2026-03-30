'use client';

import { useRequestRating } from '@/app/hooks/use-admin-mutations';
import { Button } from '@/app/components/ui';

export function RequestRatingButton({ sprintId }: { sprintId: string }) {
  const mutation = useRequestRating();
  return (
    <Button onClick={() => mutation.mutate(sprintId)} disabled={mutation.isPending}>
      {mutation.isPending ? 'Triggering...' : 'Trigger rating request'}
    </Button>
  );
}
