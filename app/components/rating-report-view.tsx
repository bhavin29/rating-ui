'use client';

import { useState } from 'react';
import { Card, Select } from '@/app/components/ui';
import { SprintRatingSummary } from '@/app/components/sprint-rating-summary';
import type { AdminUser, QuestionCategory } from '@/app/lib/api/types';

interface RatingReportViewProps {
  users: AdminUser[];
  projects: { id: string; name: string }[];
  sprints: { id: string; name: string }[];
  categories: Pick<QuestionCategory, 'id' | 'name'>[];
  loadError?: string;
}

export function RatingReportView({ users, projects, sprints, categories, loadError }: RatingReportViewProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold dark:text-slate-100">Rating Report</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View aggregated sprint ratings for any team member.
        </p>
      </div>

      {/* Backend error */}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {loadError}
        </div>
      )}

      {/* User picker */}
      <Card className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Team Member
        </label>
        <Select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="max-w-sm"
        >
          <option value="">— Select a team member —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </Select>
        {!selectedUserId && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Select a team member to view their rating report.
          </p>
        )}
      </Card>

      {/* Summary */}
      {selectedUser ? (
        <SprintRatingSummary
          mode="admin"
          userId={selectedUser.id}
          projects={projects}
          sprints={sprints}
          categories={categories}
        />
      ) : (
        <Card className="p-10 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a team member above to view their rating report.
          </p>
        </Card>
      )}
    </section>
  );
}
