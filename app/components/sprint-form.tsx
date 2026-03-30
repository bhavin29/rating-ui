'use client';

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
  const { register, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { projectId: projectId ?? '' }
  });

  return (
    <form
      className="grid grid-cols-4 gap-2"
      onSubmit={handleSubmit(async (values) => {
        await mutation.mutateAsync(values);
      })}
    >
      <Input placeholder="Sprint name" {...register('name')} />
      <Input type="date" {...register('startDate')} />
      <Input type="date" {...register('endDate')} />
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create sprint'}</Button>
      <input type="hidden" {...register('projectId')} />
    </form>
  );
}
