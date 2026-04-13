'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateSprint, useUpdateSprint } from '@/app/hooks/use-admin-mutations';
import type { Sprint } from '@/app/lib/api/types';

const schema = z.object({
  projectId: z.string().min(1),
  sprintId: z.string().optional(),
  name: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().min(1)
});

type SprintFormValues = z.infer<typeof schema>;

type SprintPayload = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  project?: Sprint['project'];
};

export function SprintForm({
  projectId,
  sprint,
  onCreated,
  onUpdated,
  onCancel
}: {
  projectId?: string;
  sprint?: SprintPayload;
  onCreated?: (sprint: SprintPayload) => void;
  onUpdated?: (sprint: SprintPayload) => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreateSprint();
  const updateMutation = useUpdateSprint();
  const isEditMode = Boolean(sprint);
  const activeMutation = isEditMode ? updateMutation : createMutation;
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<SprintFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: sprint?.project?.id ?? projectId ?? '',
      sprintId: sprint?.id,
      name: sprint?.name ?? '',
      startDate: sprint?.startDate ?? '',
      endDate: sprint?.endDate ?? ''
    }
  });

  useEffect(() => {
    reset({
      projectId: sprint?.project?.id ?? projectId ?? '',
      sprintId: sprint?.id,
      name: sprint?.name ?? '',
      startDate: sprint?.startDate ?? '',
      endDate: sprint?.endDate ?? ''
    });
    setMessage(null);
  }, [projectId, reset, sprint]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{isEditMode ? 'Edit sprint' : 'Create sprint'}</h2>
        <p className="text-sm text-slate-500">
          {isEditMode
            ? 'Update the sprint details while keeping assignments, rating requests, and summaries intact.'
            : 'New sprints become the container for assigned users, rating requests, and score summaries.'}
        </p>
      </div>
      <form
        className="grid gap-2 md:grid-cols-4"
        onSubmit={handleSubmit(async (values) => {
          setMessage(null);

          try {
            const result = await (isEditMode
              ? updateMutation.mutateAsync({
                  sprintId: values.sprintId ?? sprint?.id ?? '',
                  name: values.name,
                  startDate: values.startDate,
                  endDate: values.endDate
                })
              : createMutation.mutateAsync({
                  projectId: values.projectId,
                  name: values.name,
                  startDate: values.startDate,
                  endDate: values.endDate
                })) as {
              createSprint?: Partial<SprintPayload>;
              updateSprint?: Partial<SprintPayload>;
              id?: string;
              name?: string;
              startDate?: string;
              endDate?: string;
              project?: { id: string; name?: string };
            };

            const returnedSprint = isEditMode ? result.updateSprint : result.createSprint;
            const savedSprint = returnedSprint ?? (result.id && result.name
              ? {
                  id: result.id,
                  name: result.name,
                  startDate: result.startDate ?? values.startDate,
                  endDate: result.endDate ?? values.endDate,
                  project: (result.project?.name ? result.project : undefined) ?? sprint?.project
                }
              : null);

            if (!savedSprint) {
              throw new Error('Sprint was not returned');
            }

            const resolvedProject = savedSprint.project?.name
              ? ({
                  id: savedSprint.project.id,
                  name: savedSprint.project.name
                } satisfies NonNullable<Sprint['project']>)
              : sprint?.project;

            const normalizedSprint: SprintPayload = {
              id: savedSprint.id ?? sprint?.id ?? values.sprintId ?? '',
              name: savedSprint.name ?? values.name,
              startDate: savedSprint.startDate ?? values.startDate,
              endDate: savedSprint.endDate ?? values.endDate,
              project: resolvedProject
            };

            if (isEditMode) {
              setMessage('Sprint updated successfully.');
              onUpdated?.(normalizedSprint);
            } else {
              reset({ projectId: values.projectId, sprintId: undefined, name: '', startDate: '', endDate: '' });
              setMessage('Sprint created successfully.');
              onCreated?.(normalizedSprint);
            }
          } catch {
            setMessage(
              isEditMode
                ? 'Failed to update sprint. Please check the dates and try again.'
                : 'Failed to create sprint. Please check the dates and try again.'
            );
          }
        })}
      >
        <Input placeholder="Sprint name" {...register('name')} />
        <Input type="date" aria-label="Sprint start date" {...register('startDate')} />
        <Input type="date" aria-label="Sprint end date" {...register('endDate')} />
        <div className="flex gap-2">
          <Button type="submit" disabled={activeMutation.isPending}>
            {activeMutation.isPending ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save sprint' : 'Create sprint'}
          </Button>
          {isEditMode ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                reset({
                  projectId: sprint?.project?.id ?? projectId ?? '',
                  sprintId: sprint?.id,
                  name: sprint?.name ?? '',
                  startDate: sprint?.startDate ?? '',
                  endDate: sprint?.endDate ?? ''
                });
                setMessage(null);
                onCancel?.();
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
        <input type="hidden" {...register('projectId')} />
        <input type="hidden" {...register('sprintId')} />
      </form>
      {message ? (
        <p className={`text-sm ${activeMutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>
      ) : null}
    </div>
  );
}
