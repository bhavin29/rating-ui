import Link from 'next/link';
import { DashboardCard } from '@/app/components/dashboard-card';
import { getProjects, getSprints } from '@/app/lib/api/admin-api';

export default async function DashboardPage() {
  const [projects, sprints] = await Promise.all([getProjects(), getSprints()]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Projects" value={projects.length} />
        <DashboardCard title="Sprints" value={sprints.length} />
        <DashboardCard title="Active Sprints" value={sprints.filter((s: any) => s.status === 'ACTIVE').length} />
      </div>
      <div className="flex gap-2 text-sm">
        <Link className="rounded border border-slate-300 bg-white px-3 py-2" href="/dashboard/projects">
          Manage Projects
        </Link>
        <Link className="rounded border border-slate-300 bg-white px-3 py-2" href="/dashboard/sprints">
          Manage Sprints
        </Link>
      </div>
    </section>
  );
}
