import { unstable_noStore as noStore } from 'next/cache';
import { ProjectsView } from '@/app/components/projects-view';
import { getProjects, getSprintMembers, getSprintRatings, getSprints } from '@/app/lib/api/admin-api';

export default async function ProjectsPage() {
  noStore();
  const projects = await getProjects();
  const projectRows = await Promise.all(
    projects.map(async (project) => {
      const sprints = await getSprints(project.id);
      const sprintStats = await Promise.all(
        sprints.map(async (sprint) => {
          const [members, ratings] = await Promise.all([
            getSprintMembers(sprint.id),
            getSprintRatings(sprint.id)
          ]);

          return {
            memberCount: members.length,
            ratedUserCount: ratings.length
          };
        })
      );

      return {
        ...project,
        sprintCount: sprints.length,
        assignedUserCount: sprintStats.reduce((total, item) => total + item.memberCount, 0),
        ratedUserCount: sprintStats.reduce((total, item) => total + item.ratedUserCount, 0)
      };
    })
  );

  return <ProjectsView initialProjects={projectRows} />;
}
