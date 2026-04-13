'use client';

import { useMutation } from '@tanstack/react-query';
import {
  assignMembersClient,
  createProjectClient,
  createSprintClient,
  requestRatingClient,
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
export const useRequestRating = () =>
  useMutation({ mutationFn: (sprintId: string) => requestRatingClient({ sprintId }) });
