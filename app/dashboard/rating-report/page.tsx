import { unstable_noStore as noStore } from 'next/cache';
import { RatingReportView } from '@/app/components/rating-report-view';
import { getAllSprints, getProjects, getQuestionCategories, getUsers } from '@/app/lib/api/admin-api';

export default async function RatingReportPage() {
  noStore();

  try {
    const [users, projects, sprints, allCategories] = await Promise.all([
      getUsers(),
      getProjects(),
      getAllSprints(),
      getQuestionCategories()
    ]);

    const categories = allCategories
      .filter((c) => c.isActive)
      .map(({ id, name }) => ({ id, name }));

    return (
      <RatingReportView
        users={users}
        projects={projects}
        sprints={sprints}
        categories={categories}
      />
    );
  } catch {
    return (
      <RatingReportView
        users={[]}
        projects={[]}
        sprints={[]}
        categories={[]}
        loadError="Could not connect to the backend. Please ensure the API server is running and refresh the page."
      />
    );
  }
}
