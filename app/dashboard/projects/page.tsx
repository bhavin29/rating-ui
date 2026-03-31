import { Card } from '@/app/components/ui';
import { ProjectForm } from '@/app/components/project-form';
import { getProjects, getSprintMembers, getSprintRatings, getSprints } from '@/app/lib/api/admin-api';

export default async function ProjectsPage() {
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
  const totalAssignedUsers = projectRows.reduce((total, project) => total + project.assignedUserCount, 0);
  const totalRatedUsers = projectRows.reduce((total, project) => total + project.ratedUserCount, 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-slate-500">Project-level view of sprint volume, assigned users, and rating coverage</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Projects: {projectRows.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Assigned users: {totalAssignedUsers}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Users with ratings: {totalRatedUsers}</span>
        </div>
      </div>
      <Card>
        <ProjectForm />
      </Card>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Project</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600">Sprints</th>
              <th className="px-4 py-3 font-medium text-slate-600">Assigned users</th>
              <th className="px-4 py-3 font-medium text-slate-600">Users with ratings</th>
            </tr>
          </thead>
          <tbody>
            {projectRows.map((project) => (
              <tr key={project.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{project.name}</p>
                    <p className="text-xs text-slate-500">Live project summary from GraphQL</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{project.status ?? 'UNKNOWN'}</td>
                <td className="px-4 py-3 text-slate-700">{project.sprintCount}</td>
                <td className="px-4 py-3 text-slate-700">{project.assignedUserCount}</td>
                <td className="px-4 py-3 text-slate-700">{project.ratedUserCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
