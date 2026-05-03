import { createPublicClient } from '@/app/lib/graphql/public-client';
import { SUBMIT_RATING, UPDATE_SPRINT_RATING_REQUESTS, VALIDATE_TOKEN } from '@/app/lib/graphql/mutations';
import { GENERATE_SPRINT_RATING_REQUEST } from '@/app/lib/graphql/queries';
import type { SprintRatingData } from '@/app/lib/api/types';
import type { TokenValidationResult } from '@/app/lib/api/types';

export async function validateToken(token: string) {
  const client = createPublicClient();
  const data = await client.request<{ validateToken: TokenValidationResult }>(VALIDATE_TOKEN, {
    input: { token }
  });
  return data.validateToken;
}

export type RatingSubmissionInput = {
  token: string;
  sprintId: string;
  raterId: string;
  ratedUserId: string;
  answers: Array<{ questionId: string; score: number }>;
};

export async function submitRating(input: RatingSubmissionInput) {
  const client = createPublicClient();
  return client.request(SUBMIT_RATING, { input });
}

export type SprintRatingRequestItem = {
  spr_id: string;
  rating: number;
  answer: string;
};

export async function submitSprintRatingRequest(input: SprintRatingRequestItem[]) {
  const response = await fetch('/api/sprint-rating/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to submit sprint rating');
  }

  return data;
}

export async function getSprintRatingRequest(spmId: string): Promise<SprintRatingData> {
  const client = createPublicClient();
  const data = await client.request<{ generateSprintRatingRequest: SprintRatingData }>(
    GENERATE_SPRINT_RATING_REQUEST,
    { spmId }
  );
  return data.generateSprintRatingRequest;
}
