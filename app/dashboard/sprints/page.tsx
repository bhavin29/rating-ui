import { unstable_noStore as noStore } from 'next/cache';
import { SprintsView } from '@/app/components/sprints-view';
import { getAllSprints } from '@/app/lib/api/admin-api';

export default async function SprintsPage() {
  noStore();
  const sprints = await getAllSprints();
  const sprintRows = sprints.map((sprint) => ({ sprint }));

  return <SprintsView initialSprints={sprintRows} />;
}
