'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateProject, useUpdateProject } from '@/app/hooks/use-admin-mutations';

const PROJECT_STATUS_OPTIONS = ['ACTIVE', 'ON_HOLD'] as const;

const schema = z.object({
  projectId: z.string().optional(),
  name: z.string().min(2),
  status: z.enum(PROJECT_STATUS_OPTIONS).optional()
});

type ProjectFormValues = z.infer<typeof schema>;
type ProjectPayload = { id: string; name: string; status?: string | null };

export function ProjectForm({
  project,
  onCreated,
  onUpdated,
  onCancel
}: {
  project?: ProjectPayload;
  onCreated?: (project: ProjectPayload) => void;
  onUpdated?: (project: ProjectPayload) => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const isEditMode = Boolean(project);
  const activeMutation = isEditMode ? updateMutation : createMutation;
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: project?.id,
      name: project?.name ?? '',
      status: (project?.status as ProjectFormValues['status']) ?? 'ACTIVE'
    }
  });

  useEffect(() => {
    reset({
      projectId: project?.id,
      name: project?.name ?? '',
      status: (project?.status as ProjectFormValues['status']) ?? 'ACTIVE'
    });
    setMessage(null);
  }, [project, reset]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{isEditMode ? 'Edit project' : 'Create project'}</h2>
        <p className="text-sm text-slate-500">
          {isEditMode
            ? 'Update the project title and status without affecting its sprint and rating history.'
            : 'Add a project before assigning users, creating sprints, and tracking ratings.'}
        </p>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={handleSubmit(async (values) => {
          setMessage(null);

          try {
            const result = await (isEditMode
              ? updateMutation.mutateAsync({
                  projectId: values.projectId ?? project?.id ?? '',
                  name: values.name,
                  status: values.status ?? 'ACTIVE'
                })
              : createMutation.mutateAsync({ name: values.name })) as {
              createProject?: ProjectPayload;
              updateProject?: ProjectPayload;
              id?: string;
              name?: string;
              status?: string | null;
            };

            const returnedProject = isEditMode ? result.updateProject : result.createProject;
            const savedProject = returnedProject ?? (result.id && result.name
              ? {
                  id: result.id,
                  name: result.name,
                  status: result.status ?? values.status ?? project?.status ?? 'ACTIVE'
                }
              : null);

            if (!savedProject) {
              throw new Error('Project was not returned');
            }

            const normalizedProject: ProjectPayload = {
              id: savedProject.id,
              name: savedProject.name,
              status: savedProject.status ?? values.status ?? project?.status ?? 'ACTIVE'
            };

            if (isEditMode) {
              setMessage('Project updated successfully.');
              onUpdated?.(normalizedProject);
            } else {
              reset({ projectId: undefined, name: '', status: 'ACTIVE' });
              setMessage('Project created successfully.');
              onCreated?.(normalizedProject);
            }
          } catch {
            setMessage(
              isEditMode
                ? 'Failed to update project. Please review the title and status and try again.'
                : 'Failed to create project. Please review the title and try again.'
            );
          }
        })}
      >
        <Input className="min-w-56 flex-1" placeholder="Project name" {...register('name')} />
        {isEditMode ? (
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            {...register('status')}
          >
            {PROJECT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        ) : null}
        <Button type="submit" disabled={activeMutation.isPending}>
          {activeMutation.isPending ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create'}
        </Button>
        {isEditMode ? (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              reset({
                projectId: project?.id,
                name: project?.name ?? '',
                status: (project?.status as ProjectFormValues['status']) ?? 'ACTIVE'
              });
              setMessage(null);
              onCancel?.();
            }}
          >
            Cancel
          </button>
        ) : null}
        <input type="hidden" {...register('projectId')} />
      </form>
      {message ? (
        <p className={`text-sm ${activeMutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>
      ) : null}
    </div>
  );
}
