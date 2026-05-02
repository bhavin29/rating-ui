import { Suspense } from 'react';
import { Card } from '@/app/components/ui';
import { SprintRatingFormWrapper } from '@/app/components/sprint-rating-form-wrapper';
import { getSprintRatingRequest } from '@/app/lib/api/public-api';

async function SprintRatingContent({ spmId }: { spmId: string }) {
  let data;
  let error = null;

  try {
    data = await getSprintRatingRequest(spmId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load rating data';
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 p-6 text-center">
        <p className="text-yellow-700">No rating data available</p>
      </Card>
    );
  }

  return (
    <SprintRatingFormWrapper data={data} />
  );
}

function LoadingSpinner() {
  return (
    <Card className="p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      <p className="mt-4 text-sm text-slate-600">Loading rating data...</p>
    </Card>
  );
}

export default async function SprintRatingPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Accept both 'spmId' and 'spmid' for compatibility
  const spmId = (params.spmId || params.spmid) && 
    typeof (params.spmId || params.spmid) === 'string' 
    ? (params.spmId || params.spmid) as string 
    : undefined;

  if (!spmId || spmId.trim() === '') {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Card className="border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">Missing spmId parameter</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Sprint Feedback</h1>
          <p className="mt-2 text-sm text-slate-600">Please provide your feedback on team members</p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <SprintRatingContent spmId={spmId} />
        </Suspense>
      </div>
    </main>
  );
}
