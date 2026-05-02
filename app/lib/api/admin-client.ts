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

export const createUserClient = (input: { name: string; email: string; roleId: string; isActive: boolean }) =>
  post('/api/admin/create-user', input);

export const updateUserClient = (input: {
  userId: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
}) => post('/api/admin/update-user', input);

export const deleteUserClient = (payload: { userId: string }) =>
  post('/api/admin/delete-user', payload);

export const createQuestionClient = (input: {
  text: string;
  roleId: string;
  projectId?: string | null;
  sprintId?: string | null;
  isActive: boolean;
}) =>
  post('/api/admin/create-question', normalizeQuestionPayload(input, false));

export const updateQuestionClient = (input: {
  id: string;
  text: string;
  roleId: string;
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
  projectId: string;
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

export const assignMembersClient = (payload: { sprintId: string; memberIds: string[] }) =>
  post('/api/admin/assign-members', payload);

export const assignProjectMembersClient = (payload: { projectId: string; memberIds: string[]; roleId: string }) =>
  post('/api/admin/assign-project-members', payload);

export const removeProjectMemberClient = (payload: { projectId: string; userId: string }) =>
  post('/api/admin/remove-project-member', payload);

export const updateProjectMemberStatusClient = (payload: {
  projectId: string;
  userId: string;
  isActive?: boolean;
  roleId?: string;
}) =>
  post('/api/admin/update-project-member-status', payload);

export const requestRatingClient = (payload: { sprintId: string }) =>
  post('/api/admin/request-rating', payload);

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
