import { unstable_noStore as noStore } from 'next/cache';
import { ProjectsView } from '@/app/components/projects-view';
import { getProjectMembers, getProjects, getSprintRatings } from '@/app/lib/api/admin-api';

export default async function ProjectsPage() {
  noStore();
  const projects = await getProjects();
  const projectRows = await Promise.all(
    projects.map(async (project) => {
      const projectMembers = await getProjectMembers(project.id);
      return {
        ...project,
        assignedUserCount: projectMembers.length,
        ratedUserCount: 0
      };
    })
  );

  return <ProjectsView initialProjects={projectRows} />;
}
