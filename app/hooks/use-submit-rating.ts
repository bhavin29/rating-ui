'use client';

import { useMutation } from '@tanstack/react-query';
import { RatingSubmissionInput, submitRating } from '@/app/lib/api/public-api';

export function useSubmitRating() {
  return useMutation({
    mutationFn: (input: RatingSubmissionInput) => submitRating(input)
  });
}
