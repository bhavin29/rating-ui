'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateRole, useUpdateRole } from '@/app/hooks/use-admin-mutations';

const schema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters')
});

type RoleFormValues = z.infer<typeof schema>;
type RolePayload = { id: string; name: string };

export function RoleForm({
  role,
  onCreated,
  onUpdated,
  onCancel
}: {
  role?: RolePayload;
  onCreated?: (role: RolePayload) => void;
  onUpdated?: (role: RolePayload) => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isEditMode = Boolean(role);
  const activeMutation = isEditMode ? updateMutation : createMutation;
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: role?.name ?? '' }
  });

  useEffect(() => {
    reset({ name: role?.name ?? '' });
    setMessage(null);
  }, [role, reset]);

  return (
    <div className="space-y-3">
      {!isEditMode ? (
        <div>
          <h2 className="text-base font-semibold text-slate-900">Create role</h2>
          <p className="text-sm text-slate-500">Add a role with a single name field.</p>
        </div>
      ) : null}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={handleSubmit(async (values) => {
          setMessage(null);

          try {
            if (isEditMode && role) {
              const result = (await updateMutation.mutateAsync({ roleId: role.id, name: values.name })) as {
                updateRole?: RolePayload;
                id?: string;
                name?: string;
              };
              const saved =
                result.updateRole ?? (result.id && result.name ? { id: result.id, name: result.name } : null);
              if (!saved) throw new Error('Role was not returned');
              setMessage('Role updated successfully.');
              onUpdated?.(saved);
            } else {
              const result = (await createMutation.mutateAsync({ name: values.name })) as {
                createRole?: RolePayload;
                id?: string;
                name?: string;
              };
              const saved =
                result.createRole ?? (result.id && result.name ? { id: result.id, name: result.name } : null);
              if (!saved) throw new Error('Role was not returned');
              reset({ name: '' });
              setMessage('Role created successfully.');
              onCreated?.(saved);
            }
          } catch {
            setMessage(isEditMode ? 'Failed to update role.' : 'Failed to create role.');
          }
        })}
      >
        <div className="min-w-56 flex-1 space-y-1">
          <Input placeholder="Role name" {...register('name')} />
          {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <Button type="submit" disabled={activeMutation.isPending}>
          {activeMutation.isPending ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create'}
        </Button>
        {isEditMode ? (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              reset({ name: role?.name ?? '' });
              setMessage(null);
              onCancel?.();
            }}
          >
            Cancel
          </button>
        ) : null}
      </form>
      {message ? (
        <p className={`text-sm ${activeMutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>
      ) : null}
    </div>
  );
}
