export type Role = { id: string; name: string };

export type AvailableQuestion = {
  id: string;
  text: string;
  category: { id: string; name: string } | null;
};

export type QuestionAssignment = {
  id: string;
  question: {
    id: string;
    text: string;
    category: { id: string; name: string } | null;
  };
};

export type QuestionCategory = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type Skill = { id: string; name: string };

export type UserRoleEntry = {
  id: string;
  role: { id: string; name: string };
  skill: Skill | null;
  level: string | null;
};

export const MEMBER_LEVELS = ['L1', 'L2', 'L3', 'L1_PLUS', 'L2_PLUS', 'L3_PLUS'] as const;
export type MemberLevel = typeof MEMBER_LEVELS[number];

export const LEVEL_LABELS: Record<MemberLevel, string> = {
  L1: '1',
  L2: '2',
  L3: '3',
  L1_PLUS: '1+',
  L2_PLUS: '2+',
  L3_PLUS: '3+'
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  isActive: boolean;
  userRoles: UserRoleEntry[];
};

export type AdminQuestion = {
  id: string;
  text: string;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  projectId?: string | null;
  project?: Project | null;
  sprintId?: string | null;
  sprint?: Sprint | null;
  isActive: boolean;
};

export type Member = {
  id: string;             // userId
  membershipId: string;   // ProjectMember.id — use for update/remove
  name: string;
  email: string;
  role: string;
  roleId: string;
  membershipRole?: string | null;
  membershipRoleId?: string | null;
  isActive?: boolean;
  membershipIsActive?: boolean;
  allocationPercentage: number;
};
export type Project = { id: string; name: string; status?: string | null };
export type Sprint = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  project?: { id: string; name: string };
};

export type Question = { id: string; text: string };
export type SprintRatingSummary = { userId: string; userName: string; averageScore: number };

export type TokenValidationResult = {
  valid: boolean;
  reason?: string | null;
  userId?: string | null;
};

export type SprintRatingQuestion = {
  id: string;
  spr_id: string;
  text: string;
  helpText?: string | null;
  questionId?: string;
  ratingByUserId: string;
  ratingByUserName: string;
  ratingByUserRole: string;
  rating?: number;
  answer?: string;
};

export type SprintRatingData = {
  projectName: string;
  sprintName: string;
  status?: 'DRAFT' | 'SUBMITTED' | null;
  ratedUserName: string;
  ratedUserRole: string;
  spmId: string;
  questions: SprintRatingQuestion[];
};

export type UserProjectSprintData = {
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  sprintId: string;
  sprintStartDate?: string | null;
  sprintEndDate?: string | null;
  sprintName: string;
  sprintProjectMemberId: string;
};
