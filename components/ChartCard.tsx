import { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  children: ReactNode;
  height?: number;
};

export default function ChartCard({ title, children, height = 176 }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 text-sm text-white/80">{title}</div>
      <div
        className="w-full min-w-0"
        style={{ height, width: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}
