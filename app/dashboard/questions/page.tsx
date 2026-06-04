import { unstable_noStore as noStore } from 'next/cache';
import { QuestionsView } from '@/app/components/questions-view';
import { getAllSprints, getProjects, getQuestionCategories, getQuestions } from '@/app/lib/api/admin-api';

export default async function QuestionsPage() {
  noStore();
  const [questions, categories, projects, sprints] = await Promise.all([
    getQuestions(),
    getQuestionCategories(),
    getProjects(),
    getAllSprints()
  ]);

  return <QuestionsView initialQuestions={questions} categories={categories} projects={projects} sprints={sprints} />;
}
