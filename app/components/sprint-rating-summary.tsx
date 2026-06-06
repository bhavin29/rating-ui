'use client';

import { useState } from 'react';
import { Card, Select } from '@/app/components/ui';
import { useSprintRatingSummary } from '@/app/hooks/use-admin-mutations';
import type { SprintRatingSummaryItem } from '@/app/lib/api/types';

// ─── Star display ─────────────────────────────────────────────────────────────

function StarIcon({ fill }: { fill: 'full' | 'half' | 'empty' }) {
  const path = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
  if (fill === 'full') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-amber-400" aria-hidden="true">
        <path d={path} />
      </svg>
    );
  }
  if (fill === 'half') {
    return (
      <span className="relative inline-block h-5 w-5 flex-shrink-0">
        <svg viewBox="0 0 24 24" className="absolute inset-0 h-5 w-5 fill-slate-200 dark:fill-slate-600" aria-hidden="true">
          <path d={path} />
        </svg>
        <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-amber-400" aria-hidden="true">
            <path d={path} />
          </svg>
        </span>
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-200 dark:fill-slate-600 flex-shrink-0" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/** Converts a 1–10 rating to a 0.5–5 star display (rounds to nearest 0.5). */
function StarDisplay({
  rating,
  size = 'md'
}: {
  rating: number;
  size?: 'sm' | 'md';
}) {
  const starsRaw = rating / 2;
  const stars = Math.round(starsRaw * 2) / 2;
  const label = stars.toFixed(1);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill: 'full' | 'half' | 'empty' =
            stars >= i ? 'full' : stars >= i - 0.5 ? 'half' : 'empty';
          return <StarIcon key={i} fill={fill} />;
        })}
      </div>
      <span
        className={`font-medium text-slate-600 dark:text-slate-400 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        {label} / 5
      </span>
    </div>
  );
}

// ─── Category badge ───────────────────────────────────────────────────────────

function CategoryBadge({ rating }: { rating: number }) {
  if (rating > 7) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        Good
      </span>
    );
  }
  if (rating >= 5) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Average
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Needs Improvement
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-700">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ item }: { item: SprintRatingSummaryItem }) {
  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.sprintName}</p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.projectName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Overall
          </p>
          <StarDisplay rating={item.overallRating} />
        </div>
      </div>

      {/* Per-category breakdown */}
      {item.categories.length > 0 && (
        <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          {item.categories.map((cat) => {
            const name = cat.categoryName ?? 'Uncategorised';
            return (
              <div
                key={cat.categoryId ?? name}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{name}</span>
                  <CategoryBadge rating={cat.averageRating} />
                </div>
                <StarDisplay rating={cat.averageRating} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SprintRatingSummaryProps {
  mode: 'self' | 'admin';
  /** User whose summary is displayed. For self: authenticated user's ID. For admin: selected user's ID. */
  userId: string;
  projects: { id: string; name: string }[];
  sprints: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function SprintRatingSummary({
  mode,
  userId,
  projects,
  sprints,
  categories
}: SprintRatingSummaryProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const summaryQuery = useSprintRatingSummary({
    mode,
    userId: userId || undefined,
    projectId: selectedProject || undefined,
    sprintId: selectedSprint || undefined,
    categoryId: selectedCategory || undefined
  });

  const items = summaryQuery.data ?? [];
  const hasFilters = !!(selectedProject || selectedSprint || selectedCategory);
  const isEmpty = !summaryQuery.isLoading && items.length === 0;

  // No filters + no data → hide the entire section (ratings haven't come in yet).
  // Filters active + no data → keep the section visible and show a "no results" message.
  if (isEmpty && !hasFilters) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Section title */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Rating Summary
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aggregated ratings per sprint and category.
        </p>
      </div>

      {/* Filter bar — always visible */}
      <div className="grid gap-2 sm:grid-cols-3">
        <Select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          aria-label="Filter by project"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedSprint}
          onChange={(e) => setSelectedSprint(e.target.value)}
          aria-label="Filter by sprint"
        >
          <option value="">All Sprints</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Cards */}
      {summaryQuery.isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isEmpty ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No rating data found for the selected filters. Try clearing one or more filters.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <SummaryCard key={`${item.sprintId}-${item.projectId}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
