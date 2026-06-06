import { unstable_noStore as noStore } from 'next/cache';
import { SprintsView } from '@/app/components/sprints-view';
import type { Sprint } from '@/app/lib/api/types';
import { getAllSprints, getSprintRatings } from '@/app/lib/api/admin-api';

export default async function SprintsPage() {
  noStore();
  const sprints = await getAllSprints();
  const sprintRows = await Promise.all(
    (sprints as Sprint[]).map(async (sprint) => {
      const ratings = await getSprintRatings(sprint.id);
      return { sprint, ratedUserCount: ratings.length };
    })
  );

  return <SprintsView initialSprints={sprintRows} />;
}
