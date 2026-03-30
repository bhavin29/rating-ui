import Link from 'next/link';
import { RequestRatingButton } from '@/app/components/request-rating-button';
import { SprintForm } from '@/app/components/sprint-form';
import { Card } from '@/app/components/ui';
import { getProjects, getSprints } from '@/app/lib/api/admin-api';

export default async function SprintsPage() {
  const [projects, sprints] = await Promise.all([getProjects(), getSprints()]);
  const firstProjectId = (projects[0] as any)?.id;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Sprints</h1>
      <Card>
        <SprintForm projectId={firstProjectId} />
      </Card>
      <div className="space-y-3">
        {(sprints as any[]).map((sprint) => (
          <Card key={sprint.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{sprint.name}</p>
              <p className="text-sm text-slate-500">{sprint.project?.name} · {sprint.status}</p>
            </div>
            <div className="flex gap-2">
              <Link className="rounded border px-3 py-2 text-sm" href={`/dashboard/sprints/${sprint.id}`}>
                Members
              </Link>
              <RequestRatingButton sprintId={sprint.id} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
