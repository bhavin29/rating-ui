'use client';

import { useMemo, useState } from 'react';
import {
  useAssignProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMemberStatus
} from '@/app/hooks/use-admin-mutations';
import { Button, Card, Input } from '@/app/components/ui';
import type { AdminUser, Member, Role } from '@/app/lib/api/types';

function AllocationInput({
  value,
  onChange,
  disabled
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        max={100}
        step={5}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          const n = Math.min(100, Math.max(0, Number(e.target.value)));
          onChange(Number.isNaN(n) ? 0 : n);
        }}
        className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      />
      <span className="text-sm text-slate-500 dark:text-slate-400">%</span>
    </div>
  );
}

export function ProjectTeamManager({
  projectId,
  projectName,
  allUsers,
  initialMembers,
  roles
}: {
  projectId: string;
  projectName: string;
  allUsers: AdminUser[];
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
  const [allocation, setAllocation] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');

  // Inline-edit state keyed by membershipId
  const [editingMembershipId, setEditingMembershipId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState('');
  const [editAllocation, setEditAllocation] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);

  // All users are searchable — same user can have multiple memberships
  const matchingUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sorted = [...allUsers].sort((a, b) => a.name.localeCompare(b.name));
    if (!term) return sorted.slice(0, 8);
    return sorted
      .filter((u) =>
        [u.name, u.email, u.role, u.isActive === false ? 'inactive' : 'active']
          .join(' ')
          .toLowerCase()
          .includes(term)
      )
      .slice(0, 8);
  }, [allUsers, searchTerm]);

  const selectedUser = allUsers.find((u) => u.id === selectedUserId) ?? null;
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  const filteredMembers = useMemo(
    () =>
      [...assignedMembers]
        .filter((m) => {
          if (statusFilter === 'ACTIVE') return m.membershipIsActive !== false;
          if (statusFilter === 'INACTIVE') return m.membershipIsActive === false;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [assignedMembers, statusFilter]
  );

  function notify(tone: 'success' | 'error', text: string) {
    setMessageTone(tone);
    setMessage(text);
  }

  function startEdit(member: Member) {
    setEditingMembershipId(member.membershipId);
    setEditRoleId(member.membershipRoleId ?? '');
    setEditAllocation(member.allocationPercentage);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingMembershipId(null);
    setEditError(null);
  }

  function totalAllocationForUser(userId: string, excludeMembershipId?: string): number {
    return assignedMembers
      .filter((m) => m.id === userId && m.membershipId !== excludeMembershipId)
      .reduce((sum, m) => sum + m.allocationPercentage, 0);
  }

  return (
    <section className="space-y-4">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">Project</p>
          <h1 className="text-2xl font-bold dark:text-slate-100">{projectName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage team membership for this project.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">Memberships: {assignedMembers.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
            Active: {assignedMembers.filter((m) => m.membershipIsActive !== false).length}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
            Inactive: {assignedMembers.filter((m) => m.membershipIsActive === false).length}
          </span>
        </div>
      </div>

      {/* Add member card */}
      <Card className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Add team members to</h2>
            <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-sm font-semibold text-indigo-700 dark:border-indigo-700/60 dark:bg-indigo-900/30 dark:text-indigo-300">
              {projectName}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            A user can be added more than once with different roles. Search, pick a role and allocation, then add.
          </p>
        </div>

        <div className="space-y-3">
          {/* Search + status filter row */}
          <div className="flex flex-wrap gap-3">
            <Input
              className="min-w-64 flex-1"
              placeholder="Search by name, email, role, active, inactive"
              value={searchTerm}
              onFocus={() => setIsPickerOpen(true)}
              onChange={(e) => {
                setMessage(null);
                setIsPickerOpen(true);
                setSearchTerm(e.target.value);
                setSelectedUserId('');
              }}
            />
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-slate-500"
              value={statusFilter}
              onChange={(e) => {
                setMessage(null);
                setSelectedUserId('');
                setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE');
                setIsPickerOpen(true);
              }}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active only</option>
              <option value="INACTIVE">Inactive only</option>
            </select>
          </div>

          {/* User picker dropdown */}
          {isPickerOpen && searchTerm.trim() ? (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              {matchingUsers.length === 0 ? (
                <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">No matching users found.</p>
              ) : (
                matchingUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={`flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition ${
                        isSelected ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                      onClick={() => {
                        setMessage(null);
                        setSelectedUserId(user.id);
                        setSearchTerm(`${user.name} | ${user.email} | ${user.role}`);
                        setIsPickerOpen(false);
                      }}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {user.role}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium uppercase tracking-wide ${
                            user.isActive === false
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
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

          {/* Role + allocation row */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="max-w-xs flex-1">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="add-member-role">
                Project role
              </label>
              <select
                id="add-member-role"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-slate-500"
                value={selectedRoleId}
                onChange={(e) => { setMessage(null); setSelectedRoleId(e.target.value); }}
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Allocation %
              </label>
              <AllocationInput value={allocation} onChange={setAllocation} />
              {selectedUser && (() => {
                const used = totalAllocationForUser(selectedUser.id);
                const remaining = 100 - used;
                return used > 0 ? (
                  <p className={`mt-1 text-xs ${remaining < allocation ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {used}% already assigned — {remaining}% remaining
                  </p>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Add button + feedback */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={addMutation.isPending || !selectedUser || !selectedRole}
            onClick={async () => {
              setMessage(null);
              if (!selectedUser) { notify('error', 'Select a user from the search results first.'); return; }
              if (!selectedRole) { notify('error', 'Select a project role before adding this member.'); return; }
              const existingTotal = totalAllocationForUser(selectedUser.id);
              if (existingTotal + allocation > 100) {
                notify('error', `Total allocation for ${selectedUser.name} would be ${existingTotal + allocation}% — cannot exceed 100%.`);
                return;
              }
              try {
                const result = await addMutation.mutateAsync({
                  projectId,
                  memberIds: [selectedUser.id],
                  roleId: selectedRole.id,
                  allocationPercentage: allocation
                });
                // addProjectMembers returns an array of new memberships
                const added = Array.isArray(result) ? result : [result];
                const newMembers: Member[] = (added as Array<{
                  id: string;
                  isActive?: boolean;
                  roleId?: string | null;
                  allocationPercentage?: number | null;
                  role?: { id: string; name: string } | null;
                  user?: { id: string; fullName: string; email: string; isActive?: boolean; role: { id: string; name: string } };
                }>).map((m) => ({
                  id: m.user?.id ?? selectedUser.id,
                  membershipId: m.id,
                  name: m.user?.fullName ?? selectedUser.name,
                  email: m.user?.email ?? selectedUser.email,
                  role: m.user?.role.name ?? selectedUser.role,
                  roleId: m.user?.role.id ?? selectedUser.roleId,
                  membershipRole: m.role?.name ?? selectedRole.name,
                  membershipRoleId: m.roleId ?? selectedRole.id,
                  isActive: m.user?.isActive,
                  membershipIsActive: m.isActive ?? true,
                  allocationPercentage: m.allocationPercentage ?? allocation
                }));
                setAssignedMembers((prev) => [...prev, ...newMembers]);
                setSelectedUserId('');
                setSelectedRoleId('');
                setSearchTerm('');
                setAllocation(0);
                setIsPickerOpen(false);
                notify('success', 'Team member added successfully.');
              } catch (error) {
                notify('error', error instanceof Error ? error.message : 'Failed to add project team members. Please try again.');
              }
            }}
          >
            {addMutation.isPending ? 'Adding...' : 'Add to project'}
          </Button>
          {selectedUser ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Selected: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedUser.name}</span>
            </p>
          ) : null}
          {message ? (
            <p className={`text-sm ${messageTone === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {message}
            </p>
          ) : null}
        </div>
      </Card>

      {/* Member list */}
      <div className="space-y-3">
        {assignedMembers.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">No team members have been added to this project yet.</p>
          </Card>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.membershipId} className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                </div>

                {/* Inline edit mode */}
                {editingMembershipId === member.membershipId ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Role</label>
                      <select
                        className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        value={editRoleId}
                        disabled={updateStatusMutation.isPending}
                        onChange={(e) => setEditRoleId(e.target.value)}
                      >
                        <option value="">— Clear role —</option>
                        {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Allocation %</label>
                      <AllocationInput value={editAllocation} onChange={setEditAllocation} disabled={updateStatusMutation.isPending} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        disabled={updateStatusMutation.isPending}
                        onClick={async () => {
                          setMessage(null);
                          const otherTotal = totalAllocationForUser(member.id, member.membershipId);
                          if (otherTotal + editAllocation > 100) {
                            setEditError(`Total allocation would be ${otherTotal + editAllocation}% — max 100%.`);
                            return;
                          }
                          setEditError(null);
                          try {
                            await updateStatusMutation.mutateAsync({
                              membershipId: member.membershipId,
                              roleId: editRoleId || null,
                              allocationPercentage: editAllocation
                            });
                            setAssignedMembers((prev) =>
                              prev.map((m) =>
                                m.membershipId === member.membershipId
                                  ? {
                                      ...m,
                                      membershipRoleId: editRoleId || null,
                                      membershipRole: roles.find((r) => r.id === editRoleId)?.name ?? null,
                                      allocationPercentage: editAllocation
                                    }
                                  : m
                              )
                            );
                            cancelEdit();
                            notify('success', 'Membership updated.');
                          } catch (error) {
                            setEditError(error instanceof Error ? error.message : 'Failed to update.');
                          }
                        }}
                      >
                        {updateStatusMutation.isPending ? 'Saving…' : 'Save'}
                      </Button>
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                      {editError ? (
                        <p className="text-xs text-red-600 dark:text-red-400">{editError}</p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Membership role chip */}
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {member.membershipRole ?? '—'}
                    </span>
                    {/* Allocation */}
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {member.allocationPercentage > 0 ? `${member.allocationPercentage}%` : '—'}
                    </span>
                    {/* Active status */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                        member.membershipIsActive === false
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      }`}
                    >
                      {member.membershipIsActive === false ? 'Inactive' : 'Active'}
                    </span>
                    {/* Edit button */}
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => startEdit(member)}
                    >
                      Edit
                    </button>
                    {/* Toggle active */}
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      disabled={updateStatusMutation.isPending}
                      onClick={async () => {
                        setMessage(null);
                        const next = member.membershipIsActive === false;
                        try {
                          await updateStatusMutation.mutateAsync({ membershipId: member.membershipId, isActive: next });
                          setAssignedMembers((prev) =>
                            prev.map((m) => m.membershipId === member.membershipId ? { ...m, membershipIsActive: next } : m)
                          );
                          notify('success', `Marked as ${next ? 'active' : 'inactive'}.`);
                        } catch (error) {
                          notify('error', error instanceof Error ? error.message : 'Failed to update status.');
                        }
                      }}
                    >
                      {member.membershipIsActive === false ? 'Set active' : 'Set inactive'}
                    </button>
                    {/* Remove */}
                    <button
                      type="button"
                      className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700/60 dark:text-red-400 dark:hover:bg-red-900/20"
                      disabled={removeMutation.isPending || updateStatusMutation.isPending}
                      onClick={async () => {
                        setMessage(null);
                        try {
                          await removeMutation.mutateAsync({ membershipId: member.membershipId });
                          setAssignedMembers((prev) => prev.filter((m) => m.membershipId !== member.membershipId));
                          notify('success', 'Membership removed.');
                        } catch (error) {
                          notify('error', error instanceof Error ? error.message : 'Failed to remove membership.');
                        }
                      }}
                    >
                      {removeMutation.isPending ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
