'use client';

import { SprintRatingForm } from '@/app/components/sprint-rating-form';
import { submitSprintRatingRequest } from '@/app/lib/api/public-api';
import type { SprintRatingData } from '@/app/lib/api/types';

export function SprintRatingFormWrapper({ data }: { data: SprintRatingData }) {
  return (
    <SprintRatingForm
      data={data}
      onSubmit={async (formData) => {
        await submitSprintRatingRequest(formData);
      }}
    />
  );
}
