'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/app/components/theme-provider';
import { cn } from '@/app/lib/utils/cn';

interface ThemeToggleProps {
  variant?: 'fixed' | 'inline';
}

export function ThemeToggle({ variant = 'fixed' }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  const baseClasses =
    'flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200';

  if (!mounted) {
    return (
      <div
        aria-hidden
        className={cn(
          baseClasses,
          variant === 'fixed' ? 'fixed top-4 right-4 z-50 h-10 w-10' : 'h-8 w-8'
        )}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={label}
      className={cn(
        baseClasses,
        variant === 'fixed' ? 'fixed top-4 right-4 z-50 h-10 w-10 shadow-sm' : 'h-8 w-8'
      )}
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.061 1.061L4.576 4.576a.75.75 0 10-1.06 1.06l1.59 1.59z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
