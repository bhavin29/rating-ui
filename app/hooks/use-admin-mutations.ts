'use client';

import { useMutation } from '@tanstack/react-query';
import {
  assignMembersClient,
  assignProjectMembersClient,
  createProjectClient,
  createSprintClient,
  removeProjectMemberClient,
  requestRatingClient,
  updateUserStatusClient,
  updateProjectClient,
  updateSprintClient
} from '@/app/lib/api/admin-client';

export const useCreateProject = () => useMutation({ mutationFn: createProjectClient });
export const useUpdateProject = () => useMutation({ mutationFn: updateProjectClient });
export const useCreateSprint = () => useMutation({ mutationFn: createSprintClient });
export const useUpdateSprint = () => useMutation({ mutationFn: updateSprintClient });
export const useAssignMembers = () =>
  useMutation({
    mutationFn: ({ sprintId, memberIds }: { sprintId: string; memberIds: string[] }) =>
      assignMembersClient({ sprintId, memberIds })
  });
export const useAssignProjectMembers = () =>
  useMutation({
    mutationFn: ({ projectId, memberIds }: { projectId: string; memberIds: string[] }) =>
      assignProjectMembersClient({ projectId, memberIds })
  });
export const useRemoveProjectMember = () =>
  useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      removeProjectMemberClient({ projectId, userId })
  });
export const useUpdateUserStatus = () =>
  useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateUserStatusClient({ userId, isActive })
  });
export const useRequestRating = () =>
  useMutation({ mutationFn: (sprintId: string) => requestRatingClient({ sprintId }) });
