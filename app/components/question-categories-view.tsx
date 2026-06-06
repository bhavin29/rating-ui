'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select } from '@/app/components/ui';
import { QuestionCategoryForm } from '@/app/components/question-category-form';
import { useDeleteQuestionCategory, useToggleQuestionCategoryStatus } from '@/app/hooks/use-admin-mutations';
import type { QuestionCategory } from '@/app/lib/api/types';

const PAGE_SIZE = 20;

type Notification = {
  tone: 'success' | 'error';
  message: string;
};

export function QuestionCategoriesView({
  initialCategories,
  canCreate,
  canUpdate,
  canDelete
}: {
  initialCategories: QuestionCategory[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionCategory | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const deleteMutation = useDeleteQuestionCategory();
  const toggleMutation = useToggleQuestionCategoryStatus();

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter((cat) => {
      const matchesSearch = !term || cat.name.toLowerCase().includes(term);
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && cat.isActive) ||
        (activeFilter === 'inactive' && !cat.isActive);
      return matchesSearch && matchesActive;
    });
  }, [categories, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = filteredCategories.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );
  const activeCount = categories.filter((c) => c.isActive).length;

  async function handleToggle(category: QuestionCategory) {
    setNotification(null);
    try {
      const result = (await toggleMutation.mutateAsync({
        id: category.id,
        isActive: !category.isActive
      })) as { id: string; isActive: boolean };
      setCategories((current) =>
        current.map((c) => (c.id === result.id ? { ...c, isActive: result.isActive } : c))
      );
      setNotification({
        tone: 'success',
        message: `Category marked as ${result.isActive ? 'active' : 'inactive'}.`
      });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to update category status.' });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setNotification(null);
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      setCategories((current) => current.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotification({ tone: 'success', message: 'Category deleted successfully.' });
    } catch {
      setDeleteTarget(null);
      setNotification({ tone: 'error', message: 'Failed to delete category.' });
    }
  }

  return (
    <section className="space-y-4">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-slate-100">Question Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage categories used to group and filter questions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
            Categories: {categories.length}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
            Active: {activeCount}
          </span>
        </div>
      </div>

      {/* Notification banner */}
      {notification ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notification.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400'
          }`}
        >
          {notification.message}
        </div>
      ) : null}

      {/* Create form */}
      {canCreate ? (
        <Card className="space-y-3">
          <QuestionCategoryForm
            onCreated={(category) => {
              setCategories((current) =>
                current.some((c) => c.id === category.id) ? current : [category, ...current]
              );
              setNotification({ tone: 'success', message: 'Category created successfully.' });
            }}
          />
        </Card>
      ) : null}

      {/* Filter bar + table */}
      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="md:col-span-2"
          />
          <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Description</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr className="border-t border-slate-100 dark:border-slate-700">
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    {search.trim() || activeFilter !== 'all'
                      ? 'No categories match the current filters.'
                      : 'No categories have been created yet.'}
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-slate-100 align-top dark:border-slate-700"
                  >
                    <td
                      className="px-4 py-3"
                      colSpan={editingCategoryId === category.id ? 4 : 1}
                    >
                      {editingCategoryId === category.id ? (
                        <div className="min-w-[28rem]">
                          <QuestionCategoryForm
                            category={category}
                            onUpdated={(updated) => {
                              setCategories((current) =>
                                current.map((c) => (c.id === updated.id ? updated : c))
                              );
                              setEditingCategoryId(null);
                              setNotification({
                                tone: 'success',
                                message: 'Category updated successfully.'
                              });
                            }}
                            onCancel={() => setEditingCategoryId(null)}
                          />
                        </div>
                      ) : (
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {category.name}
                        </p>
                      )}
                    </td>

                    {editingCategoryId === category.id ? null : (
                      <>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {category.description ? (
                            category.description
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">&mdash;</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {canUpdate ? (
                            <button
                              type="button"
                              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                category.isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                              }`}
                              onClick={() => handleToggle(category)}
                              disabled={toggleMutation.isPending}
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </button>
                          ) : (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                category.isActive
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {canUpdate ? (
                              <button
                                type="button"
                                className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                onClick={() => setEditingCategoryId(category.id)}
                              >
                                Edit
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                type="button"
                                className="rounded border border-red-300 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 dark:border-red-700/60 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => setDeleteTarget(category)}
                              >
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
          <p>
            {filteredCategories.length === 0
              ? 'No results'
              : `Showing ${(safeCurrentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  filteredCategories.length
                )} of ${filteredCategories.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Delete category?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              This will permanently remove{' '}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {deleteTarget.name}
              </span>
              .
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
