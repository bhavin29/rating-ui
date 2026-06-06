'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/app/components/ui';
import type { SprintRatingData } from '@/app/lib/api/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isAnswerRequired(rating: number | null): boolean {
  return rating !== null && (rating <= 3 || rating >= 9);
}

function isGroupComplete(
  questions: GroupQuestion[],
  formData: RatingFormData
): boolean {
  return questions.every((q) => {
    const item = formData.find((f) => f.spr_id === q.spr_id);
    if (!item || item.rating === null) return false;
    if (isAnswerRequired(item.rating)) return item.answer.trim().length > 0;
    return true;
  });
}

// ─── Star rating input (integer 1–10 only) ────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
  disabled = false
}: {
  value: number | null;
  onChange: (rating: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => {
              if (disabled) return;
              // Click the active star to deselect it
              onChange(value === star ? null : star);
            }}
            disabled={disabled}
            aria-label={`Rate ${star} out of 10`}
            className={[
              'relative h-9 w-9 rounded-md border transition focus:outline-none focus:ring-2 focus:ring-amber-300',
              filled
                ? 'border-amber-400 bg-amber-50 text-amber-500 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400'
                : 'border-slate-300 bg-white text-slate-300 hover:border-amber-300 hover:text-amber-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-600 dark:hover:border-amber-600 dark:hover:text-amber-500',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            ].join(' ')}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current mx-auto"
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      })}
      {value !== null && (
        <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
          {value} / 10
        </span>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type RatingFormDataItem = {
  spr_id: string;
  rating: number | null;
  answer: string;
};
export type RatingFormData = RatingFormDataItem[];

export type RatingSubmissionData = Array<{
  spr_id: string;
  rating: number;
  answer: string;
}>;

type GroupQuestion = {
  id: string;
  spr_id: string;
  text: string;
  helpText?: string | null;
  ratingByUserId: string;
};

type UserGroup = {
  userName: string;
  userRole: string;
  questions: GroupQuestion[];
};

// ─── Main form ────────────────────────────────────────────────────────────────

export function SprintRatingForm({
  data,
  onSubmit,
  onSaveDraft
}: {
  data: SprintRatingData;
  onSubmit: (formData: RatingSubmissionData) => Promise<void>;
  onSaveDraft: (formData: RatingSubmissionData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<RatingFormData>(() =>
    data.questions.map((q) => {
      if (!q.spr_id) throw new Error(`Missing spr_id for question ${q.id}`);
      return { spr_id: q.spr_id, rating: q.rating ?? null, answer: q.answer ?? '' };
    })
  );

  const [savingAs, setSavingAs] = useState<'draft' | 'submit' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  // Per-question description panel toggle
  const [descOpen, setDescOpen] = useState<Record<string, boolean>>({});
  // Help tooltip open state
  const [helpOpen, setHelpOpen] = useState<Record<string, boolean>>({});

  // Backend-driven submitted status (falls back to checking all questions for old data)
  const alreadySubmitted =
    data.status === 'SUBMITTED' ||
    (!data.status && data.questions.every((q) => q.rating !== undefined && q.rating !== null));

  // Build grouped questions
  const groupedQuestions = useMemo<Record<string, UserGroup>>(() => {
    const groups: Record<string, UserGroup> = {};
    data.questions.forEach((q) => {
      const key = q.ratingByUserName || q.ratingByUserId;
      if (!groups[key]) {
        groups[key] = { userName: q.ratingByUserName, userRole: q.ratingByUserRole, questions: [] };
      }
      groups[key].questions.push({
        id: q.id,
        spr_id: q.spr_id,
        text: q.text,
        helpText: q.helpText,
        ratingByUserId: q.ratingByUserId
      });
    });
    return groups;
  }, [data.questions]);

  // Sort: incomplete (draft) groups first, fully rated groups last
  const sortedGroups = useMemo(
    () =>
      Object.entries(groupedQuestions).sort(([, a], [, b]) => {
        const aOk = isGroupComplete(a.questions, formData);
        const bOk = isGroupComplete(b.questions, formData);
        if (!aOk && bOk) return -1;
        if (aOk && !bOk) return 1;
        return 0;
      }),
    [groupedQuestions, formData]
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRatingChange = (sprId: string, rating: number | null) => {
    setFormData((prev) =>
      prev.map((item) => (item.spr_id === sprId ? { ...item, rating } : item))
    );
    // Auto-open description when answer becomes required
    if (isAnswerRequired(rating)) {
      setDescOpen((prev) => ({ ...prev, [sprId]: true }));
    }
  };

  const handleAnswerChange = (sprId: string, answer: string) => {
    setFormData((prev) =>
      prev.map((item) => (item.spr_id === sprId ? { ...item, answer } : item))
    );
  };

  const isAllFieldsFilled = () =>
    formData.every((item) => {
      if (item.rating === null) return false;
      if (isAnswerRequired(item.rating)) return item.answer.trim().length > 0;
      return true;
    });

  const ratedItems = (): RatingSubmissionData =>
    formData
      .filter((item) => item.rating !== null)
      .map((item) => ({
        spr_id: item.spr_id,
        rating: item.rating as number,
        answer: item.answer.trim()
      }));

  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    const items = ratedItems();
    if (items.length === 0 || savingAs) return;
    setSavingAs('draft');
    setError('');
    try {
      await onSaveDraft(items);
      setDraftSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft.');
    } finally {
      setSavingAs(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllFieldsFilled() || savingAs) return;
    setSavingAs('submit');
    setError('');
    try {
      await onSubmit(
        formData.map((item) => ({
          spr_id: item.spr_id,
          rating: item.rating as number,
          answer: item.answer.trim()
        }))
      );
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ratings.');
    } finally {
      setSavingAs(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <Card className="p-6 text-center">
        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          Thank you for your feedback!
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Your ratings have been submitted successfully.
        </p>
      </Card>
    );
  }

  const totalGroups = sortedGroups.length;
  const completedGroups = sortedGroups.filter(([, g]) =>
    isGroupComplete(g.questions, formData)
  ).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Intro */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-700/40">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {`Hello ${data.ratedUserName},\n\nYou contributed to the ${data.projectName} as a ${data.ratedUserRole}. We appreciate your contribution.\n\nAs you were part of the ${data.projectName} and we have now completed the sprint, we would like to request your feedback on the team members.\n\nPlease find the list of team members you worked with, along with their roles and a few questions for each. Kindly provide your ratings on a scale of 1 to 10 (from lowest to highest).\n\nThis feedback is completely confidential and will not be shared with anyone individually. We encourage you to share your honest and constructive feedback, as it will help improve team collaboration and project delivery in future sprints.`}
        </p>
      </Card>

      {/* Progress summary */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
        <span className="text-slate-600 dark:text-slate-400">
          Progress: <span className="font-semibold text-slate-900 dark:text-slate-100">{completedGroups} / {totalGroups}</span> team members rated
        </span>
        {completedGroups === totalGroups && totalGroups > 0 ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            Done
          </span>
        ) : data.status === 'DRAFT' ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Draft
          </span>
        ) : null}
      </div>

      {/* User groups — incomplete (draft) at top */}
      <div className="space-y-6">
        {sortedGroups.map(([userKey, userGroup]) => {
          const complete = isGroupComplete(userGroup.questions, formData);
          return (
            <Card key={userKey} className="overflow-hidden p-0">
              {/* Group header */}
              <div className={`flex items-center justify-between border-b px-5 py-3 ${
                complete
                  ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40'
              }`}>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {userGroup.userName}{' '}
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    ({userGroup.userRole})
                  </span>
                </h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  complete
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {complete ? 'Done' : 'In Progress'}
                </span>
              </div>

              {/* Questions */}
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {userGroup.questions.map((question) => {
                  const sprId = question.spr_id;
                  const item = formData.find((f) => f.spr_id === sprId);
                  const rating = item?.rating ?? null;
                  const answer = item?.answer ?? '';
                  const required = isAnswerRequired(rating);
                  const showDesc = descOpen[sprId] || required;

                  return (
                    <div key={sprId} className="space-y-3 px-5 py-4">
                      {/* Question label row */}
                      <div className="flex items-start gap-2">
                        <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {question.text}
                          {required && (
                            <span className="ml-1.5 text-xs font-normal text-amber-600 dark:text-amber-400">
                              (description required)
                            </span>
                          )}
                        </label>

                        {/* Help text tooltip */}
                        {question.helpText && (
                          <div
                            className="relative flex-shrink-0"
                            onMouseEnter={() => setHelpOpen((p) => ({ ...p, [sprId]: true }))}
                            onMouseLeave={() => setHelpOpen((p) => ({ ...p, [sprId]: false }))}
                          >
                            <button
                              type="button"
                              onClick={() => setHelpOpen((p) => ({ ...p, [sprId]: !p[sprId] }))}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-600"
                              aria-label="Show help"
                            >
                              i
                            </button>
                            <div className={`absolute left-1/2 top-full z-10 mt-2 w-[min(22rem,calc(100vw-1rem))] -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-lg transition-opacity duration-150 dark:border-slate-600 dark:bg-slate-800 ${helpOpen[sprId] ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                              {question.helpText}
                            </div>
                          </div>
                        )}

                        {/* Description toggle — always show when not yet auto-opened by rating */}
                        <button
                          type="button"
                          onClick={() => setDescOpen((p) => ({ ...p, [sprId]: !p[sprId] }))}
                          title={showDesc ? 'Hide description' : 'Add a description or note'}
                          className={`flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full border transition ${
                            showDesc
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-700/60 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : 'border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
                          }`}
                          aria-label={showDesc ? 'Hide description' : 'Add description'}
                        >
                          {/* Pencil / note icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                          </svg>
                        </button>
                      </div>

                      {/* Star rating */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Rating
                        </p>
                        <StarRatingInput
                          value={rating}
                          onChange={(v) => handleRatingChange(sprId, v)}
                          disabled={alreadySubmitted}
                        />
                        {rating === null && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            Click a star to rate 1–10
                          </p>
                        )}
                      </div>

                      {/* Description / answer textarea */}
                      {showDesc && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Description
                            {required && <span className="ml-1 text-amber-500">*</span>}
                          </p>
                          <textarea
                            value={answer}
                            onChange={(e) => handleAnswerChange(sprId, e.target.value)}
                            disabled={alreadySubmitted}
                            placeholder={
                              required
                                ? 'Please explain this rating (required)'
                                : 'Optional notes or comments…'
                            }
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                          />
                          {required && answer.trim().length === 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              A description is required for this rating.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* Actions */}
      {alreadySubmitted ? (
        <Card className="border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/50">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            You have already submitted the rating for this sprint.
          </p>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          {/* Draft save info */}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {draftSavedAt ? (
              <span>
                Draft saved at{' '}
                {draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <span>
                {ratedItems().length} of {formData.length} questions rated
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={ratedItems().length === 0 || savingAs !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {savingAs === 'draft' ? (
                <>
                  <MiniSpinner /> Saving…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                  </svg>
                  Save Draft
                </>
              )}
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isAllFieldsFilled() || savingAs !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              {savingAs === 'submit' ? (
                <>
                  <MiniSpinner /> Submitting…
                </>
              ) : (
                'Submit Ratings'
              )}
            </button>
          </div>
        </div>
      )}
    </form>
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
