'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateSprint } from '@/app/hooks/use-admin-mutations';

const schema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().min(1)
});

export function SprintForm({
  projectId,
  onCreated
}: {
  projectId?: string;
  onCreated?: (sprint: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    project?: { id: string; name?: string };
  }) => void;
}) {
  const mutation = useCreateSprint();
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { projectId: projectId ?? '' }
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Create sprint</h2>
        <p className="text-sm text-slate-500">
          New sprints become the container for assigned users, rating requests, and score summaries.
        </p>
      </div>
      <form
        className="grid gap-2 md:grid-cols-4"
        onSubmit={handleSubmit(async (values) => {
          setMessage(null);

          try {
            const result = await mutation.mutateAsync(values) as {
              createSprint?: {
                id: string;
                name: string;
                startDate?: string;
                endDate?: string;
                project?: { id: string; name?: string };
              };
              id?: string;
              name?: string;
              startDate?: string;
              endDate?: string;
              project?: { id: string; name?: string };
            };

            reset({ projectId: values.projectId, name: '', startDate: '', endDate: '' });
            setMessage('Sprint created successfully.');

            const createdSprint = result.createSprint ?? (result.id && result.name
              ? {
                  id: result.id,
                  name: result.name,
                  startDate: result.startDate ?? values.startDate,
                  endDate: result.endDate ?? values.endDate,
                  project: result.project ?? { id: values.projectId }
                }
              : null);

            if (createdSprint) {
              onCreated?.({
                ...createdSprint,
                startDate: createdSprint.startDate ?? values.startDate,
                endDate: createdSprint.endDate ?? values.endDate,
                project: createdSprint.project ?? { id: values.projectId }
              });
            }
          } catch {
            setMessage('Failed to create sprint. Please check the dates and try again.');
          }
        })}
      >
        <Input placeholder="Sprint name" {...register('name')} />
        <Input type="date" aria-label="Sprint start date" {...register('startDate')} />
        <Input type="date" aria-label="Sprint end date" {...register('endDate')} />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create sprint'}
        </Button>
        <input type="hidden" {...register('projectId')} />
      </form>
      {message ? (
        <p className={`text-sm ${mutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>
      ) : null}
    </div>
  );
}
