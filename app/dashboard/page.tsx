import Link from 'next/link';
import { Card } from '@/app/components/ui';
import { DashboardCard } from '@/app/components/dashboard-card';
import type { Sprint } from '@/app/lib/api/types';
import { getAllSprints, getProjects, getSprintMembers, getSprintRatings } from '@/app/lib/api/admin-api';

export default async function DashboardPage() {
  const [projects, sprints] = await Promise.all([getProjects(), getAllSprints()]);
  const activeSprintCount = (sprints as Sprint[]).filter(isActiveSprint).length;
  const sprintUserStats = await Promise.all(
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
  const assignedUserCount = sprintUserStats.reduce((total, item) => total + item.memberCount, 0);
  const ratedUserCount = sprintUserStats.reduce((total, item) => total + item.ratedUserCount, 0);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Live overview of projects, sprint coverage, and user rating activity</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard title="Projects" value={projects.length} subtitle="Projects returned by GraphQL" />
        <DashboardCard title="Sprints" value={sprints.length} subtitle="All discovered sprint records" />
        <DashboardCard title="Active Sprints" value={activeSprintCount} subtitle="Active based on sprint dates" />
        <DashboardCard title="Assigned Users" value={assignedUserCount} subtitle="Total sprint member assignments" />
      </div>
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">User Activity Snapshot</h2>
            <p className="text-sm text-slate-500">Live counts from sprint membership and rating summaries</p>
          </div>
          <p className="text-sm text-slate-600">
            Rated users: <span className="font-semibold text-slate-900">{ratedUserCount}</span>
          </p>
        </div>
        {sprintUserStats.length === 0 ? (
          <p className="text-sm text-slate-500">No sprint-level user activity is available yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Sprint</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Project</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Assigned users</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Users with ratings</th>
                </tr>
              </thead>
              <tbody>
                {sprintUserStats.map(({ sprint, memberCount, ratedUserCount }) => (
                  <tr key={sprint.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-900">{sprint.name}</td>
                    <td className="px-4 py-3 text-slate-600">{sprint.project?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{memberCount}</td>
                    <td className="px-4 py-3 text-slate-700">{ratedUserCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <div className="flex gap-2 text-sm">
        <Link className="rounded border border-slate-300 bg-white px-3 py-2" href="/dashboard/projects">
          Manage Projects
        </Link>
        <Link className="rounded border border-slate-300 bg-white px-3 py-2" href="/dashboard/sprints">
          Manage Sprints & Users
        </Link>
        <Link className="rounded border border-slate-300 bg-white px-3 py-2" href="/dashboard/reports">
          View User Reports
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
