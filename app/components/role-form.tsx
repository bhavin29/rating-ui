'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateRole } from '@/app/hooks/use-admin-mutations';

const schema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters')
});

type RoleFormValues = z.infer<typeof schema>;
type RolePayload = { id: string; name: string };

export function RoleForm({ onCreated }: { onCreated?: (role: RolePayload) => void }) {
  const createMutation = useCreateRole();
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    reset({ name: '' });
    setMessage(null);
  }, [reset]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Create role</h2>
        <p className="text-sm text-slate-500">Add a role with a single name field.</p>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={handleSubmit(async (values) => {
          setMessage(null);

          try {
            const result = (await createMutation.mutateAsync({ name: values.name })) as {
              createRole?: RolePayload;
              id?: string;
              name?: string;
            };

            const returnedRole = result.createRole;
            const savedRole = returnedRole ?? (result.id && result.name ? { id: result.id, name: result.name } : null);

            if (!savedRole) {
              throw new Error('Role was not returned');
            }

            reset({ name: '' });
            setMessage('Role created successfully.');
            onCreated?.(savedRole);
          } catch {
            setMessage('Failed to create role.');
          }
        })}
      >
        <Input className="min-w-56 flex-1" placeholder="Role name" {...register('name')} />
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </Button>
      </form>
      {message ? <p className={`text-sm ${createMutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p> : null}
    </div>
  );
}
