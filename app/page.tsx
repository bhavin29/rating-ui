import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LoginForm } from '@/app/components/login-form';
import { HelpButton } from '@/app/components/help-button';
import { ThemeToggle } from '@/app/components/theme-toggle';

export default async function HomePage() {
  const store = await cookies();
  if (store.get('admin_token')?.value) redirect('/dashboard');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <ThemeToggle />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sprint Rating System</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to access the admin portal.</p>
      </div>
      <LoginForm />
      <HelpButton />
    </main>
  );
}
