'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Input, Select } from '@/app/components/ui';
import {
  useAssignedQuestions,
  useAssignQuestionsToRole,
  useRemoveQuestionFromRole,
} from '@/app/hooks/use-admin-mutations';
import type { AvailableQuestion, QuestionAssignment, QuestionCategory, Role } from '@/app/lib/api/types';

// ─── Category badge ───────────────────────────────────────────────────────────
const BADGE_CLASSES = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
];
function categoryBadgeClass(categoryId: string) {
  const hash = categoryId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return BADGE_CLASSES[hash % BADGE_CLASSES.length];
}

type Notification = { tone: 'success' | 'error'; message: string };

// ─── Component ────────────────────────────────────────────────────────────────

export function QuestionRoleAssignment({
  initialRoles,
  initialCategories,
  initialQuestions,
}: {
  initialRoles: Role[];
  initialCategories: Pick<QuestionCategory, 'id' | 'name'>[];
  initialQuestions: AvailableQuestion[];
}) {
  const queryClient = useQueryClient();

  // ── Core state ─────────────────────────────────────────────────────────────
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<Notification | null>(null);

  // ── Staging state (local only — nothing saved until "Save Assignments") ────
  // Questions moved from left → right but not yet committed to the database.
  const [stagedToAdd, setStagedToAdd] = useState<AvailableQuestion[]>([]);
  // Assignment IDs staged for removal (hidden from right panel until saved).
  const [stagedToRemoveIds, setStagedToRemoveIds] = useState<Set<string>>(new Set());
  // Questions already committed to the database this session but not yet
  // confirmed by a server refetch. Keeps right panel populated after Save.
  const [localSaved, setLocalSaved] = useState<QuestionAssignment[]>([]);

  const selectedRole = initialRoles.find((r) => r.id === selectedRoleId) ?? null;

  // ── Queries ────────────────────────────────────────────────────────────────
  // Available questions are derived client-side from initialQuestions minus
  // whatever is already assigned — no separate getAvailableQuestions API needed.
  const assignedQuery = useAssignedQuestions(selectedRoleId || null);

  // ── Derived display lists ──────────────────────────────────────────────────

  /** IDs that should not appear in the left panel (assigned, locally saved, or staged). */
  const excludedIds = useMemo(() => new Set([
    ...(assignedQuery.data ?? []).map((a) => a.question.id),
    ...localSaved.map((a) => a.question.id),
    ...stagedToAdd.map((q) => q.id),
  ]), [assignedQuery.data, localSaved, stagedToAdd]);

  /** Left panel: full question bank minus excluded IDs + client-side filters. */
  const displayAvailable = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return initialQuestions.filter((q: AvailableQuestion) => {
      if (selectedRoleId && excludedIds.has(q.id)) return false;
      const matchesSearch = !term || q.text.toLowerCase().includes(term);
      const matchesCategory = !selectedCategoryId || q.category?.id === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [initialQuestions, selectedRoleId, excludedIds, searchText, selectedCategoryId]);

  /** Right panel: server data + locally-saved (de-duped) + staged additions. */
  const displayAssigned = useMemo(() => {
    const serverData = assignedQuery.data ?? [];
    const serverQuestionIds = new Set(serverData.map((a) => a.question.id));
    // Once server confirms an item, drop it from localSaved to avoid duplicates.
    const localOnly = localSaved.filter((a) => !serverQuestionIds.has(a.question.id));
    return [
      ...[...serverData, ...localOnly].filter((a) => !stagedToRemoveIds.has(a.id)),
      ...stagedToAdd.map((q) => ({ id: `__new_${q.id}`, question: q, isNew: true })),
    ];
  }, [assignedQuery.data, localSaved, stagedToRemoveIds, stagedToAdd]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const assignMutation = useAssignQuestionsToRole();
  const removeMutation = useRemoveQuestionFromRole();
  const isSaving = assignMutation.isPending || removeMutation.isPending;

  const hasChanges = stagedToAdd.length > 0 || stagedToRemoveIds.size > 0;

  // ── Role change ────────────────────────────────────────────────────────────
  function handleRoleChange(roleId: string) {
    setSelectedRoleId(roleId);
    setCheckedIds(new Set());
    setStagedToAdd([]);
    setStagedToRemoveIds(new Set());
    setLocalSaved([]);
    setNotification(null);
  }

  // ── Stage: move question(s) from left → right (no API call yet) ────────────
  const stageAdd = useCallback((questions: AvailableQuestion[]) => {
    setStagedToAdd((prev) => {
      const existing = new Set(prev.map((q) => q.id));
      return [...prev, ...questions.filter((q) => !existing.has(q.id))];
    });
    setCheckedIds((prev) => {
      const next = new Set(prev);
      questions.forEach((q) => next.delete(q.id));
      return next;
    });
  }, []);

  function handleMoveOne(question: AvailableQuestion) {
    if (!selectedRoleId) return;
    stageAdd([question]);
  }

  function handleMoveSelected() {
    if (!selectedRoleId || checkedIds.size === 0) return;
    const toMove = displayAvailable.filter((q) => checkedIds.has(q.id));
    stageAdd(toMove);
  }

  /** Unstage an addition (remove from right panel, back to left). */
  function handleUnstageAdd(questionId: string) {
    setStagedToAdd((prev) => prev.filter((q) => q.id !== questionId));
  }

  /** Stage an existing assignment for removal (hides it from right panel). */
  function handleStageRemove(assignmentId: string) {
    setStagedToRemoveIds((prev) => new Set([...prev, assignmentId]));
  }

  /** Unstage a removal (put the saved assignment back in the right panel). */
  function handleUnstageRemove(assignmentId: string) {
    setStagedToRemoveIds((prev) => {
      const next = new Set(prev);
      next.delete(assignmentId);
      return next;
    });
  }

  function handleDiscardChanges() {
    setStagedToAdd([]);
    setStagedToRemoveIds(new Set());
    setCheckedIds(new Set());
    setLocalSaved([]);
    setNotification(null);
  }

  // ── Save: commit all staged changes to the database ────────────────────────
  async function handleSaveChanges() {
    if (!selectedRoleId || !hasChanges) return;
    setNotification(null);

    // Snapshot counts before clearing state
    const addCount = stagedToAdd.length;
    const removeCount = stagedToRemoveIds.size;
    const questionsToAdd = [...stagedToAdd];
    const idsToRemove = new Set(stagedToRemoveIds);

    try {
      // 1. Add newly staged questions
      if (questionsToAdd.length > 0) {
        await assignMutation.mutateAsync({
          roleId: selectedRoleId,
          questionIds: questionsToAdd.map((q) => q.id),
        });
        // Move staged additions into localSaved so right panel stays populated
        // while the server refetch completes in the background.
        const newlySaved: QuestionAssignment[] = questionsToAdd.map((q) => ({
          id: `__local_${q.id}`,
          question: q,
        }));
        setLocalSaved((prev) => [...prev, ...newlySaved]);
      }

      // 2. Remove staged deletions
      if (idsToRemove.size > 0) {
        // Search both server data and localSaved for the matching assignment
        const allAssignments = [...(assignedQuery.data ?? []), ...localSaved];
        for (const assignmentId of idsToRemove) {
          const match = allAssignments.find((a) => a.id === assignmentId);
          if (match) {
            await removeMutation.mutateAsync({
              roleId: selectedRoleId,
              questionId: match.question.id,
            });
          }
        }
        // Drop removed items from localSaved
        setLocalSaved((prev) => prev.filter((a) => !idsToRemove.has(a.id)));
      }

      // 3. Trigger background refetch — localSaved bridges the gap until it resolves
      queryClient.invalidateQueries({ queryKey: ['assigned-questions', selectedRoleId] });

      // 4. Clear staging
      setStagedToAdd([]);
      setStagedToRemoveIds(new Set());
      setCheckedIds(new Set());

      const parts: string[] = [];
      if (addCount > 0) parts.push(`${addCount} question${addCount !== 1 ? 's' : ''} added`);
      if (removeCount > 0) parts.push(`${removeCount} removed`);
      setNotification({ tone: 'success', message: `Assignments saved — ${parts.join(', ')}.` });
    } catch (err) {
      setNotification({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Failed to save assignments.',
      });
    }
  }

  // ── Checkbox helpers ───────────────────────────────────────────────────────
  const selectableIds = selectedRoleId ? displayAvailable.map((q) => q.id) : [];
  const allChecked = selectableIds.length > 0 && selectableIds.every((id) => checkedIds.has(id));
  const someChecked = !allChecked && selectableIds.some((id) => checkedIds.has(id));
  const checkedCount = selectableIds.filter((id) => checkedIds.has(id)).length;

  function handleToggleOne(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleToggleAll(ids: string[], checked: boolean) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  const availableLoading = assignedQuery.isLoading && !!selectedRoleId;
  const assignedLoading = assignedQuery.isLoading && !!selectedRoleId;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="space-y-4">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-slate-100">Question Role Assignment</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select questions from the left panel and save them to a role.
          </p>
        </div>
        {selectedRole && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
              Available: {displayAvailable.length}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
              Assigned: {displayAssigned.length}
            </span>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notification.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400'
          }`}
        >
          {notification.message}
        </div>
      ) : null}

      {/* Role selector */}
      <Card>
        <label className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Select Role
          </span>
          <Select
            value={selectedRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="max-w-xs"
          >
            <option value="">— Choose a role —</option>
            {initialRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          {!selectedRoleId && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Select a role to start assigning questions.
            </p>
          )}
        </label>
      </Card>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">

        {/* ── LEFT: Available Questions ──────────────────────────────────── */}
        <div className="flex min-h-[600px] flex-col border-b border-slate-200 lg:border-b-0 lg:border-r dark:border-slate-700">

          {/* Panel header */}
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Available Questions
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {selectedRoleId
                ? availableLoading
                  ? 'Loading…'
                  : `${displayAvailable.length} question${displayAvailable.length !== 1 ? 's' : ''} available`
                : `${displayAvailable.length} of ${initialQuestions.length} shown — select a role to assign`}
            </p>
          </div>

          {/* Filter bar — always active */}
          <div className="border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Search
                </label>
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by question text…"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Filter by Category
                </label>
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="text-sm"
                >
                  <option value="">All categories</option>
                  {initialCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Question list */}
          <div className="flex-1 overflow-y-auto">
            {availableLoading ? (
              <PanelLoading />
            ) : displayAvailable.length === 0 ? (
              <PanelEmpty
                message={
                  searchText || selectedCategoryId
                    ? 'No questions match the current filters.'
                    : selectedRoleId
                    ? 'All questions are already assigned to this role.'
                    : 'No questions found.'
                }
              />
            ) : (
              <>
                {/* Select-all bar — always shown; actions disabled until role chosen */}
                <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/40">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={(e) => handleToggleAll(selectableIds, e.target.checked)}
                    disabled={isSaving || !selectedRoleId}
                    title={!selectedRoleId ? 'Select a role first' : undefined}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 disabled:cursor-not-allowed dark:border-slate-600"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {!selectedRoleId
                      ? 'Select a role to assign questions'
                      : someChecked || allChecked
                      ? `${checkedCount} of ${displayAvailable.length} selected`
                      : `Select all (${displayAvailable.length})`}
                  </span>
                </div>

                {displayAvailable.map((question) => (
                  <AvailableRow
                    key={question.id}
                    question={question}
                    checked={checkedIds.has(question.id)}
                    onToggle={() => handleToggleOne(question.id)}
                    onMove={() => handleMoveOne(question)}
                    canAssign={!!selectedRoleId}
                    disabled={isSaving}
                  />
                ))}
              </>
            )}
          </div>

          {/* Move-selected footer — always shown once questions are checked */}
          {checkedCount > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {checkedCount} question{checkedCount !== 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={handleMoveSelected}
                disabled={isSaving || !selectedRoleId}
                title={!selectedRoleId ? 'Select a role first' : undefined}
                className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-700/60 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {!selectedRoleId ? 'Select a role first' : 'Move to Assigned'}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Assigned Questions ──────────────────────────────────── */}
        <div className="flex min-h-[600px] flex-col">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedRole ? `Assigned to: ${selectedRole.name}` : 'Assigned Questions'}
            </h2>
            {selectedRole && !assignedLoading && (
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {displayAssigned.length} question{displayAssigned.length !== 1 ? 's' : ''}
                {stagedToAdd.length > 0 && (
                  <span className="ml-1 text-indigo-500 dark:text-indigo-400">
                    ({stagedToAdd.length} unsaved)
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {!selectedRoleId ? (
              <PanelEmpty message="Choose a role above to see and manage its assigned questions." />
            ) : assignedLoading ? (
              <PanelLoading />
            ) : displayAssigned.length === 0 ? (
              <PanelEmpty message="No questions assigned to this role yet." />
            ) : (
              displayAssigned.map((entry) => {
                const isNew = 'isNew' in entry && entry.isNew === true;
                const isStagedForRemoval = !isNew && stagedToRemoveIds.has(entry.id);
                return (
                  <AssignedRow
                    key={entry.id}
                    assignment={entry as QuestionAssignment}
                    isNew={isNew}
                    isStagedForRemoval={isStagedForRemoval}
                    onUnstageAdd={() => handleUnstageAdd(entry.question.id)}
                    onStageRemove={() => handleStageRemove(entry.id)}
                    onUnstageRemove={() => handleUnstageRemove(entry.id)}
                    disabled={isSaving}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Save action bar — shown when there are staged changes ──────────── */}
      {selectedRoleId && hasChanges && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800/60 dark:bg-indigo-950/30">
          <div className="flex flex-wrap items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Unsaved changes:</span>
            {stagedToAdd.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium dark:bg-indigo-900/40">
                +{stagedToAdd.length} to add
              </span>
            )}
            {stagedToRemoveIds.size > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                −{stagedToRemoveIds.size} to remove
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <MiniSpinner />
                  Saving…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                  </svg>
                  Save Assignments
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvailableRow({
  question,
  checked,
  onToggle,
  onMove,
  canAssign,
  disabled,
}: {
  question: AvailableQuestion;
  checked: boolean;
  onToggle: () => void;
  onMove: () => void;
  canAssign: boolean;
  disabled: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 transition-colors dark:border-slate-700 ${disabled ? 'opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
      {/* Checkbox — always visible; disabled when no role selected */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={disabled || !canAssign}
        title={!canAssign ? 'Select a role first' : undefined}
        className="mt-1 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 disabled:cursor-not-allowed dark:border-slate-600"
      />

      {/* Full question text + category badge */}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          {question.text}
        </p>
        {question.category && (
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(question.category.id)}`}>
            {question.category.name}
          </span>
        )}
      </div>

      {/* Move button — always visible; disabled + tooltip when no role */}
      <button
        type="button"
        onClick={canAssign ? onMove : undefined}
        disabled={disabled || !canAssign}
        title={canAssign ? 'Move to Assigned' : 'Select a role first'}
        className="flex-shrink-0 inline-flex items-center gap-1 rounded border border-indigo-300 bg-white px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-indigo-700/60 dark:bg-transparent dark:text-indigo-400 dark:hover:bg-indigo-900/20"
      >
        Add
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

function AssignedRow({
  assignment,
  isNew,
  isStagedForRemoval,
  onUnstageAdd,
  onStageRemove,
  onUnstageRemove,
  disabled,
}: {
  assignment: QuestionAssignment;
  isNew: boolean;
  isStagedForRemoval: boolean;
  onUnstageAdd: () => void;
  onStageRemove: () => void;
  onUnstageRemove: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 transition-colors dark:border-slate-700 ${
        isNew
          ? 'bg-indigo-50 dark:bg-indigo-950/20'
          : isStagedForRemoval
          ? 'bg-red-50 opacity-60 dark:bg-red-950/20'
          : disabled
          ? 'opacity-60'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={`flex-1 text-sm leading-relaxed ${isStagedForRemoval ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
            {assignment.question.text}
          </p>
          {isNew && (
            <span className="flex-shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              New
            </span>
          )}
          {isStagedForRemoval && (
            <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              Removing
            </span>
          )}
        </div>
        {assignment.question.category && (
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(assignment.question.category.id)}`}>
            {assignment.question.category.name}
          </span>
        )}
      </div>

      {/* Action button varies by state */}
      {isNew ? (
        <button
          type="button"
          onClick={onUnstageAdd}
          disabled={disabled}
          title="Undo — move back to Available"
          className="flex-shrink-0 inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Undo
        </button>
      ) : isStagedForRemoval ? (
        <button
          type="button"
          onClick={onUnstageRemove}
          disabled={disabled}
          title="Keep — cancel removal"
          className="flex-shrink-0 inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-400 dark:hover:bg-slate-700"
        >
          Keep
        </button>
      ) : (
        <button
          type="button"
          onClick={onStageRemove}
          disabled={disabled}
          title="Remove from role"
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded border border-red-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600/60 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
          Remove
        </button>
      )}
    </div>
  );
}

function PanelEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

function PanelLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <svg className="h-6 w-6 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
      </svg>
    </div>
  );
}

function MiniSpinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
    </svg>
  );
}
