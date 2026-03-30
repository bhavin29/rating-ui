'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateProject } from '@/app/hooks/use-admin-mutations';

const schema = z.object({ name: z.string().min(2) });

export function ProjectForm() {
  const mutation = useCreateProject();
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <form
      className="flex gap-2"
      onSubmit={handleSubmit(async (values) => {
        await mutation.mutateAsync(values);
        reset();
      })}
    >
      <Input placeholder="New project name" {...register('name')} />
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create'}</Button>
    </form>
  );
}
