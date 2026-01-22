'use client';

import { useState, useEffect, useRef } from 'react';

export function ChartGuard({
  children,
  minHeight = 320,
}: {
  children: React.ReactNode;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setReady(width > 0 && height > 0);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Debug check
  useEffect(() => {
    console.log(
      'ChartGuard mounted → ready:',
      ready,
      ref.current?.getBoundingClientRect()
    );
  }, [ready]);

  return (
    <div
      ref={ref}
      className="flex-1"
      style={{ width: '100%', minHeight }}
    >
      {/* Render children ONLY when ready */}
      {ready ? (
        children
      ) : (
        <div className="flex h-[320px] items-center justify-center text-sm text-white/40 animate-pulse">
          Initializing chart…
        </div>
      )}
    </div>
  );
}

