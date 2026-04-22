'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select } from '@/app/components/ui';
import { UserForm, type UserFormValues, userToFormValues } from '@/app/components/user-form';
import { useCreateUser, useDeleteUser, useUpdateUser } from '@/app/hooks/use-admin-mutations';
import type { AdminUser, Role } from '@/app/lib/api/types';

const PAGE_SIZE = 10;

type Notification = {
  tone: 'success' | 'error';
  message: string;
};

export function UsersView({ initialUsers, roles }: { initialUsers: AdminUser[]; roles: Role[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, activeFilter]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && user.isActive) ||
        (activeFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesActive;
    });
  }, [activeFilter, roleFilter, search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
  const activeUserCount = users.filter((user) => user.isActive).length;

  async function handleCreate(values: UserFormValues) {
    setNotification(null);

    try {
      const created = await createUserMutation.mutateAsync(values);
      setUsers((current) => [created as AdminUser, ...current]);
      setNotification({ tone: 'success', message: 'User created successfully.' });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to create user.' });
    }
  }

  async function handleUpdate(userId: string, values: UserFormValues) {
    setNotification(null);

    try {
      const updated = (await updateUserMutation.mutateAsync({ userId, ...values })) as AdminUser;
      setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
      setEditingUserId(null);
      setNotification({ tone: 'success', message: 'User updated successfully.' });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to update user.' });
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    setNotification(null);

    try {
      const updated = (await updateUserMutation.mutateAsync({
        userId: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        isActive: !user.isActive
      })) as AdminUser;
      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
      setNotification({
        tone: 'success',
        message: `${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}.`
      });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to update user status.' });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setNotification(null);

    try {
      await deleteUserMutation.mutateAsync({ userId: deleteTarget.id });
      setUsers((current) => current.filter((user) => user.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotification({ tone: 'success', message: 'User deleted successfully.' });
    } catch {
      setNotification({ tone: 'error', message: 'Failed to delete user.' });
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-slate-500">Create, update, filter, and manage user access from one place.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Users: {users.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Active: {activeUserCount}</span>
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
          <h2 className="text-base font-semibold text-slate-900">Add user</h2>
          <p className="text-sm text-slate-500">New users need a valid email, role, and active status.</p>
        </div>
        <UserForm
          roles={roles}
          submitLabel="Create user"
          submittingLabel="Creating..."
          onSubmit={handleCreate}
          isSubmitting={createUserMutation.isPending}
        />
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role"
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
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No users match the current search and filter settings.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3" colSpan={editingUserId === user.id ? 5 : 1}>
                      {editingUserId === user.id ? (
                        <div className="min-w-[32rem]">
                          <div className="mb-3">
                            <p className="font-medium text-slate-900">Edit user</p>
                            <p className="text-xs text-slate-500">Update profile details, role, or active status.</p>
                          </div>
                          <UserForm
                            roles={roles}
                            initialValues={userToFormValues(user)}
                            submitLabel="Save changes"
                            submittingLabel="Saving..."
                            onSubmit={(values) => handleUpdate(user.id, values)}
                            onCancel={() => setEditingUserId(null)}
                            isSubmitting={updateUserMutation.isPending}
                          />
                        </div>
                      ) : (
                        <p className="font-medium text-slate-900">{user.name}</p>
                      )}
                    </td>
                    {editingUserId === user.id ? null : (
                      <>
                        <td className="px-4 py-3 text-slate-700">{user.email}</td>
                        <td className="px-4 py-3 text-slate-700">{user.role}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                            onClick={() => handleToggleStatus(user)}
                            disabled={updateUserMutation.isPending}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700"
                              onClick={() => setEditingUserId(user.id)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                              onClick={() => setDeleteTarget(user)}
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
            Showing {filteredUsers.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(safeCurrentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
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
            <h2 className="text-lg font-semibold text-slate-900">Delete user?</h2>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently remove <span className="font-medium text-slate-900">{deleteTarget.name}</span>.
            </p>
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
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
