'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  assignProjectMembersClient,
  assignQuestionsToRoleClient,
  createQuestionCategoryClient,
  createQuestionClient,
  createProjectClient,
  createRoleClient,
  createSprintClient,
  createUserClient,
  deleteQuestionCategoryClient,
  deleteQuestionClient,
  deleteUserClient,
  getAssignedQuestionsClient,
  getAvailableQuestionsClient,
  getSkillsClient,
  processSprintClient,
  removeProjectMemberClient,
  removeQuestionFromRoleClient,
  requestRatingClient,
  sendSprintFeedbackEmailClient,
  toggleQuestionCategoryStatusClient,
  toggleQuestionStatusClient,
  updateProjectMemberStatusClient,
  updateProjectClient,
  updateQuestionCategoryClient,
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
    mutationFn: ({
      projectId,
      memberIds,
      roleId,
      allocationPercentage
    }: {
      projectId: string;
      memberIds: string[];
      roleId: string;
      allocationPercentage?: number;
    }) => assignProjectMembersClient({ projectId, memberIds, roleId, allocationPercentage })
  });
export const useRemoveProjectMember = () =>
  useMutation({
    mutationFn: ({ membershipId }: { membershipId: string }) =>
      removeProjectMemberClient({ membershipId })
  });
export const useUpdateProjectMemberStatus = () =>
  useMutation({
    mutationFn: ({
      membershipId,
      isActive,
      roleId,
      allocationPercentage
    }: {
      membershipId: string;
      isActive?: boolean;
      roleId?: string | null;
      allocationPercentage?: number;
    }) => updateProjectMemberStatusClient({ membershipId, isActive, roleId, allocationPercentage })
  });
export const useRequestRating = () =>
  useMutation({ mutationFn: (sprintId: string) => requestRatingClient({ sprintId }) });
export const useProcessSprint = () =>
  useMutation({ mutationFn: (sprintId: string) => processSprintClient({ sprintId }) });


export const useGetSkills = () => useQuery({ queryKey: ['skills'], queryFn: getSkillsClient });

export const useAvailableQuestions = (
  params: { roleId: string; search?: string; categoryId?: string } | null
) =>
  useQuery({
    queryKey: ['available-questions', params?.roleId, params?.search ?? '', params?.categoryId ?? ''],
    queryFn: () => getAvailableQuestionsClient(params!),
    enabled: !!params?.roleId,
    staleTime: 0,
  });

export const useAssignedQuestions = (roleId: string | null) =>
  useQuery({
    queryKey: ['assigned-questions', roleId],
    queryFn: () => getAssignedQuestionsClient(roleId!),
    enabled: !!roleId,
    staleTime: 0,
  });

export const useAssignQuestionsToRole = () =>
  useMutation({ mutationFn: assignQuestionsToRoleClient });

export const useRemoveQuestionFromRole = () =>
  useMutation({ mutationFn: removeQuestionFromRoleClient });
export const useCreateRole = () => useMutation({ mutationFn: createRoleClient });
export const useUpdateRole = () => useMutation({ mutationFn: updateRoleClient });
export const useDeleteRole = () => useMutation({ mutationFn: deleteRoleClient });
export const useCreateUser = () => useMutation({ mutationFn: createUserClient });
export const useSendSprintFeedbackEmail = () => useMutation({ mutationFn: sendSprintFeedbackEmailClient });
export const useUpdateUser = () => useMutation({ mutationFn: updateUserClient });
export const useDeleteUser = () => useMutation({ mutationFn: deleteUserClient });
export const useCreateQuestion = () => useMutation({ mutationFn: createQuestionClient });
export const useUpdateQuestion = () => useMutation({ mutationFn: updateQuestionClient });
export const useDeleteQuestion = () => useMutation({ mutationFn: deleteQuestionClient });
export const useToggleQuestionStatus = () => useMutation({ mutationFn: toggleQuestionStatusClient });
export const useCreateQuestionCategory = () => useMutation({ mutationFn: createQuestionCategoryClient });
export const useUpdateQuestionCategory = () => useMutation({ mutationFn: updateQuestionCategoryClient });
export const useDeleteQuestionCategory = () => useMutation({ mutationFn: deleteQuestionCategoryClient });
export const useToggleQuestionCategoryStatus = () => useMutation({ mutationFn: toggleQuestionCategoryStatusClient });
