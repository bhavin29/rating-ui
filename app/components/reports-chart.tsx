'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '@/app/components/ui';

export function ReportsChart({
  memberAverages,
  trend
}: {
  memberAverages: Array<{ memberName: string; average: number }>;
  trend: Array<{ sprint: string; average: number }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="h-80">
        <h3 className="mb-2 text-sm font-semibold">Member performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={memberAverages}>
            <XAxis dataKey="memberName" />
            <YAxis domain={[0, 7]} />
            <Tooltip />
            <Bar dataKey="average" fill="#0f172a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="h-80">
        <h3 className="mb-2 text-sm font-semibold">Sprint trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <XAxis dataKey="sprint" />
            <YAxis domain={[0, 7]} />
            <Tooltip />
            <Line type="monotone" dataKey="average" stroke="#0f172a" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
