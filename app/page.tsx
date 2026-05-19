import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Sprint Rating System</h1>
      <p className="text-slate-600">
        Use the admin portal to manage projects, team members, sprints and ratings.
      </p>
      <div className="flex gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/dashboard">
          Login
        </Link>
      </div>
    </main>
  );
}
