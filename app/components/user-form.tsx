'use client';

import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from '@/app/components/ui';
import type { AdminUser, MemberLevel, Role, Skill } from '@/app/lib/api/types';
import { LEVEL_LABELS, MEMBER_LEVELS } from '@/app/lib/api/types';

const userRoleSchema = z.object({
  roleId: z.string().min(1, 'Role is required'),
  skillId: z.string().min(1, 'Skill is required'),
  level: z.enum(['L1', 'L2', 'L3', 'L1_PLUS', 'L2_PLUS', 'L3_PLUS'], {
    errorMap: () => ({ message: 'Level is required' })
  })
});

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  roleId: z.string().min(1, 'Role is required'),
  isActive: z.boolean(),
  userRoles: z.array(userRoleSchema).min(1, 'At least one role assignment is required')
});

export type UserFormValues = z.infer<typeof schema>;

type UserFormProps = {
  roles: Role[];
  skills: Skill[];
  initialValues?: UserFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  resetOnSuccess?: boolean;
};

export function UserForm({
  roles,
  skills,
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  resetOnSuccess = false
}: UserFormProps) {
  const emptyValues = useMemo(
    () =>
      initialValues ?? {
        name: '',
        email: '',
        roleId: '',
        isActive: true,
        userRoles: []
      },
    [initialValues]
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'userRoles' });

  useEffect(() => {
    reset(emptyValues);
  }, [emptyValues, reset]);

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        if (resetOnSuccess) {
          reset({ name: '', email: '', roleId: '', isActive: true, userRoles: [] });
        }
      })}
    >
      {/* Basic details */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
          <Input placeholder="Full name" {...register('name')} />
          {errors.name ? <p className="text-xs text-red-600 dark:text-red-400">{errors.name.message}</p> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
          <Input type="email" placeholder="name@company.com" {...register('email')} />
          {errors.email ? <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Role</span>
          <Select {...register('roleId')}>
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          {errors.roleId ? <p className="text-xs text-red-600 dark:text-red-400">{errors.roleId.message}</p> : null}
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-700/30">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
            {...register('isActive')}
          />
          <span>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Inactive team members stay visible but can be filtered easily.
            </span>
          </span>
        </label>
      </div>

      {/* Role Assignments */}
      <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Role Assignments</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assign one or more roles with optional skill and level.
            </p>
          </div>
          <button
            type="button"
            onClick={() => append({ roleId: '', skillId: '', level: '' as MemberLevel })}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            + Add row
          </button>
        </div>

        {fields.length === 0 ? (
          <div className={`rounded-lg py-4 text-center text-xs ${errors.userRoles?.root?.message || errors.userRoles?.message ? 'bg-red-50 dark:bg-red-950/30' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
            {(errors.userRoles?.root?.message || errors.userRoles?.message) ? (
              <p className="font-medium text-red-600 dark:text-red-400">
                {errors.userRoles?.root?.message ?? errors.userRoles?.message}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500">
                No role assignments yet. Click <strong>+ Add row</strong> to add one.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Skill</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Level</th>
                  <th className="w-8 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-3 py-2">
                      <Select {...register(`userRoles.${index}.roleId`)}>
                        <option value="">Select role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </Select>
                      {errors.userRoles?.[index]?.roleId ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {errors.userRoles[index].roleId?.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <Select {...register(`userRoles.${index}.skillId`)}>
                        <option value="">Select skill</option>
                        {skills.map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                      </Select>
                      {errors.userRoles?.[index]?.skillId ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {errors.userRoles[index].skillId?.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <Select {...register(`userRoles.${index}.level`)}>
                        <option value="">Select level</option>
                        {MEMBER_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {LEVEL_LABELS[lvl]}
                          </option>
                        ))}
                      </Select>
                      {errors.userRoles?.[index]?.level ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {errors.userRoles[index].level?.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label="Remove row"
                        className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
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
    isActive: user.isActive,
    userRoles: user.userRoles.map((ur) => ({
      roleId: ur.role.id,
      skillId: ur.skill?.id ?? '',
      level: (ur.level ?? '') as MemberLevel
    }))
  };
}
