import { Card } from '@/app/components/ui';
import { FeedbackAuthForm } from '@/app/components/feedback-auth-form';

export default async function FeedbackAuthPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const userId = typeof params.user === 'string' ? params.user : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(241,245,249,0.86))]" />
      <div className="relative z-10 w-full">
        {userId?.trim() ? (
          <FeedbackAuthForm userId={userId} />
        ) : (
          <Card className="mx-auto max-w-md border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-red-900">Missing user</h1>
            <p className="mt-2 text-sm text-red-700">Please open the secure link from your email.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
