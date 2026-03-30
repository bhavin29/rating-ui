'use client';

import { RatingInput } from '@/app/components/rating-input';

type Question = { id: string; text: string };

export function QuestionList({
  questions,
  values,
  onChange
}: {
  questions: Question[];
  values: Record<string, number>;
  onChange: (questionId: string, score: number) => void;
}) {
  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-medium text-slate-700">{q.text}</p>
          <RatingInput value={values[q.id]} onChange={(score) => onChange(q.id, score)} />
        </div>
      ))}
    </div>
  );
}
