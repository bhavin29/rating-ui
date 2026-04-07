'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateProject } from '@/app/hooks/use-admin-mutations';

const schema = z.object({ name: z.string().min(2) });

export function ProjectForm() {
  const router = useRouter();
  const mutation = useCreateProject();
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Create project</h2>
        <p className="text-sm text-slate-500">Add a project before assigning users, creating sprints, and tracking ratings.</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
          reset();
          router.refresh();
        })}
      >
        <Input placeholder="New project name" {...register('name')} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create'}</Button>
      </form>
    </div>
  );
}
