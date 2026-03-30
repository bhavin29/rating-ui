import { Card } from '@/app/components/ui';

export function DashboardCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </Card>
  );
}
