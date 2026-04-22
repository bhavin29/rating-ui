import { unstable_noStore as noStore } from 'next/cache';
import { UsersView } from '@/app/components/users-view';
import { getRoles, getUsers } from '@/app/lib/api/admin-api';

export default async function UsersPage() {
  noStore();
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  return <UsersView initialUsers={users} roles={roles} />;
}
