import { unstable_noStore as noStore } from 'next/cache';
import { SprintsView } from '@/app/components/sprints-view';
import type { Sprint } from '@/app/lib/api/types';
import { getAllSprints, getProjectMembers, getProjects, getSprintRatings } from '@/app/lib/api/admin-api';

export default async function SprintsPage() {
  noStore();
  const [projects, sprints] = await Promise.all([getProjects(), getAllSprints()]);
  const firstProjectId = projects[0]?.id;
  const projectMemberCounts = new Map(
    await Promise.all(projects.map(async (project) => [project.id, (await getProjectMembers(project.id)).length] as const))
  );
  const sprintRows = await Promise.all(
    (sprints as Sprint[]).map(async (sprint) => {
      const ratings = await getSprintRatings(sprint.id);

      return {
        sprint,
        memberCount: sprint.project?.id ? projectMemberCounts.get(sprint.project.id) ?? 0 : 0,
        ratedUserCount: ratings.length
      };
    })
  );

  return <SprintsView initialSprints={sprintRows} firstProjectId={firstProjectId} projectCount={projects.length} />;
}
