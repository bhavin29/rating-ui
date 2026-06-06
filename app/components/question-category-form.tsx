'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea } from '@/app/components/ui';
import { useCreateQuestionCategory, useUpdateQuestionCategory } from '@/app/hooks/use-admin-mutations';
import type { QuestionCategory } from '@/app/lib/api/types';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name must be at most 255 characters'),
  description: z.string().optional(),
  isActive: z.boolean()
});

type CategoryFormValues = z.infer<typeof schema>;

export function QuestionCategoryForm({
  category,
  onCreated,
  onUpdated,
  onCancel
}: {
  category?: QuestionCategory;
  onCreated?: (category: QuestionCategory) => void;
  onUpdated?: (category: QuestionCategory) => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreateQuestionCategory();
  const updateMutation = useUpdateQuestionCategory();
  const isEditMode = Boolean(category);
  const activeMutation = isEditMode ? updateMutation : createMutation;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      isActive: category?.isActive ?? true
    }
  });

  useEffect(() => {
    reset({
      name: category?.name ?? '',
      description: category?.description ?? '',
      isActive: category?.isActive ?? true
    });
    setServerError(null);
  }, [category, reset]);

  return (
    <div className="space-y-3">
      {!isEditMode ? (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Create category</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add a new category to group and filter questions.</p>
        </div>
      ) : null}
      <form
        className="space-y-3"
        onSubmit={handleSubmit(async (values) => {
          setServerError(null);
          try {
            if (isEditMode && category) {
              const result = (await updateMutation.mutateAsync({
                id: category.id,
                name: values.name,
                description: values.description?.trim() || null,
                isActive: values.isActive
              })) as QuestionCategory;
              onUpdated?.(result);
            } else {
              const result = (await createMutation.mutateAsync({
                name: values.name,
                description: values.description?.trim() || null,
                isActive: values.isActive
              })) as QuestionCategory;
              reset({ name: '', description: '', isActive: true });
              onCreated?.(result);
            }
          } catch (err) {
            const message =
              err instanceof Error ? err.message : isEditMode ? 'Failed to update category.' : 'Failed to create category.';
            if (message.toLowerCase().includes('already exists')) {
              setError('name', { message });
            } else {
              setServerError(message);
            }
          }
        })}
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Name
          </label>
          <Input placeholder="Category name" {...register('name')} />
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description{' '}
            <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <Textarea rows={3} placeholder="Optional description" {...register('description')} />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-700/30">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
            {...register('isActive')}
          />
          <span>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Inactive categories are hidden from question assignment.
            </span>
          </span>
        </label>

        {serverError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={activeMutation.isPending}>
            {activeMutation.isPending
              ? isEditMode
                ? 'Saving...'
                : 'Creating...'
              : isEditMode
                ? 'Save changes'
                : 'Create category'}
          </Button>
          {isEditMode ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={onCancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
