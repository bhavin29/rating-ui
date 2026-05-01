import Link from 'next/link';
import { ProjectTeamManager } from '@/app/components/project-team-manager';
import { getProjectMembers, getProjects, getRoles, getUsers } from '@/app/lib/api/admin-api';

export default async function ProjectTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [projects, allUsers, initialMembers, roles] = await Promise.all([
    getProjects(),
    getUsers(),
    getProjectMembers(id),
    getRoles()
  ]);
  const project = projects.find((entry) => entry.id === id);

  if (!project) {
    return (
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="text-sm text-slate-500">The requested project could not be loaded.</p>
        </div>
        <Link className="inline-flex rounded border px-3 py-2 text-sm" href="/dashboard/projects">
          Back to projects
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <Link className="inline-flex rounded border px-3 py-2 text-sm" href="/dashboard/projects">
        Back to projects
      </Link>
      <ProjectTeamManager
        projectId={project.id}
        projectName={project.name}
        allUsers={allUsers}
        initialMembers={initialMembers}
        roles={roles}
      />
    </div>
  );
}
