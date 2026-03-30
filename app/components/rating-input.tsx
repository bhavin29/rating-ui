'use client';

import { cn } from '@/app/lib/utils/cn';

export function RatingInput({ value, onChange }: { value?: number; onChange: (score: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 7 }, (_, i) => i + 1).map((score) => (
        <button
          type="button"
          key={score}
          onClick={() => onChange(score)}
          className={cn(
            'h-8 w-8 rounded-full border text-sm',
            value === score ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white'
          )}
        >
          {score}
        </button>
      ))}
    </div>
  );
}
