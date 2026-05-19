'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/app/components/ui';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        setError(null);
        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(values)
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.message ?? 'Login failed');
            return;
          }
          router.push('/dashboard');
        } catch {
          setError('Unable to connect. Please try again.');
        }
      })}
    >
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <Input type="email" placeholder="admin@example.com" {...register('email')} />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <Input type="password" placeholder="••••••••" {...register('password')} />
        {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
      </div>
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
