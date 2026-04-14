'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/app/components/ui';
import { useCreateRole, useUpdateRole } from '@/app/hooks/use-admin-mutations';

const schema = z.object({
  roleId: z.string().optional(),
  name: z.string().trim().min(2, 'Role name must be at least 2 characters.')
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
  const { register, handleSubmit, reset } = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roleId: role?.id,
      name: role?.name ?? ''
    }
  });

  useEffect(() => {
    reset({ roleId: role?.id, name: role?.name ?? '' });
    setMessage(null);
  }, [role, reset]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{isEditMode ? 'Edit role' : 'Create role'}</h2>
        <p className="text-sm text-slate-500">
          {isEditMode
            ? 'Update the role name used by users and role-based rating questions.'
            : 'Add a new role so users and questions can be categorized correctly.'}
        </p>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={handleSubmit(async (values) => {
          setMessage(null);

          try {
            const result = (await (isEditMode
              ? updateMutation.mutateAsync({ roleId: values.roleId ?? role?.id ?? '', name: values.name })
              : createMutation.mutateAsync({ name: values.name }))) as {
              createRole?: RolePayload;
              updateRole?: RolePayload;
              id?: string;
              name?: string;
            };

            const returnedRole = isEditMode ? result.updateRole : result.createRole;
            const savedRole = returnedRole ?? (result.id && result.name ? { id: result.id, name: result.name } : null);

            if (!savedRole) {
              throw new Error('Role was not returned');
            }

            if (isEditMode) {
              setMessage('Role updated successfully.');
              onUpdated?.(savedRole);
            } else {
              reset({ roleId: undefined, name: '' });
              setMessage('Role created successfully.');
              onCreated?.(savedRole);
            }
          } catch {
            setMessage(
              isEditMode
                ? 'Failed to update role. Please review the role name and try again.'
                : 'Failed to create role. Please review the role name and try again.'
            );
          }
        })}
      >
        <Input className="min-w-56 flex-1" placeholder="Role name" {...register('name')} />
        <Button type="submit" disabled={activeMutation.isPending}>
          {activeMutation.isPending ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create'}
        </Button>
        {isEditMode ? (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              reset({ roleId: role?.id, name: role?.name ?? '' });
              setMessage(null);
              onCancel?.();
            }}
          >
            Cancel
          </button>
        ) : null}
        <input type="hidden" {...register('roleId')} />
      </form>
      {message ? <p className={`text-sm ${activeMutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p> : null}
    </div>
  );
}
