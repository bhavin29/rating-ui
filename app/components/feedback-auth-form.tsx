'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from '@/app/components/ui';

export function FeedbackAuthForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pin.trim()) {
      setError('Security PIN is required.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/sprint-feedback/verify-pin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, pin: pin.trim() })
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setPin('');
        setError('Invalid Security PIN. Please try again.');
        return;
      }

      router.push(`/sprint?user=${encodeURIComponent(userId)}`);
    } catch {
      setPin('');
      setError('Invalid Security PIN. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md animate-[fadeIn_240ms_ease-out] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-300">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Sprint Feedback Access</h1>
        <p className="mt-2 text-sm text-slate-600">Please enter your Security PIN to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Security PIN</span>
          <div className="relative">
            <Input
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                if (error) setError('');
              }}
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter your PIN"
              className="pr-20"
              disabled={isVerifying}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setShowPin((current) => !current)}
              disabled={isVerifying}
            >
              {showPin ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={isVerifying} className="w-full py-3">
          {isVerifying ? 'Verifying...' : 'Verify & Continue'}
        </Button>
      </form>
    </div>
  );
}
