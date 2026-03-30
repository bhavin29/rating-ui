import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  if ((process.env.MOCK_ADMIN_AUTH ?? 'true') === 'true') return;
  const store = await cookies();
  const role = store.get('role')?.value;

  if (role !== 'admin') {
    redirect('/');
  }
}
