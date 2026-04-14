import { unstable_noStore as noStore } from 'next/cache';
import { RolesView } from '@/app/components/roles-view';
import { getRoles } from '@/app/lib/api/admin-api';

export default async function RolesPage() {
  noStore();
  const roles = await getRoles();

  return <RolesView initialRoles={roles} />;
}
