import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LoginForm } from '@/app/components/login-form';

export default async function HomePage() {
  const store = await cookies();
  if (store.get('admin_token')?.value) redirect('/dashboard');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sprint Rating System</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to access the admin portal.</p>
      </div>
      <LoginForm />
    </main>
  );
}
