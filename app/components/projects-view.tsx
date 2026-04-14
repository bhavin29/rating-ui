'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/app/components/ui';
import { ProjectForm } from '@/app/components/project-form';

type ProjectRow = {
  id: string;
  name: string;
  status?: string | null;
  sprintCount: number;
  assignedUserCount: number;
  ratedUserCount: number;
};

export function ProjectsView({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const [projectRows, setProjectRows] = useState(initialProjects);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const totalAssignedUsers = projectRows.reduce((total, project) => total + project.assignedUserCount, 0);
  const totalRatedUsers = projectRows.reduce((total, project) => total + project.ratedUserCount, 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-slate-500">Project-level view of sprint volume, assigned users, and rating coverage</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Projects: {projectRows.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Assigned users: {totalAssignedUsers}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Users with ratings: {totalRatedUsers}</span>
        </div>
      </div>
      <Card>
        <ProjectForm
          onCreated={(project) => {
            setProjectRows((current) => {
              if (current.some((item) => item.id === project.id)) {
                return current;
              }

              return [
                {
                  id: project.id,
                  name: project.name,
                  status: project.status ?? 'ACTIVE',
                  sprintCount: 0,
                  assignedUserCount: 0,
                  ratedUserCount: 0
                },
                ...current
              ];
            });
          }}
        />
      </Card>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Project</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600">Sprints</th>
              <th className="px-4 py-3 font-medium text-slate-600">Assigned users</th>
              <th className="px-4 py-3 font-medium text-slate-600">Users with ratings</th>
              <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projectRows.map((project) => (
              <tr key={project.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  {editingProjectId === project.id ? (
                    <ProjectForm
                      project={{ id: project.id, name: project.name, status: project.status }}
                      onUpdated={(updatedProject) => {
                        setProjectRows((current) =>
                          current.map((item) =>
                            item.id === updatedProject.id
                              ? {
                                  ...item,
                                  name: updatedProject.name,
                                  status: updatedProject.status
                                }
                              : item
                          )
                        );
                        setEditingProjectId(null);
                      }}
                      onCancel={() => setEditingProjectId(null)}
                    />
                  ) : (
                    <div>
                      <p className="font-medium text-slate-900">{project.name}</p>
                      <p className="text-xs text-slate-500">Live project summary from GraphQL</p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{project.status ?? 'UNKNOWN'}</td>
                <td className="px-4 py-3 text-slate-700">{project.sprintCount}</td>
                <td className="px-4 py-3 text-slate-700">{project.assignedUserCount}</td>
                <td className="px-4 py-3 text-slate-700">{project.ratedUserCount}</td>
                <td className="px-4 py-3 text-slate-700">
                  {editingProjectId === project.id ? null : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded border px-3 py-2 text-sm"
                        onClick={() => setEditingProjectId(project.id)}
                      >
                        Edit
                      </button>
                      <Link className="rounded border px-3 py-2 text-sm" href={`/dashboard/projects/${project.id}`}>
                        Team
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
