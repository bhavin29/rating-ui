'use client';

import { SprintRatingForm } from '@/app/components/sprint-rating-form';
import type { SprintRatingData } from '@/app/lib/api/types';

export function SprintRatingFormWrapper({ data }: { data: SprintRatingData }) {
  return (
    <SprintRatingForm
      data={data}
      onSubmit={async (formData) => {
        // Do nothing on submit - ready for backend API integration
        console.log('Form submitted:', formData);
      }}
    />
  );
}
