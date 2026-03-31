'use client';

import { useEffect, useState } from 'react';
import { useRequestRating } from '@/app/hooks/use-admin-mutations';
import { Button } from '@/app/components/ui';

export function RequestRatingButton({ sprintId }: { sprintId: string }) {
  const mutation = useRequestRating();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (mutation.isSuccess) {
      setMessage('Rating request sent successfully.');
      return;
    }

    if (mutation.isError) {
      setMessage('Failed to send rating request. Please retry.');
    }
  }, [mutation.isError, mutation.isSuccess]);

  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          setMessage(null);
          mutation.mutate(sprintId);
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Triggering...' : 'Trigger rating request'}
      </Button>
      {message ? (
        <p className={`text-xs ${mutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>
      ) : null}
    </div>
  );
}
