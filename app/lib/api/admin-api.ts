import { createGraphqlClient } from '@/app/lib/graphql/client';
import {
  GET_PROJECTS,
  GET_SPRINT_MEMBERS,
  GET_SPRINT_RATINGS,
  GET_SPRINTS
} from '@/app/lib/graphql/queries';
import {
  ADD_SPRINT_MEMBERS,
  CREATE_PROJECT,
  CREATE_SPRINT,
  REQUEST_RATING,
  UPDATE_PROJECT,
  UPDATE_SPRINT
} from '@/app/lib/graphql/mutations';
import { headers } from 'next/headers';
import type { Member, Project, Sprint, SprintRatingSummary } from '@/app/lib/api/types';

export async function getProjects() {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getProjects: Project[] }>(GET_PROJECTS);
  return data.getProjects;
}

export async function getSprints(projectId: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getSprints: Sprint[] }>(GET_SPRINTS, { projectId });
  return data.getSprints;
}

export async function getAllSprints() {
  const projects = await getProjects();
  const sprintGroups = await Promise.all(
    projects.map(async (project) => {
      const sprints = await getSprints(project.id);
      return sprints.map((sprint) => ({
        ...sprint,
        project: { id: project.id, name: project.name }
      }));
    })
  );

  return sprintGroups
    .flat()
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export async function getSprintMembers(sprintId: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{
    getSprintMembers: Array<{
      id: string;
      user: { id: string; fullName: string; email: string; role: { id: string; name: string } };
    }>;
  }>(GET_SPRINT_MEMBERS, { sprintId });

  return data.getSprintMembers.map(
    (member): Member => ({
      id: member.user.id,
      name: member.user.fullName,
      email: member.user.email,
      role: member.user.role.name,
      roleId: member.user.role.id
    })
  );
}

export async function getSprintRatings(sprintId: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getSprintRatings: SprintRatingSummary[] }>(GET_SPRINT_RATINGS, { sprintId });
  return data.getSprintRatings;
}

export async function createProject(input: { name: string }) {
  const client = createGraphqlClient();
  return client.request(CREATE_PROJECT, { input });
}

export async function updateProject(input: { projectId: string; name: string; status: string }) {
  const client = createGraphqlClient();
  return client.request(UPDATE_PROJECT, { input });
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

export async function updateSprint(input: {
  sprintId: string;
  name: string;
  startDate: string;
  endDate: string;
}) {
  const client = createGraphqlClient();
  return client.request(UPDATE_SPRINT, { input });
}

export async function addSprintMembers(sprintId: string, userIds: string[]) {
  const client = createGraphqlClient();
  return client.request(ADD_SPRINT_MEMBERS, { input: { sprintId, userIds } });
}

export async function requestRating(sprintId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ requestRating: boolean }>(REQUEST_RATING, { sprintId });
  return data.requestRating;
}

async function getAuthHeaders() {
  const h = await headers();
  return {
    authorization: h.get('authorization') ?? `Bearer ${process.env.ADMIN_API_TOKEN ?? 'mock-admin-token'}`
  };
}
