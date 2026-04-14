'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui';
import { RoleForm } from '@/app/components/role-form';
import { useDeleteRole } from '@/app/hooks/use-admin-mutations';

type RoleRow = {
  id: string;
  name: string;
};

export function RolesView({ initialRoles }: { initialRoles: RoleRow[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteRole();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-slate-500">Manage role records used across users and role-based questions</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Total roles: {roles.length}</span>
        </div>
      </div>

      <Card>
        <RoleForm
          onCreated={(createdRole) => {
            setMessage(null);
            setRoles((current) => {
              if (current.some((item) => item.id === createdRole.id)) {
                return current;
              }

              return [createdRole, ...current];
            });
          }}
        />
      </Card>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Role</th>
              <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  {editingRoleId === role.id ? (
                    <RoleForm
                      role={role}
                      onUpdated={(updatedRole) => {
                        setMessage(null);
                        setRoles((current) =>
                          current.map((item) => (item.id === updatedRole.id ? { ...item, name: updatedRole.name } : item))
                        );
                        setEditingRoleId(null);
                      }}
                      onCancel={() => setEditingRoleId(null)}
                    />
                  ) : (
                    <p className="font-medium text-slate-900">{role.name}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingRoleId === role.id ? null : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded border px-3 py-2 text-sm"
                        onClick={() => {
                          setMessage(null);
                          setEditingRoleId(role.id);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                        disabled={deleteMutation.isPending}
                        onClick={async () => {
                          setMessage(null);

                          try {
                            await deleteMutation.mutateAsync({ roleId: role.id });
                            setRoles((current) => current.filter((item) => item.id !== role.id));
                            setEditingRoleId((current) => (current === role.id ? null : current));
                            setMessage('Role deleted successfully.');
                          } catch {
                            setMessage('Failed to delete role. It may still be linked to users or questions.');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {roles.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={2}>
                  No roles found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
