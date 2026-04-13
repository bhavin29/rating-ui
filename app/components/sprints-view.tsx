'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RequestRatingButton } from '@/app/components/request-rating-button';
import { SprintForm } from '@/app/components/sprint-form';
import { Card } from '@/app/components/ui';
import type { Sprint } from '@/app/lib/api/types';

type SprintRow = {
  sprint: Sprint;
  memberCount: number;
  ratedUserCount: number;
};

export function SprintsView({
  initialSprints,
  firstProjectId,
  projectCount
}: {
  initialSprints: SprintRow[];
  firstProjectId?: string;
  projectCount: number;
}) {
  const [sprintRows, setSprintRows] = useState(initialSprints);

  const assignedUserCount = sprintRows.reduce((total, item) => total + item.memberCount, 0);
  const ratedUserCount = sprintRows.reduce((total, item) => total + item.ratedUserCount, 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sprints</h1>
          <p className="text-sm text-slate-500">Sprint planning, assigned users, and rating-request activity</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Projects: {projectCount}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Sprints: {sprintRows.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Assigned users: {assignedUserCount}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Users with ratings: {ratedUserCount}</span>
        </div>
      </div>
      <Card>
        <SprintForm
          projectId={firstProjectId}
          onCreated={(sprint) => {
            setSprintRows((current) => {
              if (current.some((item) => item.sprint.id === sprint.id)) {
                return current;
              }

              return [
                {
                  sprint: {
                    id: sprint.id,
                    name: sprint.name,
                    startDate: sprint.startDate,
                    endDate: sprint.endDate,
                    project: sprint.project
                  },
                  memberCount: 0,
                  ratedUserCount: 0
                },
                ...current
              ];
            });
          }}
        />
      </Card>
      <div className="space-y-3">
        {sprintRows.map(({ sprint, memberCount, ratedUserCount }) => (
          <Card key={sprint.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{sprint.name}</p>
              <p className="text-sm text-slate-500">{formatSprintMeta(sprint)}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-2 py-1">Assigned users: {memberCount}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">Users with ratings: {ratedUserCount}</span>
              </div>
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

function formatSprintMeta(sprint: Sprint) {
  const parts = [sprint.project?.name, formatDateRange(sprint.startDate, sprint.endDate)].filter(Boolean);
  return parts.join(' | ');
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return undefined;
  }

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}
