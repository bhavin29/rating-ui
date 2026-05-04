'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui';
import type { SprintRatingData } from '@/app/lib/api/types';

function StarRatingInput({
  value,
  onChange
}: {
  value: number | null;
  onChange: (rating: number) => void;
}) {
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  const getStarFill = (star: number) => {
    if (value === null) {
      return 'empty';
    }
    if (value >= star) {
      return 'full';
    }
    if (value >= star - 0.5) {
      return 'half';
    }
    return 'empty';
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {stars.map((star) => {
          const fill = getStarFill(star);
          const filledWidth = fill === 'half' ? '50%' : fill === 'full' ? '100%' : '0%';

          return (
            <button
              type="button"
              key={star}
              onClick={(event) => {
                const target = event.currentTarget;
                const rect = target.getBoundingClientRect();
                let score = star - 1 + (event.clientX - rect.left < rect.width / 2 ? 0.5 : 1);
                if (score < 1) score = 1;
                onChange(Number(score.toFixed(1)));
              }}
              className="relative h-10 w-10 rounded-lg border border-slate-300 bg-white text-slate-400 transition hover:border-slate-400 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              aria-label={`Rate ${star - 1 + 0.5} to ${star} out of 10`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-slate-300">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </span>
              <span
                className="absolute inset-y-0 left-0 overflow-hidden text-amber-400"
                style={{ width: filledWidth, pointerEvents: 'none' }}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-slate-500">Click the left or right half of a star for half-point ratings.</div>
    </div>
  );
}

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

type UserGroupedQuestions = {
  [key: string]: {
    userName: string;
    userRole: string;
    questions: Array<{
      id: string;
      spr_id: string;
      text: string;
      helpText?: string | null;
      ratingByUserId: string;
    }>;
  };
};

export function SprintRatingForm({
  data,
  onSubmit
}: {
  data: SprintRatingData;
  onSubmit: (formData: RatingSubmissionData) => Promise<void>;
}) {
  const initialFormData = data.questions.map((q) => {
    if (!q.spr_id) {
      throw new Error(`Missing spr_id for question ${q.id}`);
    }

    return {
      spr_id: q.spr_id,
      rating: q.rating ?? null,
      answer: q.answer ?? ''
    };
  });

  const [formData, setFormData] = useState<RatingFormData>(() => initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [helpOpen, setHelpOpen] = useState<Record<string, boolean>>({});

  const alreadySubmitted = data.questions.every((q) => q.rating !== undefined && q.rating !== null);

  // Group questions by rating user name
  const groupedQuestions: UserGroupedQuestions = {};
  data.questions.forEach((q) => {
    const userKey = q.ratingByUserName || q.ratingByUserId;
    if (!groupedQuestions[userKey]) {
      groupedQuestions[userKey] = {
        userName: q.ratingByUserName,
        userRole: q.ratingByUserRole,
        questions: []
      };
    }
    groupedQuestions[userKey].questions.push({
      id: q.id,
      spr_id: q.spr_id,
      text: q.text,
      helpText: q.helpText,
      ratingByUserId: q.ratingByUserId
    });
  });

  const isAnswerRequired = (rating: number | null) => {
    return rating !== null && (rating <= 3 || rating >= 9);
  };

  const handleRatingChange = (sprId: string, rating: number | null) => {
    setFormData((prev) =>
      prev.map((item) =>
        item.spr_id === sprId
          ? {
              ...item,
              rating,
              answer: isAnswerRequired(rating) ? item.answer : ''
            }
          : item
      )
    );
  };

  const handleAnswerChange = (sprId: string, answer: string) => {
    setFormData((prev) =>
      prev.map((item) =>
        item.spr_id === sprId ? { ...item, answer } : item
      )
    );
  };

  const isAllFieldsFilled = () => {
    return formData.every((item) => {
      if (item.rating === null) {
        return false;
      }

      if (isAnswerRequired(item.rating)) {
        return item.answer.trim().length > 0;
      }

      return true;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllFieldsFilled() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(
        formData.map((item) => ({
          spr_id: item.spr_id,
          rating: Number(item.rating),
          answer: item.answer.trim()
        }))
      );
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ratings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="p-6 text-center">
        <p className="text-lg font-semibold text-green-600">Thank you for your feedback!</p>
        <p className="mt-2 text-sm text-slate-600">Your ratings have been submitted successfully.</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Intro Section */}
      <Card className="p-6 bg-slate-50">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {`Hello ${data.ratedUserName},

You contributed to the ${data.projectName} as a ${data.ratedUserRole}. We appreciate your contribution.

As you were part of the ${data.projectName} and we have now completed the sprint, we would like to request your feedback on the team members.

Please find the list of team members you worked with, along with their roles and a few questions for each. Kindly provide your ratings on a scale of 1 to 10 (from lowest to highest).

This feedback is completely confidential and will not be shared with anyone individually. We encourage you to share your honest and constructive feedback, as it will help improve team collaboration and project delivery in future sprints.`}
        </p>
      </Card>

      {/* Ratings Section */}
      <div className="space-y-6">
        {Object.entries(groupedQuestions).map(([userKey, userGroup]) => (
          <Card key={userKey} className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">
              {userGroup.userName} ({userGroup.userRole})
            </h3>

            <div className="space-y-4 border-t pt-4">
              {userGroup.questions.map((question) => {
                const questionKey = question.spr_id;
                const questionData = formData.find((item) => item.spr_id === questionKey);
                const rating = questionData?.rating ?? null;
                const answer = questionData?.answer ?? '';
                const shouldShowAnswer = isAnswerRequired(rating);

                return (
                  <div key={questionKey} className="space-y-3">
                    {/* Question Label */}
                    <div className="flex items-start gap-2">
                      <label className="block text-sm font-medium text-slate-700">
                        {question.text}
                      </label>
                      {question.helpText && (
                        <div
                          className="relative"
                          onMouseEnter={() =>
                            setHelpOpen((prev) => ({ ...prev, [questionKey]: true }))
                          }
                          onMouseLeave={() =>
                            setHelpOpen((prev) => ({ ...prev, [questionKey]: false }))
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setHelpOpen((prev) => ({
                                ...prev,
                                [questionKey]: !prev[questionKey]
                              }))
                            }
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
                            aria-label="Show question help"
                          >
                            i
                          </button>
                          <div
                            className={`absolute left-1/2 top-full z-10 mt-2 w-[min(22rem,calc(100vw-1rem))] -translate-x-1/2 rounded-lg border border-slate-200 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-lg transition-opacity duration-150 ${
                              helpOpen[questionKey] ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                          >
                            {question.helpText}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-700">Rating</p>
                        <p className="text-sm text-slate-500">
                          {rating === null ? 'Not rated yet' : `${rating.toFixed(1)} / 10`}
                        </p>
                      </div>
                      <StarRatingInput value={rating} onChange={(value) => handleRatingChange(questionKey, value)} />
                    </div>

                    {shouldShowAnswer && (
                      <textarea
                        value={answer}
                        onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
                        placeholder="Please enter a reason for this rating"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        rows={3}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Submission Notice or Button */}
      {alreadySubmitted ? (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">
            You have already submitted the rating for this sprint.
          </p>
        </Card>
      ) : (
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={!isAllFieldsFilled() || isSubmitting}
            className="rounded-lg bg-slate-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ratings'}
          </button>
        </div>
      )}
    </form>
  );
}
