import { Table } from '@/app/components/table';
import { Card } from '@/app/components/ui';
import { ProjectForm } from '@/app/components/project-form';
import { getProjects } from '@/app/lib/api/admin-api';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Projects</h1>
      <Card>
        <ProjectForm />
      </Card>
      <Table
        columns={[
          { key: 'name', title: 'Name' },
          { key: 'status', title: 'Status' }
        ]}
        rows={projects as any[]}
      />
    </section>
  );
}
