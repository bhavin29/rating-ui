import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/app/lib/utils/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Workspace</p>
            <h1 className="text-lg font-semibold text-slate-900">Projects, users, and sprint ratings</h1>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
            <Link href="/dashboard">Overview</Link>
            <Link href="/dashboard/projects">Projects</Link>
            <Link href="/dashboard/users">Users</Link>
            <Link href="/dashboard/questions">Questions</Link>
            <Link href="/dashboard/sprints">Sprints</Link>
            <Link href="/dashboard/roles">Roles</Link>
            <Link href="/dashboard/reports">User Reports</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
