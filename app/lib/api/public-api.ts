import { createPublicClient } from '@/app/lib/graphql/public-client';
import { SUBMIT_RATING, VALIDATE_TOKEN } from '@/app/lib/graphql/mutations';
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
