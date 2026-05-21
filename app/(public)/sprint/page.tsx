import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card } from '@/app/components/ui';
import { SprintFeedbackClient } from '@/app/components/sprint-feedback-client';
import { ThemeToggle } from '@/app/components/theme-toggle';
import { getUserProjectSprintData } from '@/app/lib/api/public-api';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 transition-colors duration-300 dark:bg-slate-900 sm:px-6 lg:px-8">
      <ThemeToggle />
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Sprint Feedback</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please provide your feedback on team members</p>
        </div>

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
    const rows = await getUserProjectSprintData(userId, `sprint_auth=${authCookie}`);

    return (
      <PageShell>
        <SprintFeedbackClient rows={rows} />
      </PageShell>
    );
  } catch (err) {
    return (
      <PageShell>
        <Card className="border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/50">
          <p className="text-red-700 dark:text-red-400">
            {err instanceof Error ? err.message : 'Failed to load sprint feedback data'}
          </p>
        </Card>
      </PageShell>
    );
  }
}
