import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card } from '@/app/components/ui';
import { SprintFeedbackWrapper } from '@/app/components/sprint-feedback-wrapper';
import { ThemeToggle } from '@/app/components/theme-toggle';
import { getPublicCategories, getUserProjectSprintData } from '@/app/lib/api/public-api';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 transition-colors duration-300 dark:bg-slate-900 sm:px-6 lg:px-8">
      <ThemeToggle />
      <div className="mx-auto max-w-4xl">
        {children}
      </div>
    </main>
  );
}

export default async function SprintFeedbackPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const userId = typeof params.user === 'string' ? params.user : undefined;

  if (!userId?.trim()) {
    notFound();
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('sprint_auth')?.value;

  if (authCookie !== userId) {
    notFound();
  }

  try {
    const [rows, categories] = await Promise.all([
      getUserProjectSprintData(userId, `sprint_auth=${authCookie}`),
      getPublicCategories().catch(() => [])
    ]);

    // Derive unique projects and sprints from rows for the summary filter dropdowns
    const projectMap = new Map(rows.map((r) => [r.projectId, { id: r.projectId, name: r.projectName }]));
    const sprintMap = new Map(rows.map((r) => [r.sprintId, { id: r.sprintId, name: r.sprintName }]));

    return (
      <PageShell>
        <SprintFeedbackWrapper
          userId={userId}
          rows={rows}
          projects={[...projectMap.values()]}
          sprints={[...sprintMap.values()]}
          categories={categories}
        />
      </PageShell>
    );
  } catch (err) {
    return (
      <PageShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Sprint Feedback</h1>
        </div>
        <Card className="border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/50">
          <p className="text-red-700 dark:text-red-400">
            {err instanceof Error ? err.message : 'Failed to load sprint feedback data'}
          </p>
        </Card>
      </PageShell>
    );
  }
}
