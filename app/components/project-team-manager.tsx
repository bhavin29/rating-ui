'use client';

import { useMemo, useState } from 'react';
import {
  useAssignProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMemberStatus
} from '@/app/hooks/use-admin-mutations';
import { Button, Card, Input } from '@/app/components/ui';
import type { Member, Role } from '@/app/lib/api/types';

export function ProjectTeamManager({
  projectId,
  projectName,
  allUsers,
  initialMembers,
  roles
}: {
  projectId: string;
  projectName: string;
  allUsers: Member[];
  initialMembers: Member[];
  roles: Role[];
}) {
  const addMutation = useAssignProjectMembers();
  const removeMutation = useRemoveProjectMember();
  const updateStatusMutation = useUpdateProjectMemberStatus();
  const [assignedMembers, setAssignedMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');

  const assignedLookup = useMemo(() => new Set(assignedMembers.map((member) => member.id)), [assignedMembers]);

  const availableUsers = useMemo(
    () => allUsers.filter((user) => !assignedLookup.has(user.id)),
    [allUsers, assignedLookup]
  );

  const filteredAvailableUsers = useMemo(
    () =>
      availableUsers.filter((user) => {
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'ACTIVE') return user.isActive !== false;
        return user.isActive === false;
      }),
    [availableUsers, statusFilter]
  );

  const matchingUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return filteredAvailableUsers.slice(0, 8);
    }

    return filteredAvailableUsers
      .filter((user) =>
        [user.name, user.email, user.role, user.isActive === false ? 'inactive' : 'active']
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      )
      .slice(0, 8);
  }, [filteredAvailableUsers, searchTerm]);

  const selectedUser = availableUsers.find((user) => user.id === selectedUserId) ?? null;
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  function updateMemberStatus(memberId: string, isActive: boolean) {
    setAssignedMembers((current) =>
      current.map((member) => (member.id === memberId ? { ...member, membershipIsActive: isActive } : member))
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Project Team</h1>
          <p className="text-sm text-slate-500">Add users to {projectName} so they can be organized under this project.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Assigned users: {assignedMembers.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Available users: {availableUsers.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Active: {assignedMembers.filter((member) => member.membershipIsActive !== false).length}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Inactive: {assignedMembers.filter((member) => member.membershipIsActive === false).length}
          </span>
        </div>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Add team members</h2>
          <p className="text-sm text-slate-500">Search by first name, last name, email, or account role, then choose the project role.</p>
        </div>

        {availableUsers.length === 0 ? (
          <p className="text-sm text-slate-500">All available users are already part of this project.</p>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Input
                  className="min-w-64 flex-1"
                  placeholder="Search by name, email, role, active, inactive"
                  value={searchTerm}
                  onFocus={() => setIsPickerOpen(true)}
                  onChange={(event) => {
                    setMessage(null);
                    setMessageTone('success');
                    setIsPickerOpen(true);
                    setSearchTerm(event.target.value);
                    setSelectedUserId('');
                  }}
                />
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={statusFilter}
                  onChange={(event) => {
                    setMessage(null);
                    setMessageTone('success');
                    setSelectedUserId('');
                    setStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE');
                    setIsPickerOpen(true);
                  }}
                >
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">Active only</option>
                  <option value="INACTIVE">Inactive only</option>
                </select>
              </div>

              {isPickerOpen && searchTerm.trim() ? (
                <div className="rounded-lg border border-slate-200">
                  {matchingUsers.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-slate-500">No matching users found.</p>
                  ) : (
                    matchingUsers.map((user) => {
                      const isSelected = selectedUserId === user.id;

                      return (
                        <button
                          key={user.id}
                          type="button"
                          className={`flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition ${
                            isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            setMessage(null);
                            setMessageTone('success');
                            setSelectedUserId(user.id);
                            setSearchTerm(`${user.name} | ${user.email} | ${user.role}`);
                            setIsPickerOpen(false);
                          }}
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                              {user.role}
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium uppercase tracking-wide ${
                                user.isActive === false
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {user.isActive === false ? 'Inactive' : 'Active'}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : null}

              <div className="max-w-sm">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="project-member-role">
                  Project role
                </label>
                <select
                  id="project-member-role"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={selectedRoleId}
                  onChange={(event) => {
                    setMessage(null);
                    setMessageTone('success');
                    setSelectedRoleId(event.target.value);
                  }}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={addMutation.isPending || !selectedUser || !selectedRole}
                onClick={async () => {
                  setMessage(null);

                  if (!selectedUser) {
                    setMessageTone('error');
                    setMessage('Select a user from the search results first.');
                    return;
                  }

                  if (!selectedRole) {
                    setMessageTone('error');
                    setMessage('Select a project role before adding this member.');
                    return;
                  }

                  try {
                    await addMutation.mutateAsync({ projectId, memberIds: [selectedUser.id], roleId: selectedRole.id });
                    setAssignedMembers((current) => [
                      ...current,
                      {
                        ...selectedUser,
                        membershipRole: selectedRole.name,
                        membershipRoleId: selectedRole.id,
                        membershipIsActive: true
                      }
                    ]);
                    setSelectedUserId('');
                    setSelectedRoleId('');
                    setSearchTerm('');
                    setIsPickerOpen(false);
                    setMessageTone('success');
                    setMessage('Project team updated successfully.');
                  } catch (error) {
                    setMessageTone('error');
                    setMessage(error instanceof Error ? error.message : 'Failed to add project team members. Please try again.');
                  }
                }}
              >
                {addMutation.isPending ? 'Adding...' : 'Add to project'}
              </Button>
              {selectedUser ? (
                <p className="text-sm text-slate-500">
                  Selected: <span className="font-medium text-slate-700">{selectedUser.name}</span>
                </p>
              ) : null}
              {message ? (
                <p className={`text-sm ${messageTone === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                  {message}
                </p>
              ) : null}
            </div>
          </>
        )}
      </Card>

      <div className="space-y-3">
        {assignedMembers.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">No team members have been added to this project yet.</p>
          </Card>
        ) : (
          assignedMembers
            .filter((member) => {
              if (statusFilter === 'ALL') return true;
              if (statusFilter === 'ACTIVE') return member.membershipIsActive !== false;
              return member.membershipIsActive === false;
            })
            .map((member) => (
            <Card key={member.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{member.name}</h2>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={updateStatusMutation.isPending}
                    value={member.membershipRoleId ?? ''}
                    onChange={async (event) => {
                      setMessage(null);
                      const nextRoleId = event.target.value;
                      const nextRole = roles.find((role) => role.id === nextRoleId);

                      if (!nextRole) {
                        setMessageTone('error');
                        setMessage('Select a valid role for this project member.');
                        return;
                      }

                      try {
                        await updateStatusMutation.mutateAsync({ projectId, userId: member.id, roleId: nextRoleId });
                        setAssignedMembers((current) =>
                          current.map((entry) =>
                            entry.id === member.id
                              ? { ...entry, membershipRole: nextRole.name, membershipRoleId: nextRole.id }
                              : entry
                          )
                        );
                        setMessageTone('success');
                        setMessage('Project role updated.');
                      } catch (error) {
                        setMessageTone('error');
                        setMessage(error instanceof Error ? error.message : 'Failed to update the project role. Please try again.');
                      }
                    }}
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                      member.membershipIsActive === false ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {member.membershipIsActive === false ? 'Inactive' : 'Active'}
                  </span>
                  <button
                    type="button"
                    className="rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={updateStatusMutation.isPending}
                    onClick={async () => {
                      setMessage(null);
                      const nextIsActive = member.membershipIsActive === false;

                      try {
                        await updateStatusMutation.mutateAsync({ projectId, userId: member.id, isActive: nextIsActive });
                        updateMemberStatus(member.id, nextIsActive);
                        setMessageTone('success');
                        setMessage(`User marked as ${nextIsActive ? 'active' : 'inactive'}.`);
                      } catch (error) {
                        setMessageTone('error');
                        setMessage(error instanceof Error ? error.message : 'Failed to update the user status. Please try again.');
                      }
                    }}
                  >
                    {updateStatusMutation.isPending
                      ? 'Saving...'
                      : member.membershipIsActive === false
                        ? 'Set active'
                        : 'Set inactive'}
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={removeMutation.isPending || updateStatusMutation.isPending}
                    onClick={async () => {
                      setMessage(null);

                      try {
                        await removeMutation.mutateAsync({ projectId, userId: member.id });
                        setAssignedMembers((current) => current.filter((entry) => entry.id !== member.id));
                        setSelectedUserId('');
                        setSearchTerm('');
                        setIsPickerOpen(false);
                        setMessageTone('success');
                        setMessage('User removed from the project.');
                      } catch (error) {
                        setMessageTone('error');
                        setMessage(error instanceof Error ? error.message : 'Failed to remove the user from this project. Please try again.');
                      }
                    }}
                  >
                    {removeMutation.isPending ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
