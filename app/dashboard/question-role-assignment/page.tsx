import { unstable_noStore as noStore } from 'next/cache';
import { QuestionRoleAssignment } from '@/app/components/question-role-assignment';
import { getQuestionCategories, getQuestions, getRoles } from '@/app/lib/api/admin-api';

export default async function QuestionRoleAssignmentPage() {
  noStore();
  const [roles, allCategories, allQuestions] = await Promise.all([
    getRoles(),
    getQuestionCategories(),
    getQuestions(),
  ]);

  const categories = allCategories
    .filter((c) => c.isActive)
    .map(({ id, name }) => ({ id, name }));

  const questions = allQuestions.map(({ id, text, category }) => ({
    id,
    text,
    category: category ?? null,
  }));

  return (
    <QuestionRoleAssignment
      initialRoles={roles}
      initialCategories={categories}
      initialQuestions={questions}
    />
  );
}
