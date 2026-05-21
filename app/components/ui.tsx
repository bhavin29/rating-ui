'use client';

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from 'react';
import { cn } from '@/app/lib/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/60',
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-600',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-600',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-600',
        className
      )}
      {...props}
    />
  );
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-600',
        className
      )}
      {...props}
    />
  );
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Yes',
  cancelText = 'Cancel'
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertDialog({
  isOpen,
  title,
  message,
  onClose,
  type = 'info'
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}) {
  if (!isOpen) return null;

  const bgColor = {
    success: 'bg-green-50 dark:bg-green-950/50',
    error: 'bg-red-50 dark:bg-red-950/50',
    info: 'bg-blue-50 dark:bg-blue-950/50'
  }[type];

  const borderColor = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    info: 'border-blue-200 dark:border-blue-800'
  }[type];

  const titleColor = {
    success: 'text-green-900 dark:text-green-300',
    error: 'text-red-900 dark:text-red-300',
    info: 'text-blue-900 dark:text-blue-300'
  }[type];

  const messageColor = {
    success: 'text-green-700 dark:text-green-400',
    error: 'text-red-700 dark:text-red-400',
    info: 'text-blue-700 dark:text-blue-400'
  }[type];

  const buttonColor = {
    success: 'bg-green-900 hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-700',
    error: 'bg-red-900 hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-700',
    info: 'bg-blue-900 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700'
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={cn('rounded-lg border p-6 shadow-lg', bgColor, borderColor)}>
        <h2 className={cn('mb-2 text-lg font-semibold', titleColor)}>{title}</h2>
        <p className={cn('mb-6 text-sm', messageColor)}>{message}</p>
        <div className="flex justify-end">
          <button
            type="button"
            className={cn('rounded px-4 py-2 text-sm font-medium text-white transition', buttonColor)}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
