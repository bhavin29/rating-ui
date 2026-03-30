export type Member = { id: string; name: string; email?: string; role: string };
export type Project = { id: string; name: string; status?: string | null };
export type Sprint = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  project: { id: string; name: string };
};

export type Question = { id: string; text: string; role: string };
export type QuestionGroup = { role: string; questions: Array<{ id: string; text: string }> };

export type ValidateTokenPayload = {
  isValid: boolean;
  hasSubmitted: boolean;
  sprint: { id: string; name: string };
  rater: { id: string; name: string };
  members: Member[];
  questionsByRole: QuestionGroup[];
};
