'use client';

import { useMemo, useState } from 'react';
import { useAssignProjectMembers, useRemoveProjectMember } from '@/app/hooks/use-admin-mutations';
import { Button, Card, Input } from '@/app/components/ui';
import type { Member } from '@/app/lib/api/types';

export function ProjectTeamManager({
  projectId,
  projectName,
  allUsers,
  initialMembers
}: {
  projectId: string;
  projectName: string;
  allUsers: Member[];
  initialMembers: Member[];
}) {
  const addMutation = useAssignProjectMembers();
  const removeMutation = useRemoveProjectMember();
  const [assignedMembers, setAssignedMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const assignedLookup = useMemo(() => new Set(assignedMembers.map((member) => member.id)), [assignedMembers]);

  const availableUsers = useMemo(
    () => allUsers.filter((user) => !assignedLookup.has(user.id)),
    [allUsers, assignedLookup]
  );

  const matchingUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return availableUsers.slice(0, 8);
    }

    return availableUsers
      .filter((user) =>
        [user.name, user.email, user.role]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      )
      .slice(0, 8);
  }, [availableUsers, searchTerm]);

  const selectedUser = availableUsers.find((user) => user.id === selectedUserId) ?? null;

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
        </div>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Add team members</h2>
          <p className="text-sm text-slate-500">Search by first name, last name, email, or role and add the selected user.</p>
        </div>

        {availableUsers.length === 0 ? (
          <p className="text-sm text-slate-500">All available users are already part of this project.</p>
        ) : (
          <>
            <div className="space-y-3">
              <Input
                placeholder="Search by name, email, or role"
                value={searchTerm}
                onFocus={() => setIsPickerOpen(true)}
                onChange={(event) => {
                  setMessage(null);
                  setIsPickerOpen(true);
                  setSearchTerm(event.target.value);
                  setSelectedUserId('');
                }}
              />

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
                            setSelectedUserId(user.id);
                            setSearchTerm(`${user.name} | ${user.email} | ${user.role}`);
                            setIsPickerOpen(false);
                          }}
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                            {user.role}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={addMutation.isPending || !selectedUser}
                onClick={async () => {
                  setMessage(null);

                  if (!selectedUser) {
                    setMessage('Select a user from the search results first.');
                    return;
                  }

                  try {
                    await addMutation.mutateAsync({ projectId, memberIds: [selectedUser.id] });
                    setAssignedMembers((current) => [...current, selectedUser]);
                    setSelectedUserId('');
                    setSearchTerm('');
                    setIsPickerOpen(false);
                    setMessage('Project team updated successfully.');
                  } catch {
                    setMessage('Failed to add project team members. Please try again.');
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
                <p className={`text-sm ${addMutation.isError || removeMutation.isError ? 'text-red-600' : 'text-emerald-700'}`}>
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
          assignedMembers.map((member) => (
            <Card key={member.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{member.name}</h2>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                    {member.role}
                  </span>
                  <button
                    type="button"
                    className="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={removeMutation.isPending}
                    onClick={async () => {
                      setMessage(null);

                      try {
                        await removeMutation.mutateAsync({ projectId, userId: member.id });
                        setAssignedMembers((current) => current.filter((entry) => entry.id !== member.id));
                        setSelectedUserId('');
                        setSearchTerm('');
                        setIsPickerOpen(false);
                        setMessage('User removed from the project.');
                      } catch {
                        setMessage('Failed to remove the user from this project. Please try again.');
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
