import { unstable_noStore as noStore } from 'next/cache';
import { ProjectsView } from '@/app/components/projects-view';
import { getProjectMembers, getProjects, getSprintRatings, getSprints } from '@/app/lib/api/admin-api';

export default async function ProjectsPage() {
  noStore();
  const projects = await getProjects();
  const projectRows = await Promise.all(
    projects.map(async (project) => {
      const [projectMembers, sprints] = await Promise.all([getProjectMembers(project.id), getSprints(project.id)]);
      const sprintStats = await Promise.all(
        sprints.map(async (sprint) => {
          const ratings = await getSprintRatings(sprint.id);

          return {
            ratedUserCount: ratings.length
          };
        })
      );

      return {
        ...project,
        sprintCount: sprints.length,
        assignedUserCount: projectMembers.length,
        ratedUserCount: sprintStats.reduce((total, item) => total + item.ratedUserCount, 0)
      };
    })
  );

  return <ProjectsView initialProjects={projectRows} />;
}
