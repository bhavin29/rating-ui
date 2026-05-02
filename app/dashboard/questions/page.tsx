import { unstable_noStore as noStore } from 'next/cache';
import { QuestionsView } from '@/app/components/questions-view';
import { getAllSprints, getProjects, getQuestions, getRoles } from '@/app/lib/api/admin-api';

export default async function QuestionsPage() {
  noStore();
  const [questions, roles, projects, sprints] = await Promise.all([
    getQuestions(),
    getRoles(),
    getProjects(),
    getAllSprints()
  ]);

  return <QuestionsView initialQuestions={questions} roles={roles} projects={projects} sprints={sprints} />;
}
