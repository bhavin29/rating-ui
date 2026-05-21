import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/app/lib/utils/auth';
import { LogoutButton } from '@/app/components/logout-button';
import { ThemeToggle } from '@/app/components/theme-toggle';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100 transition-colors duration-300 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Admin Workspace</p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects, team members, and sprint ratings</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Link href="/dashboard" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">Overview</Link>
            <Link href="/dashboard/projects" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">Projects</Link>
            <Link href="/dashboard/users" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">Team</Link>
            <Link href="/dashboard/questions" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">Questions</Link>
            <Link href="/dashboard/sprints" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">Sprints</Link>
            <Link href="/dashboard/roles" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">Roles</Link>
            <LogoutButton />
            <ThemeToggle variant="inline" />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
