async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export const createProjectClient = (input: { name: string }) =>
  post('/api/admin/create-project', input);

export const updateProjectClient = (input: { projectId: string; name: string; status: string }) =>
  post('/api/admin/update-project', input);

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

export const requestRatingClient = (payload: { sprintId: string }) =>
  post('/api/admin/request-rating', payload);
