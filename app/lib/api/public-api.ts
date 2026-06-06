import { createPublicClient } from '@/app/lib/graphql/public-client';
import { SUBMIT_RATING, UPDATE_SPRINT_RATING_REQUESTS, VALIDATE_TOKEN } from '@/app/lib/graphql/mutations';
import {
  GENERATE_SPRINT_RATING_REQUEST,
  GET_MY_SPRINT_RATING_SUMMARY,
  GET_QUESTION_CATEGORIES,
  GET_USER_PROJECT_SPRINT_DATA
} from '@/app/lib/graphql/queries';
import type { QuestionCategory, SprintRatingData, SprintRatingSummaryItem, UserProjectSprintData } from '@/app/lib/api/types';
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

export async function getPublicCategories(): Promise<Pick<QuestionCategory, 'id' | 'name'>[]> {
  const client = createPublicClient();
  const data = await client.request<{ questionCategories: QuestionCategory[] }>(
    GET_QUESTION_CATEGORIES,
    { isActive: true, skip: 0, take: 100 }
  );
  return data.questionCategories.map(({ id, name }) => ({ id, name }));
}

export async function getMySprintRatingSummary(
  filters: { projectId?: string; sprintId?: string; categoryId?: string },
  cookieHeader?: string
): Promise<SprintRatingSummaryItem[]> {
  const client = createPublicClient(cookieHeader ? { Cookie: cookieHeader } : undefined);
  const data = await client.request<{ getMySprintRatingSummary: SprintRatingSummaryItem[] }>(
    GET_MY_SPRINT_RATING_SUMMARY,
    {
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.sprintId ? { sprintId: filters.sprintId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {})
    }
  );
  return data.getMySprintRatingSummary;
}

export async function getUserProjectSprintData(userId: string, cookieHeader?: string): Promise<UserProjectSprintData[]> {
  const client = createPublicClient(cookieHeader ? { Cookie: cookieHeader } : undefined);
  const data = await client.request<{ getUserProjectSprintData: UserProjectSprintData[] }>(
    GET_USER_PROJECT_SPRINT_DATA,
    { userId }
  );
  return data.getUserProjectSprintData;
}
