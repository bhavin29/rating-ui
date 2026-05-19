'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
    >
      Logout
    </button>
  );
}
