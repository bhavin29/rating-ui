'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateSprint, useUpdateSprint } from '@/app/hooks/use-admin-mutations';
import type { Sprint } from '@/app/lib/api/types';

const schema = z
  .object({
    sprintId: z.string().optional(),
    name: z.string().min(2, 'Sprint name must be at least 2 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required')
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate']
  });

type SprintFormValues = z.infer<typeof schema>;

type SprintPayload = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export function SprintForm({
  sprint,
  onCreated,
  onUpdated,
  onCancel
}: {
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SprintFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sprintId: sprint?.id,
      name: sprint?.name ?? '',
      startDate: sprint?.startDate ?? '',
      endDate: sprint?.endDate ?? ''
    }
  });

  useEffect(() => {
    reset({
      sprintId: sprint?.id,
      name: sprint?.name ?? '',
      startDate: sprint?.startDate ?? '',
      endDate: sprint?.endDate ?? ''
    });
    setMessage(null);
  }, [reset, sprint]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {isEditMode ? 'Edit sprint' : 'Create sprint'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isEditMode
            ? 'Update the sprint details while keeping rating requests and summaries intact.'
            : 'Add a new sprint with a name and date range.'}
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
            };

            const returned = isEditMode ? result.updateSprint : result.createSprint;
            const saved = returned ?? (result.id && result.name
              ? {
                  id: result.id,
                  name: result.name,
                  startDate: result.startDate ?? values.startDate,
                  endDate: result.endDate ?? values.endDate
                }
              : null);

            if (!saved) throw new Error('Sprint was not returned');

            const normalized: SprintPayload = {
              id: saved.id ?? sprint?.id ?? values.sprintId ?? '',
              name: saved.name ?? values.name,
              startDate: saved.startDate ?? values.startDate,
              endDate: saved.endDate ?? values.endDate
            };

            if (isEditMode) {
              setMessage('Sprint updated successfully.');
              onUpdated?.(normalized);
            } else {
              reset({ sprintId: undefined, name: '', startDate: '', endDate: '' });
              setMessage('Sprint created successfully.');
              onCreated?.(normalized);
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
        <div className="space-y-1">
          <Input placeholder="Sprint name" {...register('name')} />
          {errors.name ? <p className="text-xs text-red-600 dark:text-red-400">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Input type="date" aria-label="Sprint start date" {...register('startDate')} />
          {errors.startDate ? <p className="text-xs text-red-600 dark:text-red-400">{errors.startDate.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Input type="date" aria-label="Sprint end date" {...register('endDate')} />
          {errors.endDate ? <p className="text-xs text-red-600 dark:text-red-400">{errors.endDate.message}</p> : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={activeMutation.isPending}>
            {activeMutation.isPending
              ? isEditMode ? 'Saving...' : 'Creating...'
              : isEditMode ? 'Save sprint' : 'Create sprint'}
          </Button>
          {isEditMode ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => {
                reset({
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
        <input type="hidden" {...register('sprintId')} />
      </form>

      {message ? (
        <p className={`text-sm ${activeMutation.isError ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
