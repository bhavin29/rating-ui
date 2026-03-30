import { createPublicClient } from '@/app/lib/graphql/public-client';
import { SUBMIT_RATING } from '@/app/lib/graphql/mutations';
import { VALIDATE_TOKEN } from '@/app/lib/graphql/queries';
import type { ValidateTokenPayload } from '@/app/lib/api/types';

export async function validateToken(token: string) {
  const client = createPublicClient();
  const data = await client.request<{ validateToken: ValidateTokenPayload }>(VALIDATE_TOKEN, { token });
  return data.validateToken;
}

export type RatingSubmissionInput = {
  ratings: Array<{
    memberId: string;
    answers: Array<{ questionId: string; score: number }>;
  }>;
};

export async function submitRating(token: string, input: RatingSubmissionInput) {
  const client = createPublicClient();
  return client.request(SUBMIT_RATING, { token, input });
}
