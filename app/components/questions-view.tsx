'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select } from '@/app/components/ui';
import { QuestionForm, type QuestionFormValues, questionToFormValues } from '@/app/components/question-form';
import {
  useCreateQuestion,
  useDeleteQuestion,
  useToggleQuestionStatus,
  useUpdateQuestion
} from '@/app/hooks/use-admin-mutations';
import type { AdminQuestion, Role } from '@/app/lib/api/types';

const PAGE_SIZE = 10;

type Notification = {
  tone: 'success' | 'error';
  message: string;
};

export function QuestionsView({ initialQuestions, roles }: { initialQuestions: AdminQuestion[]; roles: Role[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminQuestion | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const toggleQuestionStatusMutation = useToggleQuestionStatus();

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, activeFilter]);

  const roleNameById = useMemo(() => Object.fromEntries(roles.map((role) => [role.id, role.name])), [roles]);

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch = !term || question.text.toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' || question.roleId === roleFilter;
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && question.isActive) ||
        (activeFilter === 'inactive' && !question.isActive);

      return matchesSearch && matchesRole && matchesActive;
    });
  }, [activeFilter, questions, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = filteredQuestions.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
  const activeQuestionCount = questions.filter((question) => question.isActive).length;

  async function handleCreate(values: QuestionFormValues) {
    setNotification(null);

    try {
      const created = (await createQuestionMutation.mutateAsync(values)) as AdminQuestion;
      setQuestions((current) => [created, ...current]);
      setNotification({ tone: 'success', message: 'Question created successfully.' });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to create question.' });
    }
  }

  async function handleUpdate(questionId: string, values: QuestionFormValues) {
    setNotification(null);

    try {
      const updated = (await updateQuestionMutation.mutateAsync({ id: questionId, ...values })) as AdminQuestion;
      setQuestions((current) => current.map((question) => (question.id === questionId ? updated : question)));
      setEditingQuestionId(null);
      setNotification({ tone: 'success', message: 'Question updated successfully.' });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to update question.' });
    }
  }

  async function handleToggleStatus(question: AdminQuestion) {
    setNotification(null);

    try {
      const updated = (await toggleQuestionStatusMutation.mutateAsync({
        id: question.id,
        isActive: !question.isActive
      })) as AdminQuestion;
      setQuestions((current) => current.map((item) => (item.id === question.id ? updated : item)));
      setNotification({
        tone: 'success',
        message: `Question marked as ${updated.isActive ? 'active' : 'inactive'}.`
      });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to update question status.' });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setNotification(null);

    try {
      await deleteQuestionMutation.mutateAsync({ id: deleteTarget.id });
      setQuestions((current) => current.filter((question) => question.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotification({ tone: 'success', message: 'Question deleted successfully.' });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to delete question.' });
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Questions</h1>
          <p className="text-sm text-slate-500">Manage role-based questions with filters, status control, and CRUD actions.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Questions: {questions.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Active: {activeQuestionCount}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Roles: {roles.length}</span>
        </div>
      </div>

      {notification ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notification.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notification.message}
        </div>
      ) : null}

      <Card className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Add question</h2>
          <p className="text-sm text-slate-500">Assign each question to a role and control whether it is currently active.</p>
        </div>
        <QuestionForm
          roles={roles}
          submitLabel="Create question"
          submittingLabel="Creating..."
          onSubmit={handleCreate}
          isSubmitting={createQuestionMutation.isPending}
          resetOnSuccess
        />
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions by text"
            className="md:col-span-2"
          />
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          <Select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Text</th>
                <th className="px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuestions.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No questions match the current search and filter settings.
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((question) => (
                  <tr key={question.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3" colSpan={editingQuestionId === question.id ? 4 : 1}>
                      {editingQuestionId === question.id ? (
                        <div className="min-w-[32rem]">
                          <div className="mb-3">
                            <p className="font-medium text-slate-900">Edit question</p>
                            <p className="text-xs text-slate-500">Refine the wording, role assignment, or active status.</p>
                          </div>
                          <QuestionForm
                            roles={roles}
                            initialValues={questionToFormValues(question)}
                            submitLabel="Save changes"
                            submittingLabel="Saving..."
                            onSubmit={(values) => handleUpdate(question.id, values)}
                            onCancel={() => setEditingQuestionId(null)}
                            isSubmitting={updateQuestionMutation.isPending}
                          />
                        </div>
                      ) : (
                        <p className="max-w-3xl leading-6 text-slate-900">{question.text}</p>
                      )}
                    </td>
                    {editingQuestionId === question.id ? null : (
                      <>
                        <td className="px-4 py-3 text-slate-700">{roleNameById[question.roleId] ?? 'Unknown role'}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              question.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                            onClick={() => handleToggleStatus(question)}
                            disabled={toggleQuestionStatusMutation.isPending}
                          >
                            {question.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700"
                              onClick={() => setEditingQuestionId(question.id)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                              onClick={() => setDeleteTarget(question)}
                            >
                              Delete
                            </button>
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

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <p>
            Showing {filteredQuestions.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(safeCurrentPage * PAGE_SIZE, filteredQuestions.length)} of {filteredQuestions.length} questions
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Delete question?</h2>
            <p className="mt-2 text-sm text-slate-600">This will permanently remove the selected question.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleteQuestionMutation.isPending}
              >
                {deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
