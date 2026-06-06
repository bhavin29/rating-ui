import { unstable_noStore as noStore } from 'next/cache';
import { QuestionCategoriesView } from '@/app/components/question-categories-view';
import { getQuestionCategories } from '@/app/lib/api/admin-api';

export default async function QuestionCategoriesPage() {
  noStore();
  const categories = await getQuestionCategories();

  return (
    <QuestionCategoriesView
      initialCategories={categories}
      canCreate={true}
      canUpdate={true}
      canDelete={true}
    />
  );
}
