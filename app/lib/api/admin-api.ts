import { createGraphqlClient } from '@/app/lib/graphql/client';
import {
  GET_ALL_QUESTIONS,
  GET_PROJECT_MEMBERS,
  GET_PROJECTS,
  GET_QUESTION_CATEGORIES,
  GET_ROLES,
  GET_SKILLS,
  GET_SPRINT_RATINGS,
  GET_SPRINTS,
  GET_USERS
} from '@/app/lib/graphql/queries';
import {
  ADD_PROJECT_MEMBERS,
  ASSIGN_PROJECT_MEMBERS_TO_SPRINT,
  CREATE_QUESTION,
  CREATE_PROJECT,
  CREATE_QUESTION_CATEGORY,
  CREATE_ROLE,
  CREATE_SPRINT,
  CREATE_USER,
  DELETE_QUESTION,
  DELETE_QUESTION_CATEGORY,
  DELETE_ROLE,
  DELETE_USER,
  GENERATE_PEER_RATINGS,
  REMOVE_PROJECT_MEMBER,
  REQUEST_RATING,
  TOGGLE_QUESTION_CATEGORY_STATUS,
  TOGGLE_QUESTION_STATUS,
  UPDATE_PROJECT_MEMBER_STATUS,
  UPDATE_PROJECT,
  UPDATE_QUESTION,
  UPDATE_QUESTION_CATEGORY,
  UPDATE_ROLE,
  UPDATE_SPRINT,
  UPDATE_USER
} from '@/app/lib/graphql/mutations';
import { headers } from 'next/headers';
import { getAdminToken } from '@/app/lib/utils/auth';
import type { AdminQuestion, AdminUser, Member, Project, QuestionCategory, Role, Skill, Sprint, SprintRatingSummary, UserRoleEntry } from '@/app/lib/api/types';

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
      userRoles?: Array<{
        id: string;
        role: { id: string; name: string };
        skill: { id: string; name: string } | null;
        level: string | null;
      }>;
    }>;
  }>(GET_USERS);

  return data.getUsers.map((user): AdminUser =>
    mapGraphqlUser({ ...user, isActive: Boolean(user.isActive) })
  );
}

export async function getSkills() {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getSkills: Skill[] }>(GET_SKILLS);
  return data.getSkills;
}

export async function getRoles() {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getRoles: Role[] }>(GET_ROLES);
  return data.getRoles;
}

export async function getQuestions() {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ questions: AdminQuestion[] }>(GET_ALL_QUESTIONS);
  return data.questions.map((question) => ({
    id: question.id,
    text: question.text,
    categoryId: question.categoryId ?? null,
    category: question.category ?? null,
    projectId: question.projectId ?? null,
    project: question.project ?? null,
    sprintId: question.sprintId ?? null,
    sprint: question.sprint ?? null,
    isActive: Boolean(question.isActive)
  }));
}

export async function getProjectMembers(projectId: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{
    getProjectMembers: Array<{
      id: string;
      isActive?: boolean;
      roleId?: string | null;
      allocationPercentage?: number | null;
      role?: { id: string; name: string } | null;
      user: { id: string; fullName: string; email: string; isActive?: boolean; role: { id: string; name: string } };
    }>;
  }>(GET_PROJECT_MEMBERS, { projectId });

  return data.getProjectMembers.map(
    (member): Member => ({
      id: member.user.id,
      membershipId: member.id,
      name: member.user.fullName,
      email: member.user.email,
      role: member.user.role.name,
      roleId: member.user.role.id,
      membershipRole: member.role?.name ?? null,
      membershipRoleId: member.roleId ?? member.role?.id ?? null,
      isActive: member.user.isActive,
      membershipIsActive: member.isActive,
      allocationPercentage: member.allocationPercentage ?? 0
    })
  );
}

export async function getSprints(projectId: string) {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ getSprints: Sprint[] }>(GET_SPRINTS, { projectId });
  return data.getSprints.map((sprint) => ({
    ...sprint,
    startDate: normalizeSprintDate(sprint.startDate),
    endDate: normalizeSprintDate(sprint.endDate)
  }));
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

export async function createRole(input: { name: string }) {
  const client = createGraphqlClient();
  return client.request(CREATE_ROLE, { input });
}

export async function updateRole(input: { roleId: string; name: string }) {
  const client = createGraphqlClient();
  return client.request(UPDATE_ROLE, { input });
}

export async function deleteRole(roleId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ deleteRole: boolean }>(DELETE_ROLE, { input: { roleId } });
  return data.deleteRole;
}

type UserRoleInputPayload = { roleId: string; skillId?: string | null; level?: string | null };
type GraphqlUserPayload = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string };
  userRoles?: Array<{
    id: string;
    role: { id: string; name: string };
    skill: { id: string; name: string } | null;
    level: string | null;
  }>;
};

export async function createUser(input: {
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  userRoles?: UserRoleInputPayload[];
}) {
  const client = createGraphqlClient();
  const data = await client.request<{ createUser: { user: GraphqlUserPayload; plainPin?: string | null } }>(
    CREATE_USER,
    {
      input: {
        fullName: input.name,
        email: input.email,
        roleId: input.roleId,
        isActive: input.isActive,
        ...(input.userRoles ? { userRoles: normalizeUserRolesInput(input.userRoles) } : {})
      }
    }
  );

  return mapGraphqlUser(data.createUser.user);
}

export async function updateUser(input: {
  userId: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  userRoles?: UserRoleInputPayload[];
}) {
  const client = createGraphqlClient();
  const data = await client.request<{ updateUser: GraphqlUserPayload }>(UPDATE_USER, {
    input: {
      userId: input.userId,
      fullName: input.name,
      email: input.email,
      roleId: input.roleId,
      isActive: input.isActive,
      ...(input.userRoles ? { userRoles: normalizeUserRolesInput(input.userRoles) } : {})
    }
  });

  return mapGraphqlUser(data.updateUser);
}

export async function deleteUser(userId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ deleteUser: boolean }>(DELETE_USER, { input: { userId } });
  return data.deleteUser;
}

export async function createQuestion(input: {
  text: string;
  categoryId?: string | null;
  projectId?: string | null;
  sprintId?: string | null;
  isActive: boolean;
}) {
  const client = createGraphqlClient();
  const data = await client.request<{ createQuestion: AdminQuestion }>(CREATE_QUESTION, {
    input: normalizeQuestionInput(input, false)
  });
  return mapGraphqlQuestion(data.createQuestion);
}

export async function updateQuestion(input: {
  id: string;
  text: string;
  categoryId?: string | null;
  projectId?: string | null;
  sprintId?: string | null;
  isActive: boolean;
}) {
  const client = createGraphqlClient();
  const data = await client.request<{ updateQuestion: AdminQuestion }>(UPDATE_QUESTION, {
    input: normalizeQuestionInput(input, true)
  });
  return mapGraphqlQuestion(data.updateQuestion);
}

export async function deleteQuestion(id: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ deleteQuestion: boolean }>(DELETE_QUESTION, { id });
  return data.deleteQuestion;
}

export async function toggleQuestionStatus(id: string, isActive: boolean) {
  const client = createGraphqlClient();
  const data = await client.request<{ toggleQuestionStatus: AdminQuestion }>(TOGGLE_QUESTION_STATUS, {
    input: { id, isActive }
  });
  return mapGraphqlQuestion(data.toggleQuestionStatus);
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

export async function addProjectMembers(
  projectId: string,
  userIds: string[],
  roleId?: string,
  allocationPercentage?: number
) {
  const client = createGraphqlClient();
  const data = await client.request<{
    addProjectMembers: Array<{
      id: string;
      isActive?: boolean;
      roleId?: string | null;
      allocationPercentage?: number | null;
      role?: { id: string; name: string } | null;
      user?: { id: string; fullName: string; email: string; isActive?: boolean; role: { id: string; name: string } };
    }>;
  }>(ADD_PROJECT_MEMBERS, {
    input: {
      projectId,
      userIds,
      roleId,
      ...(typeof allocationPercentage === 'number' ? { allocationPercentage } : {})
    }
  });
  return data.addProjectMembers;
}

export async function removeProjectMember(membershipId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ removeProjectMember: boolean }>(REMOVE_PROJECT_MEMBER, {
    input: { membershipId }
  });
  return data.removeProjectMember;
}

export async function updateProjectMemberStatus(
  membershipId: string,
  isActive?: boolean,
  roleId?: string | null,
  allocationPercentage?: number
) {
  const client = createGraphqlClient();
  const input = {
    membershipId,
    ...(typeof isActive === 'boolean' ? { isActive } : {}),
    ...(roleId !== undefined ? { roleId } : {}),
    ...(typeof allocationPercentage === 'number' ? { allocationPercentage } : {})
  };
  const data = await client.request<{
    updateProjectMemberStatus: { id: string; isActive: boolean; roleId?: string | null; allocationPercentage?: number | null; role?: Role | null };
  }>(UPDATE_PROJECT_MEMBER_STATUS, { input });
  return data.updateProjectMemberStatus;
}

export async function requestRating(sprintId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ requestRating: boolean }>(REQUEST_RATING, { sprintId });
  return data.requestRating;
}

export async function assignProjectMembersToSprint(sprintId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ assignProjectMembersToSprint: boolean }>(
    ASSIGN_PROJECT_MEMBERS_TO_SPRINT,
    { sprintId }
  );
  return data.assignProjectMembersToSprint;
}

export async function generatePeerRatings(sprintId: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ generatePeerRatings: boolean }>(GENERATE_PEER_RATINGS, { sprintId });
  return data.generatePeerRatings;
}

async function getAuthHeaders() {
  const token = await getAdminToken();
  if (token) return { authorization: `Bearer ${token}` };
  const h = await headers();
  return {
    authorization: h.get('authorization') ?? `Bearer ${process.env.ADMIN_API_TOKEN ?? 'mock-admin-token'}`
  };
}

function mapGraphqlUser(user: {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string };
  userRoles?: Array<{
    id: string;
    role: { id: string; name: string };
    skill: { id: string; name: string } | null;
    level: string | null;
  }>;
}): AdminUser {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role.name,
    roleId: user.role.id,
    isActive: Boolean(user.isActive),
    userRoles: (user.userRoles ?? []).map(
      (ur): UserRoleEntry => ({
        id: ur.id,
        role: ur.role,
        skill: ur.skill,
        level: ur.level
      })
    )
  };
}

function normalizeUserRolesInput(userRoles: UserRoleInputPayload[]) {
  return userRoles.map((ur) => ({
    roleId: ur.roleId,
    ...(ur.skillId ? { skillId: ur.skillId } : {}),
    ...(ur.level ? { level: ur.level } : {})
  }));
}

function mapGraphqlQuestion(question: AdminQuestion): AdminQuestion {
  return {
    id: question.id,
    text: question.text,
    categoryId: question.categoryId ?? null,
    category: question.category ?? null,
    projectId: question.projectId ?? null,
    project: question.project ?? null,
    sprintId: question.sprintId ?? null,
    sprint: question.sprint ?? null,
    isActive: Boolean(question.isActive)
  };
}

/** Converts a PostgreSQL date value (may come back as a ms-timestamp string) to YYYY-MM-DD. */
function normalizeSprintDate(value: string | undefined | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const ms = Number(value);
  if (!Number.isNaN(ms) && ms > 0) {
    return new Date(ms).toISOString().slice(0, 10);
  }
  return value;
}

function normalizeQuestionInput(
  input: {
    id?: string;
    text: string;
    categoryId?: string | null;
    projectId?: string | null;
    sprintId?: string | null;
    isActive: boolean;
  },
  includeNulls: boolean
) {
  const { categoryId, projectId, sprintId, ...baseInput } = input;
  const normalizedCategoryId = categoryId || null;
  const normalizedProjectId = projectId || null;
  const normalizedSprintId = sprintId || null;
  const normalized = {
    ...baseInput,
    categoryId: normalizedCategoryId,
    projectId: normalizedProjectId,
    sprintId: normalizedSprintId
  };

  if (includeNulls) {
    return normalized;
  }

  return {
    ...baseInput,
    ...(normalizedCategoryId ? { categoryId: normalizedCategoryId } : {}),
    ...(normalizedProjectId ? { projectId: normalizedProjectId } : {}),
    ...(normalizedSprintId ? { sprintId: normalizedSprintId } : {})
  };
}

export async function getQuestionCategories() {
  const client = createGraphqlClient(await getAuthHeaders());
  const data = await client.request<{ questionCategories: QuestionCategory[] }>(GET_QUESTION_CATEGORIES, {});
  return data.questionCategories;
}

export async function createQuestionCategory(input: {
  name: string;
  description?: string | null;
  isActive?: boolean;
}) {
  const client = createGraphqlClient();
  const data = await client.request<{ createQuestionCategory: QuestionCategory }>(CREATE_QUESTION_CATEGORY, { input });
  return data.createQuestionCategory;
}

export async function updateQuestionCategory(input: {
  id: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}) {
  const client = createGraphqlClient();
  const data = await client.request<{ updateQuestionCategory: QuestionCategory }>(UPDATE_QUESTION_CATEGORY, { input });
  return data.updateQuestionCategory;
}

export async function deleteQuestionCategory(id: string) {
  const client = createGraphqlClient();
  const data = await client.request<{ deleteQuestionCategory: boolean }>(DELETE_QUESTION_CATEGORY, { id });
  return data.deleteQuestionCategory;
}

export async function toggleQuestionCategoryStatus(id: string, isActive: boolean) {
  const client = createGraphqlClient();
  const data = await client.request<{ toggleQuestionCategoryStatus: { id: string; isActive: boolean } }>(
    TOGGLE_QUESTION_CATEGORY_STATUS,
    { input: { id, isActive } }
  );
  return data.toggleQuestionCategoryStatus;
}
