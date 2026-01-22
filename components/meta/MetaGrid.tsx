'use client';

import { type ReactNode } from 'react';

type MetaGridProps = {
  children: ReactNode;
};

export default function MetaGrid({ children }: MetaGridProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(93,214,211,0.12),_rgba(13,13,17,0.4))] p-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </div>
  );
}















