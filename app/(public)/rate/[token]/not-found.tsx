export default function InvalidLinkPage() {
  return (
    <main className="mx-auto mt-10 max-w-3xl p-4">
      <div className="space-y-2 rounded-lg border border-red-100 bg-red-50 p-6 text-red-700">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">User Rating Portal</p>
        <h1 className="text-xl font-semibold text-red-900">Invalid or expired rating link</h1>
        <p className="text-sm text-red-700">
          The live GraphQL API did not validate this token. Please request a new rating link from your admin.
        </p>
      </div>
    </main>
  );
}
