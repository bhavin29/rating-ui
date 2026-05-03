'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui';
import type { SprintRatingData } from '@/app/lib/api/types';

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
      rating: null,
      answer: ''
    };
  });

  const [formData, setFormData] = useState<RatingFormData>(() => initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
                    <label className="block text-sm font-medium text-slate-700">
                      {question.text}
                    </label>

                    {/* Rating Dropdown */}
                    <select
                      value={rating === null ? '' : rating}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleRatingChange(questionKey, value === '' ? null : parseInt(value));
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select rating (1-10)</option>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>

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

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={!isAllFieldsFilled() || isSubmitting}
          className="rounded-lg bg-slate-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ratings'}
        </button>
      </div>
    </form>
  );
}
