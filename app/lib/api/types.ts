export type Role = { id: string; name: string };

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  isActive: boolean;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  isActive?: boolean;
  membershipIsActive?: boolean;
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
