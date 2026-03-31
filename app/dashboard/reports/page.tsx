import { Card } from '@/app/components/ui';
import { getAllSprints, getSprintRatings } from '@/app/lib/api/admin-api';

export default async function ReportsPage() {
  const sprints = await getAllSprints();
  const sprintReports = await Promise.all(
    sprints.map(async (sprint) => ({
      sprint,
      ratings: await getSprintRatings(sprint.id)
    }))
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Ratings Reports</h1>
      {sprintReports.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No sprints are available yet, so there are no user rating reports to show.</p>
        </Card>
      ) : null}
      <div className="space-y-4">
        {sprintReports.map(({ sprint, ratings }) => {
          const sprintAverage =
            ratings.length > 0
              ? ratings.reduce((total, rating) => total + rating.averageScore, 0) / ratings.length
              : null;

          return (
            <Card key={sprint.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{sprint.name}</h2>
                  <p className="text-sm text-slate-500">{sprint.project?.name ?? 'Unknown project'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Sprint average</p>
                  <p className="text-2xl font-semibold">
                    {sprintAverage === null ? 'No ratings yet' : sprintAverage.toFixed(2)}
                  </p>
                </div>
              </div>
              {ratings.length === 0 ? (
                <p className="text-sm text-slate-500">No submitted ratings for this sprint yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-600">User</th>
                        <th className="px-4 py-3 font-medium text-slate-600">Average score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratings
                        .slice()
                        .sort((a, b) => b.averageScore - a.averageScore)
                        .map((rating) => (
                          <tr key={rating.userId} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-slate-700">{rating.userName}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {rating.averageScore.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
