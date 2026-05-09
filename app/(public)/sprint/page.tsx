import { Card } from '@/app/components/ui';
import { SprintFeedbackClient } from '@/app/components/sprint-feedback-client';
import { getUserProjectSprintData } from '@/app/lib/api/public-api';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Sprint Feedback</h1>
          <p className="mt-2 text-sm text-slate-600">Please provide your feedback on team members</p>
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
    return (
      <PageShell>
        <Card className="border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Missing user parameter</p>
        </Card>
      </PageShell>
    );
  }

  try {
    const rows = await getUserProjectSprintData(userId);

    return (
      <PageShell>
        <SprintFeedbackClient rows={rows} />
      </PageShell>
    );
  } catch (err) {
    return (
      <PageShell>
        <Card className="border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">
            {err instanceof Error ? err.message : 'Failed to load sprint feedback data'}
          </p>
        </Card>
      </PageShell>
    );
  }
}
