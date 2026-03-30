import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-slate-200 bg-white p-4 shadow-sm', className)} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring" {...props} />;
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400',
        className
      )}
      {...props}
    />
  );
}
