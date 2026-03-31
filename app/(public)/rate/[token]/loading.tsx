export default function LoadingRatePage() {
  return (
    <main className="mx-auto mt-10 max-w-3xl p-4">
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User Rating Portal</p>
        <h1 className="text-xl font-semibold text-slate-900">Checking your access link</h1>
        <p className="text-sm text-slate-500">Loading live token details from GraphQL...</p>
      </div>
    </main>
  );
}
