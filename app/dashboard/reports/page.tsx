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
  const allRatings = sprintReports.flatMap(({ sprint, ratings }) =>
    ratings.map((rating) => ({
      ...rating,
      sprintName: sprint.name,
      projectName: sprint.project?.name ?? 'Unknown project'
    }))
  );
  const topPerformer = allRatings.reduce<(typeof allRatings)[number] | null>(
    (best, current) => (best === null || current.averageScore > best.averageScore ? current : best),
    null
  );
  const lowestPerformer = allRatings.reduce<(typeof allRatings)[number] | null>(
    (lowest, current) => (lowest === null || current.averageScore < lowest.averageScore ? current : lowest),
    null
  );
  const leaderboard = allRatings
    .slice()
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Ratings Reports</h1>
      {sprintReports.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No sprints are available yet, so there are no user rating reports to show.</p>
        </Card>
      ) : null}
      {allRatings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Top performer</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{topPerformer?.userName}</p>
            <p className="text-sm text-slate-500">
              {topPerformer?.projectName} · {topPerformer?.sprintName}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{topPerformer?.averageScore.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Needs attention</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{lowestPerformer?.userName}</p>
            <p className="text-sm text-slate-500">
              {lowestPerformer?.projectName} · {lowestPerformer?.sprintName}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{lowestPerformer?.averageScore.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-500">Rated users</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{allRatings.length}</p>
            <p className="mt-2 text-sm text-slate-500">Count of user rating summaries returned by the live API</p>
          </Card>
        </div>
      ) : null}
      {leaderboard.length > 0 ? (
        <Card className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Cross-Sprint Leaderboard</h2>
            <p className="text-sm text-slate-500">Highest average user scores across all available sprint summaries</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">User</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Project</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Sprint</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Average score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((rating) => (
                  <tr key={`${rating.sprintName}-${rating.userId}`} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-900">{rating.userName}</td>
                    <td className="px-4 py-3 text-slate-600">{rating.projectName}</td>
                    <td className="px-4 py-3 text-slate-600">{rating.sprintName}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{rating.averageScore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
