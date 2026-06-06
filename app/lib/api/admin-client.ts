import type { AvailableQuestion, QuestionAssignment, Skill } from '@/app/lib/api/types';

export type UserRoleInputPayload = {
  roleId: string;
  skillId?: string;
  level?: string;
};

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export const createProjectClient = (input: { name: string }) =>
  post('/api/admin/create-project', input);

export const updateProjectClient = (input: { projectId: string; name: string; status: string }) =>
  post('/api/admin/update-project', input);


export const createRoleClient = (input: { name: string }) =>
  post('/api/admin/create-role', input);

export const updateRoleClient = (input: { roleId: string; name: string }) =>
  post('/api/admin/update-role', input);

export const deleteRoleClient = (payload: { roleId: string }) =>
  post('/api/admin/delete-role', payload);

export const getSkillsClient = (): Promise<{ skills: Skill[] }> =>
  get('/api/admin/get-skills');

export const createUserClient = (input: {
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  userRoles?: UserRoleInputPayload[];
}) => post('/api/admin/create-user', input);

export const sendSprintFeedbackEmailClient = (input: { userId: string; email: string; name: string }) =>
  post('/api/sprint-feedback/send-email', input);

export const updateUserClient = (input: {
  userId: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  userRoles?: UserRoleInputPayload[];
}) => post('/api/admin/update-user', input);

export const deleteUserClient = (payload: { userId: string }) =>
  post('/api/admin/delete-user', payload);

export const createQuestionClient = (input: {
  text: string;
  categoryId?: string | null;
  projectId?: string | null;
  sprintId?: string | null;
  isActive: boolean;
}) =>
  post('/api/admin/create-question', normalizeQuestionPayload(input, false));

export const updateQuestionClient = (input: {
  id: string;
  text: string;
  categoryId?: string | null;
  projectId?: string | null;
  sprintId?: string | null;
  isActive: boolean;
}) =>
  post('/api/admin/update-question', normalizeQuestionPayload(input, true));

export const deleteQuestionClient = (payload: { id: string }) =>
  post('/api/admin/delete-question', payload);

export const toggleQuestionStatusClient = (payload: { id: string; isActive: boolean }) =>
  post('/api/admin/toggle-question-status', payload);

export const createSprintClient = (input: {
  name: string;
  startDate: string;
  endDate: string;
}) => post('/api/admin/create-sprint', input);

export const updateSprintClient = (input: {
  sprintId: string;
  name: string;
  startDate: string;
  endDate: string;
}) => post('/api/admin/update-sprint', input);

export const assignProjectMembersClient = (payload: {
  projectId: string;
  memberIds: string[];
  roleId: string;
  allocationPercentage?: number;
}) => post('/api/admin/assign-project-members', payload);

export const removeProjectMemberClient = (payload: { membershipId: string }) =>
  post('/api/admin/remove-project-member', payload);

export const updateProjectMemberStatusClient = (payload: {
  membershipId: string;
  isActive?: boolean;
  roleId?: string | null;
  allocationPercentage?: number;
}) => post('/api/admin/update-project-member-status', payload);

export const requestRatingClient = (payload: { sprintId: string }) =>
  post('/api/admin/request-rating', payload);

export const processSprintClient = (payload: { sprintId: string }) =>
  post('/api/admin/process-sprint', payload);

export const createQuestionCategoryClient = (input: {
  name: string;
  description?: string | null;
  isActive?: boolean;
}) => post('/api/admin/create-question-category', input);

export const updateQuestionCategoryClient = (input: {
  id: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}) => post('/api/admin/update-question-category', input);

export const deleteQuestionCategoryClient = (payload: { id: string }) =>
  post('/api/admin/delete-question-category', payload);

export const toggleQuestionCategoryStatusClient = (payload: { id: string; isActive: boolean }) =>
  post('/api/admin/toggle-question-category-status', payload);

export const getSelfSprintRatingSummaryClient = (params: {
  userId: string;
  projectId?: string;
  sprintId?: string;
  categoryId?: string;
}): Promise<import('@/app/lib/api/types').SprintRatingSummaryItem[]> => {
  const qs = new URLSearchParams({ userId: params.userId });
  if (params.projectId) qs.set('projectId', params.projectId);
  if (params.sprintId) qs.set('sprintId', params.sprintId);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  return get(`/api/sprint-summary/self?${qs.toString()}`);
};

export const getAdminSprintRatingSummaryClient = (params: {
  userId: string;
  projectId?: string;
  sprintId?: string;
  categoryId?: string;
}): Promise<import('@/app/lib/api/types').SprintRatingSummaryItem[]> => {
  const qs = new URLSearchParams({ userId: params.userId });
  if (params.projectId) qs.set('projectId', params.projectId);
  if (params.sprintId) qs.set('sprintId', params.sprintId);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  return get(`/api/admin/sprint-summary?${qs.toString()}`);
};

export const getAvailableQuestionsClient = (params: {
  roleId: string;
  search?: string;
  categoryId?: string;
}): Promise<AvailableQuestion[]> => {
  const qs = new URLSearchParams({ roleId: params.roleId });
  if (params.search) qs.set('search', params.search);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  return get(`/api/admin/available-questions?${qs.toString()}`);
};

export const getAssignedQuestionsClient = (roleId: string): Promise<QuestionAssignment[]> =>
  get(`/api/admin/assigned-questions?roleId=${encodeURIComponent(roleId)}`);

export const assignQuestionsToRoleClient = (input: {
  roleId: string;
  questionIds: string[];
}): Promise<boolean> =>
  post('/api/admin/assign-questions-to-role', input);

export const removeQuestionFromRoleClient = (input: {
  roleId: string;
  questionId: string;
}): Promise<boolean> =>
  post('/api/admin/remove-question-from-role', input);

function normalizeQuestionPayload<T extends { projectId?: string | null; sprintId?: string | null }>(
  input: T,
  includeNulls: boolean
) {
  const { projectId, sprintId, ...rest } = input;
  const normalizedProjectId = projectId || null;
  const normalizedSprintId = sprintId || null;

  return {
    ...rest,
    ...(includeNulls || normalizedProjectId ? { projectId: normalizedProjectId } : {}),
    ...(includeNulls || normalizedSprintId ? { sprintId: normalizedSprintId } : {})
  };
}
