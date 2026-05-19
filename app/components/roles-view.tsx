'use client';

import { useMemo, useState } from 'react';
import { Card, Input } from '@/app/components/ui';
import { RoleForm } from '@/app/components/role-form';
import { useDeleteRole } from '@/app/hooks/use-admin-mutations';
import type { Role } from '@/app/lib/api/types';

type Notification = {
  tone: 'success' | 'error';
  message: string;
};

export function RolesView({ initialRoles }: { initialRoles: Role[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [search, setSearch] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const deleteRoleMutation = useDeleteRole();

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return roles;
    }

    return roles.filter((role) => role.name.toLowerCase().includes(term));
  }, [roles, search]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setNotification(null);

    try {
      await deleteRoleMutation.mutateAsync({ roleId: deleteTarget.id });
      setRoles((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotification({ tone: 'success', message: 'Role deleted successfully.' });
    } catch {
      setDeleteTarget(null);
      setNotification({ tone: 'error', message: 'Failed to delete role.' });
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-slate-500">Manage roles by name with add, edit, delete, and search.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Roles: {roles.length}</span>
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

      <Card>
        <RoleForm
          onCreated={(role) => {
            setRoles((current) => (current.some((item) => item.id === role.id) ? current : [role, ...current]));
            setNotification({ tone: 'success', message: 'Role created successfully.' });
          }}
        />
      </Card>

      <Card className="space-y-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search roles by name"
          className="max-w-sm"
        />
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    {search.trim() ? 'No roles match the current search.' : 'No roles have been created yet.'}
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3" colSpan={editingRoleId === role.id ? 2 : 1}>
                      {editingRoleId === role.id ? (
                        <RoleForm
                          role={role}
                          onUpdated={(updatedRole) => {
                            setRoles((current) =>
                              current.map((item) => (item.id === updatedRole.id ? updatedRole : item))
                            );
                            setEditingRoleId(null);
                            setNotification({ tone: 'success', message: 'Role updated successfully.' });
                          }}
                          onCancel={() => setEditingRoleId(null)}
                        />
                      ) : (
                        <p className="font-medium text-slate-900">{role.name}</p>
                      )}
                    </td>
                    {editingRoleId === role.id ? null : (
                      <td className="px-4 py-3 text-slate-700">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700"
                            onClick={() => setEditingRoleId(role.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                            onClick={() => setDeleteTarget(role)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Delete role?</h2>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently remove the role{' '}
              <span className="font-medium text-slate-900">{deleteTarget.name}</span>. Users and questions assigned to
              this role will lose their role association.
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
                disabled={deleteRoleMutation.isPending}
              >
                {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
