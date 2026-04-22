import { unstable_noStore as noStore } from 'next/cache';
import { QuestionsView } from '@/app/components/questions-view';
import { getQuestions, getRoles } from '@/app/lib/api/admin-api';

export default async function QuestionsPage() {
  noStore();
  const [questions, roles] = await Promise.all([getQuestions(), getRoles()]);

  return <QuestionsView initialQuestions={questions} roles={roles} />;
}
