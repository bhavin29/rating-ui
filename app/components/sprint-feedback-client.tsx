'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Select } from '@/app/components/ui';
import { SprintRatingFormWrapper } from '@/app/components/sprint-rating-form-wrapper';
import { cn } from '@/app/lib/utils/cn';
import type { SprintRatingData, UserProjectSprintData } from '@/app/lib/api/types';

type ProjectGroup = {
  projectId: string;
  projectName: string;
  sprints: UserProjectSprintData[];
};

function sortSprintsByLatest(sprints: UserProjectSprintData[]) {
  return [...sprints].sort((a, b) => {
    const aStart = a.sprintStartDate ? Date.parse(a.sprintStartDate) : 0;
    const bStart = b.sprintStartDate ? Date.parse(b.sprintStartDate) : 0;
    const aEnd = a.sprintEndDate ? Date.parse(a.sprintEndDate) : 0;
    const bEnd = b.sprintEndDate ? Date.parse(b.sprintEndDate) : 0;

    if (bStart !== aStart) return bStart - aStart;
    if (bEnd !== aEnd) return bEnd - aEnd;

    return sprints.indexOf(b) - sprints.indexOf(a);
  });
}

function formatSprintDate(value?: string | null) {
  if (!value) return 'No date';

  const normalizedValue = value.trim();
  const date = /^\d+$/.test(normalizedValue)
    ? new Date(Number(normalizedValue))
    : new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);

  return `${day}-${month}-${year}`;
}

function getSprintOptionLabel(sprint: UserProjectSprintData) {
  return `${sprint.sprintName} (${formatSprintDate(sprint.sprintStartDate)} to ${formatSprintDate(
    sprint.sprintEndDate
  )})`;
}

function groupByProject(rows: UserProjectSprintData[]) {
  const groups = new Map<string, ProjectGroup>();

  rows.forEach((row) => {
    const existing = groups.get(row.projectId);

    if (existing) {
      existing.sprints.push(row);
      return;
    }

    groups.set(row.projectId, {
      projectId: row.projectId,
      projectName: row.projectName,
      sprints: [row]
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    sprints: sortSprintsByLatest(group.sprints)
  }));
}

function RatingLoader({ spmId }: { spmId: string }) {
  const [data, setData] = useState<SprintRatingData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRating() {
      setIsLoading(true);
      setError('');
      setData(null);

      try {
        const response = await fetch(
          `/api/sprint-rating/request?spmid=${encodeURIComponent(spmId)}`,
          { signal: controller.signal }
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load rating data');
        }

        setData(payload);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load rating data');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRating();

    return () => controller.abort();
  }, [spmId]);

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-300" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading rating data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/50">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-950/50">
        <p className="text-yellow-700 dark:text-yellow-400">No rating data available for this sprint.</p>
      </Card>
    );
  }

  return <SprintRatingFormWrapper key={spmId} data={data} />;
}

export function SprintFeedbackClient({ rows }: { rows: UserProjectSprintData[] }) {
  const projects = useMemo(() => groupByProject(rows), [rows]);
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.projectId ?? '');
  const [selectedSprintByProject, setSelectedSprintByProject] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      projects
        .filter((project) => project.sprints.length > 0)
        .map((project) => [project.projectId, project.sprints[0].sprintProjectMemberId])
    )
  );

  const activeProject = projects.find((project) => project.projectId === activeProjectId) ?? projects[0];
  const selectedSprintProjectMemberId = activeProject
    ? selectedSprintByProject[activeProject.projectId] ?? activeProject.sprints[0]?.sprintProjectMemberId ?? ''
    : '';

  if (projects.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-950/50">
        <p className="font-medium text-yellow-800 dark:text-yellow-300">No projects available.</p>
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">There are no sprint feedback requests for this user.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        <div className="flex min-w-full gap-2">
          {projects.map((project) => (
            <button
              key={project.projectId}
              type="button"
              onClick={() => setActiveProjectId(project.projectId)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition',
                activeProject?.projectId === project.projectId
                  ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
              )}
            >
              {project.projectName}
            </button>
          ))}
        </div>
      </div>

      {activeProject && activeProject.sprints.length > 0 ? (
        <>
          <div className="max-w-md space-y-2">
            <label htmlFor="sprint-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sprint
            </label>
            <Select
              id="sprint-select"
              value={selectedSprintProjectMemberId}
              onChange={(event) =>
                setSelectedSprintByProject((previous) => ({
                  ...previous,
                  [activeProject.projectId]: event.target.value
                }))
              }
            >
              {activeProject.sprints.map((sprint) => (
                <option
                  key={sprint.sprintProjectMemberId}
                  value={sprint.sprintProjectMemberId}
                >
                  {getSprintOptionLabel(sprint)}
                </option>
              ))}
            </Select>
          </div>

          <RatingLoader spmId={selectedSprintProjectMemberId} />
        </>
      ) : (
        <Card className="border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-950/50">
          <p className="font-medium text-yellow-800 dark:text-yellow-300">No sprints available.</p>
          <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">This project does not have sprint feedback to complete.</p>
        </Card>
      )}
    </div>
  );
}
