import { Table } from '@/app/components/table';
import { getSprintMembers } from '@/app/lib/api/admin-api';

export default async function SprintMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = await getSprintMembers(id);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Sprint Members</h1>
      <Table
        columns={[
          { key: 'name', title: 'Name' },
          { key: 'email', title: 'Email' },
          { key: 'role', title: 'Role' }
        ]}
        rows={members as any[]}
      />
    </section>
  );
}
