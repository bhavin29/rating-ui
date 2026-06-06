import { unstable_noStore as noStore } from 'next/cache';
import { UsersView } from '@/app/components/users-view';
import { getRoles, getSkills, getUsers } from '@/app/lib/api/admin-api';

export default async function UsersPage() {
  noStore();
  const [users, roles, skills] = await Promise.all([getUsers(), getRoles(), getSkills()]);

  return <UsersView initialUsers={users} roles={roles} skills={skills} />;
}
