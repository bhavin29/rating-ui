import Link from 'next/link';
import { DashboardCard } from '@/app/components/dashboard-card';
import type { Sprint } from '@/app/lib/api/types';
import { getAllSprints, getProjectMembers, getProjects } from '@/app/lib/api/admin-api';

export default async function DashboardPage() {
  const [projects, sprints] = await Promise.all([getProjects(), getAllSprints()]);
  const activeSprintCount = (sprints as Sprint[]).filter(isActiveSprint).length;
  const projectMemberCounts = new Map(
    await Promise.all(projects.map(async (project) => [project.id, (await getProjectMembers(project.id)).length] as const))
  );
  const assignedUserCount = (sprints as Sprint[]).reduce(
    (total, sprint) => total + (sprint.project?.id ? projectMemberCounts.get(sprint.project.id) ?? 0 : 0),
    0
  );

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold dark:text-slate-100">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live overview of projects, sprint coverage, and team member rating activity</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard title="Projects" value={projects.length} subtitle="Projects returned by GraphQL" />
        <DashboardCard title="Sprints" value={sprints.length} subtitle="All discovered sprint records" />
        <DashboardCard title="Active Sprints" value={activeSprintCount} subtitle="Active based on sprint dates" />
        <DashboardCard title="Assigned Team Members" value={assignedUserCount} subtitle="Project members across sprint projects" />
      </div>
      <div className="flex gap-2 text-sm">
        <Link className="rounded border border-slate-300 bg-white px-3 py-2 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" href="/dashboard/projects">
          Manage Projects
        </Link>
        <Link className="rounded border border-slate-300 bg-white px-3 py-2 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" href="/dashboard/users">
          Manage Team
        </Link>
        <Link className="rounded border border-slate-300 bg-white px-3 py-2 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" href="/dashboard/questions">
          Manage Questions
        </Link>
        <Link className="rounded border border-slate-300 bg-white px-3 py-2 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" href="/dashboard/sprints">
          Manage Sprints
        </Link>
        <Link className="rounded border border-slate-300 bg-white px-3 py-2 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" href="/dashboard/roles">
          Manage Roles
        </Link>
      </div>
    </section>
  );
}

function isActiveSprint(sprint: Sprint) {
  const today = new Date();
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);

  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= today && today <= end;
}
