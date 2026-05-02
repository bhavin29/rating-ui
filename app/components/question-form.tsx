'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, Textarea } from '@/app/components/ui';
import type { AdminQuestion, Project, Role, Sprint } from '@/app/lib/api/types';

const schema = z.object({
  text: z.string().trim().min(5, 'Question text must be at least 5 characters'),
  roleId: z.string().min(1, 'Role is required'),
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
  isActive: z.boolean()
});

export type QuestionFormValues = z.infer<typeof schema>;

type QuestionFormProps = {
  roles: Role[];
  projects: Project[];
  sprints: Sprint[];
  initialValues?: QuestionFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  resetOnSuccess?: boolean;
};

export function QuestionForm({
  roles,
  projects,
  sprints,
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  resetOnSuccess = false
}: QuestionFormProps) {
  const emptyValues = useMemo(
    () =>
      initialValues ?? {
        text: '',
        roleId: roles[0]?.id ?? '',
        projectId: '',
        sprintId: '',
        isActive: true
      },
    [initialValues, roles]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues
  });

  useEffect(() => {
    reset(emptyValues);
  }, [emptyValues, reset, roles]);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);

        if (resetOnSuccess) {
          reset({
            text: '',
            roleId: roles[0]?.id ?? '',
            projectId: '',
            sprintId: '',
            isActive: true
          });
        }
      })}
    >
      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Question</span>
        <Textarea rows={4} placeholder="Enter the question text" {...register('text')} />
        {errors.text ? <p className="text-xs text-red-600">{errors.text.message}</p> : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
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

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Project</span>
          <Select {...register('projectId')}>
            <option value="">Not assigned</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Sprint</span>
          <Select {...register('sprintId')}>
            <option value="">Not assigned</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.project?.name ? `${sprint.name} (${sprint.project.name})` : sprint.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('isActive')} />
          <span>
            <span className="block text-sm font-medium text-slate-700">Active</span>
            <span className="block text-xs text-slate-500">Inactive questions stay available for history and review.</span>
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

export function questionToFormValues(question: AdminQuestion): QuestionFormValues {
  return {
    text: question.text,
    roleId: question.roleId,
    projectId: question.projectId ?? '',
    sprintId: question.sprintId ?? '',
    isActive: question.isActive
  };
}
