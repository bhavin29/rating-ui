export default function DashboardLoading() {
  return (
    <div className="space-y-2 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Workspace</p>
      <h1 className="text-xl font-semibold text-slate-900">Loading projects, users, and sprint ratings</h1>
      <p className="text-sm text-slate-500">Pulling the latest dashboard data from GraphQL...</p>
    </div>
  );
}
