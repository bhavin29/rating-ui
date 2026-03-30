import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/app/lib/utils/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl gap-4 p-4 text-sm font-medium">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/projects">Projects</Link>
          <Link href="/dashboard/sprints">Sprints</Link>
          <Link href="/dashboard/reports">Reports</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
