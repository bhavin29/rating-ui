import { createGraphqlClient } from '@/app/lib/graphql/client';
import {
  GET_PROJECTS,
  GET_REPORTS,
  GET_SPRINT_MEMBERS,
  GET_SPRINTS
} from '@/app/lib/graphql/queries';
import {
  ASSIGN_MEMBERS,
  CREATE_PROJECT,
  CREATE_SPRINT,
  REQUEST_RATING
} from '@/app/lib/graphql/mutations';
import { headers } from 'next/headers';

export async function getProjects() {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getProjects: unknown[] }>(GET_PROJECTS);
  return data.getProjects;
}

export async function getSprints(projectId?: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getSprints: unknown[] }>(GET_SPRINTS, { projectId });
  return data.getSprints;
}

export async function getSprintMembers(sprintId: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getSprintMembers: unknown[] }>(GET_SPRINT_MEMBERS, { sprintId });
  return data.getSprintMembers;
}

export async function getReports(sprintId?: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  return client.request(GET_REPORTS, { sprintId });
}

export async function createProject(input: { name: string }) {
  const client = createGraphqlClient();
  return client.request(CREATE_PROJECT, { input });
}

export async function createSprint(input: {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
}) {
  const client = createGraphqlClient();
  return client.request(CREATE_SPRINT, { input });
}

export async function assignMembers(sprintId: string, memberIds: string[]) {
  const client = createGraphqlClient();
  return client.request(ASSIGN_MEMBERS, { sprintId, memberIds });
}

export async function requestRating(sprintId: string) {
  const client = createGraphqlClient();
  return client.request(REQUEST_RATING, { sprintId });
}

async function getAuthHeaders() {
  const h = await headers();
  return {
    authorization: h.get('authorization') ?? `Bearer ${process.env.ADMIN_API_TOKEN ?? 'mock-admin-token'}`
  };
}
