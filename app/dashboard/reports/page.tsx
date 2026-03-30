import { Suspense } from 'react';
import { Card } from '@/app/components/ui';
import { getReports } from '@/app/lib/api/admin-api';
import { ReportsChart } from '@/app/components/reports-chart';

export default async function ReportsPage() {
  const data = (await getReports()) as any;
  const report = data.getReports;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Ratings Reports</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {report.roleAverages.map((item: any) => (
          <Card key={item.role}>
            <p className="text-sm text-slate-500">{item.role}</p>
            <p className="text-xl font-semibold">{Number(item.average).toFixed(2)}</p>
          </Card>
        ))}
      </div>
      <Suspense fallback={<div>Loading charts...</div>}>
        <ReportsChart memberAverages={report.memberAverages} trend={report.trend} />
      </Suspense>
    </section>
  );
}
