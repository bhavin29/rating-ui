import { redirect } from 'next/navigation';

export default async function SprintMembersPage({ params }: { params: Promise<{ id: string }> }) {
  await params;
  redirect('/dashboard/sprints');
}
