'use client';

import { useMutation } from '@tanstack/react-query';
import {
  assignProjectMembersClient,
  createQuestionClient,
  createProjectClient,
  createRoleClient,
  createSprintClient,
  createUserClient,
  deleteQuestionClient,
  deleteUserClient,
  processSprintClient,
  removeProjectMemberClient,
  requestRatingClient,
  toggleQuestionStatusClient,
  updateProjectMemberStatusClient,
  updateProjectClient,
  updateQuestionClient,
  updateRoleClient,
  updateSprintClient,
  updateUserClient,
  deleteRoleClient
} from '@/app/lib/api/admin-client';

export const useCreateProject = () => useMutation({ mutationFn: createProjectClient });
export const useUpdateProject = () => useMutation({ mutationFn: updateProjectClient });
export const useCreateSprint = () => useMutation({ mutationFn: createSprintClient });
export const useUpdateSprint = () => useMutation({ mutationFn: updateSprintClient });
export const useAssignProjectMembers = () =>
  useMutation({
    mutationFn: ({ projectId, memberIds, roleId }: { projectId: string; memberIds: string[]; roleId: string }) =>
      assignProjectMembersClient({ projectId, memberIds, roleId })
  });
export const useRemoveProjectMember = () =>
  useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      removeProjectMemberClient({ projectId, userId })
  });
export const useUpdateProjectMemberStatus = () =>
  useMutation({
    mutationFn: ({
      projectId,
      userId,
      isActive,
      roleId
    }: {
      projectId: string;
      userId: string;
      isActive?: boolean;
      roleId?: string;
    }) => updateProjectMemberStatusClient({ projectId, userId, isActive, roleId })
  });
export const useRequestRating = () =>
  useMutation({ mutationFn: (sprintId: string) => requestRatingClient({ sprintId }) });
export const useProcessSprint = () =>
  useMutation({ mutationFn: (sprintId: string) => processSprintClient({ sprintId }) });


export const useCreateRole = () => useMutation({ mutationFn: createRoleClient });
export const useUpdateRole = () => useMutation({ mutationFn: updateRoleClient });
export const useDeleteRole = () => useMutation({ mutationFn: deleteRoleClient });
export const useCreateUser = () => useMutation({ mutationFn: createUserClient });
export const useUpdateUser = () => useMutation({ mutationFn: updateUserClient });
export const useDeleteUser = () => useMutation({ mutationFn: deleteUserClient });
export const useCreateQuestion = () => useMutation({ mutationFn: createQuestionClient });
export const useUpdateQuestion = () => useMutation({ mutationFn: updateQuestionClient });
export const useDeleteQuestion = () => useMutation({ mutationFn: deleteQuestionClient });
export const useToggleQuestionStatus = () => useMutation({ mutationFn: toggleQuestionStatusClient });
