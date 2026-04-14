'use client';

import { useMemo, useState } from 'react';
import { Card, Input } from '@/app/components/ui';
import { RoleForm } from '@/app/components/role-form';
import { useDeleteRole } from '@/app/hooks/use-admin-mutations';
import type { Role } from '@/app/lib/api/types';

export function RolesView({ initialRoles }: { initialRoles: Role[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const deleteRoleMutation = useDeleteRole();

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return roles;
    }

    return roles.filter((role) => role.name.toLowerCase().includes(term));
  }, [roles, search]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-slate-500">Manage roles by name with add, delete, and search.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Roles: {roles.length}</span>
      </div>

      <Card>
        <RoleForm
          onCreated={(role) => {
            setRoles((current) => (current.some((item) => item.id === role.id) ? current : [role, ...current]));
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
              {filteredRoles.map((role) => (
                <tr key={role.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{role.name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <button
                      type="button"
                      className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                      onClick={async () => {
                        setMessage(null);
                        try {
                          await deleteRoleMutation.mutateAsync({ roleId: role.id });
                          setRoles((current) => current.filter((item) => item.id !== role.id));
                          setMessage('Role deleted successfully.');
                        } catch {
                          setMessage('Failed to delete role.');
                        }
                      }}
                      disabled={deleteRoleMutation.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {message ? <p className={`text-sm ${deleteRoleMutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p> : null}
    </section>
  );
}
