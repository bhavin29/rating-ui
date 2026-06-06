'use client';

import { useState } from 'react';
import { SprintFeedbackClient } from '@/app/components/sprint-feedback-client';
import { SprintRatingSummary } from '@/app/components/sprint-rating-summary';
import type { UserProjectSprintData } from '@/app/lib/api/types';

interface SprintFeedbackWrapperProps {
  userId: string;
  rows: UserProjectSprintData[];
  projects: { id: string; name: string }[];
  sprints: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function SprintFeedbackWrapper({
  userId,
  rows,
  projects,
  sprints,
  categories,
}: SprintFeedbackWrapperProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page header — title on the left, Rating Summary toggle on the right */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Sprint Feedback
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Please provide your feedback on team members
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSummaryOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-expanded={summaryOpen}
          aria-label={summaryOpen ? 'Collapse rating summary' : 'Expand rating summary'}
        >
          {/* Star / rating icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-amber-500"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
              clipRule="evenodd"
            />
          </svg>
          Rating Summary
          {/* Chevron — flips when open */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Collapsible Rating Summary — hidden by default */}
      {summaryOpen && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <SprintRatingSummary
            mode="self"
            userId={userId}
            projects={projects}
            sprints={sprints}
            categories={categories}
          />
        </div>
      )}

      {/* Sprint feedback form — always visible */}
      <SprintFeedbackClient rows={rows} />
    </div>
  );
}
