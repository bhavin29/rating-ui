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

export function SprintForm({ projectId }: { projectId?: string }) {
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
            await mutation.mutateAsync(values);
            reset({ projectId: values.projectId, name: '', startDate: '', endDate: '' });
            setMessage('Sprint created successfully.');
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
