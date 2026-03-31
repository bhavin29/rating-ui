import { Card } from '@/app/components/ui';
import { getSprintMembers, getSprintRatings } from '@/app/lib/api/admin-api';

export default async function SprintMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [members, ratings] = await Promise.all([getSprintMembers(id), getSprintRatings(id)]);
  const ratingMap = new Map(ratings.map((rating) => [rating.userId, rating.averageScore]));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sprint Members</h1>
          <p className="text-sm text-slate-500">Live user assignments and rating summaries for this sprint</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Assigned users: {members.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Users with ratings: {ratings.length}</span>
        </div>
      </div>
      {members.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No users are assigned to this sprint yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => {
            const averageScore = ratingMap.get(member.id);

            return (
              <Card key={member.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">{member.name}</h2>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                    {member.role}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Average rating</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {averageScore === undefined ? 'No ratings yet' : averageScore.toFixed(2)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
