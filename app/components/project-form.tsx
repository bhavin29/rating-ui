'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateProject } from '@/app/hooks/use-admin-mutations';

const schema = z.object({ name: z.string().min(2) });

export function ProjectForm({
  onCreated
}: {
  onCreated?: (project: { id: string; name: string; status?: string | null }) => void;
}) {
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
          const result = await mutation.mutateAsync(values) as {
            createProject?: { id: string; name: string; status?: string | null };
            id?: string;
            name?: string;
            status?: string | null;
          };

          reset();

          const createdProject = result.createProject ?? (result.id && result.name
            ? { id: result.id, name: result.name, status: result.status ?? 'ACTIVE' }
            : null);

          if (createdProject) {
            onCreated?.(createdProject);
          }
        })}
      >
        <Input placeholder="New project name" {...register('name')} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create'}</Button>
      </form>
    </div>
  );
}
