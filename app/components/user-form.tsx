'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from '@/app/components/ui';
import type { AdminUser, Role } from '@/app/lib/api/types';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  roleId: z.string().min(1, 'Role is required'),
  isActive: z.boolean()
});

export type UserFormValues = z.infer<typeof schema>;

type UserFormProps = {
  roles: Role[];
  initialValues?: UserFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

export function UserForm({
  roles,
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
  isSubmitting = false
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      name: '',
      email: '',
      roleId: roles[0]?.id ?? '',
      isActive: true
    }
  });

  useEffect(() => {
    reset(
      initialValues ?? {
        name: '',
        email: '',
        roleId: roles[0]?.id ?? '',
        isActive: true
      }
    );
  }, [initialValues, reset, roles]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <Input placeholder="Full name" {...register('name')} />
          {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <Input type="email" placeholder="name@company.com" {...register('email')} />
          {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <Select {...register('roleId')}>
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          {errors.roleId ? <p className="text-xs text-red-600">{errors.roleId.message}</p> : null}
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('isActive')} />
          <span>
            <span className="block text-sm font-medium text-slate-700">Active</span>
            <span className="block text-xs text-slate-500">Inactive users stay visible but can be filtered easily.</span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function userToFormValues(user: AdminUser): UserFormValues {
  return {
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    isActive: user.isActive
  };
}
