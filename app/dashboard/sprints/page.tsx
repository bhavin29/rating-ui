import { unstable_noStore as noStore } from 'next/cache';
import { SprintsView } from '@/app/components/sprints-view';
import type { Sprint } from '@/app/lib/api/types';
import { getAllSprints, getProjects, getSprintMembers, getSprintRatings } from '@/app/lib/api/admin-api';

export default async function SprintsPage() {
  noStore();
  const [projects, sprints] = await Promise.all([getProjects(), getAllSprints()]);
  const firstProjectId = (projects[0] as any)?.id;
  const sprintRows = await Promise.all(
    (sprints as Sprint[]).map(async (sprint) => {
      const [members, ratings] = await Promise.all([
        getSprintMembers(sprint.id),
        getSprintRatings(sprint.id)
      ]);

      return {
        sprint,
        memberCount: members.length,
        ratedUserCount: ratings.length
      };
    })
  );

  return <SprintsView initialSprints={sprintRows} firstProjectId={firstProjectId} projectCount={projects.length} />;
}
