import { createGraphqlClient } from '@/app/lib/graphql/client';
import {
  GET_PROJECT_MEMBERS,
  GET_PROJECTS,
  GET_SPRINT_MEMBERS,
  GET_SPRINT_RATINGS,
  GET_SPRINTS,
  GET_USERS
} from '@/app/lib/graphql/queries';
import {
  ADD_PROJECT_MEMBERS,
  ADD_SPRINT_MEMBERS,
  CREATE_PROJECT,
  CREATE_SPRINT,
  REMOVE_PROJECT_MEMBER,
  REQUEST_RATING,
  UPDATE_PROJECT_MEMBER_STATUS,
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

export async function getUsers() {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{
    getUsers: Array<{
      id: string;
      fullName: string;
      email: string;
      isActive?: boolean;
      role: { id: string; name: string };
    }>;
  }>(GET_USERS);

  return data.getUsers.map(
    (user): Member => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role.name,
      roleId: user.role.id,
      isActive: user.isActive
    })
  );
}

export async function getProjectMembers(projectId: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{
    getProjectMembers: Array<{
      id: string;
      isActive?: boolean;
      user: { id: string; fullName: string; email: string; isActive?: boolean; role: { id: string; name: string } };
    }>;
  }>(GET_PROJECT_MEMBERS, { projectId });

  return data.getProjectMembers.map(
    (member): Member => ({
      id: member.user.id,
      name: member.user.fullName,
      email: member.user.email,
      role: member.user.role.name,
      roleId: member.user.role.id,
      isActive: member.user.isActive,
      membershipIsActive: member.isActive
    })
  );
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

export async function addProjectMembers(projectId: string, userIds: string[]) {
  const client = createGraphqlClient();
  return client.request(ADD_PROJECT_MEMBERS, { input: { projectId, userIds } });
}

export async function removeProjectMember(projectId: string, userId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ removeProjectMember: boolean }>(REMOVE_PROJECT_MEMBER, {
    input: { projectId, userId }
  });
  return data.removeProjectMember;
}

export async function updateProjectMemberStatus(projectId: string, userId: string, isActive: boolean) {
  const client = createGraphqlClient();
  const data = await client.request<{ updateProjectMemberStatus: { id: string; isActive: boolean } }>(
    UPDATE_PROJECT_MEMBER_STATUS,
    { input: { projectId, userId, isActive } }
  );
  return data.updateProjectMemberStatus;
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
