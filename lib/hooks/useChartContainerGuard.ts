'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * A rules engine to enforce valid container size for Recharts <ResponsiveContainer>.
 * It:
 *  1. Observes the container via ResizeObserver.
 *  2. Waits until both width and height are measurable (> 0).
 *  3. Re-renders the chart only after that condition passes.
 *  4. Optionally enforces minWidth/minHeight fallback to silence warnings.
 */
export function useChartContainerGuard(minWidth = 280, minHeight = 240) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Initial check
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setReady(true);
      setSize({ width: rect.width, height: rect.height });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // Rule 1: only mark ready when width/height are valid
      if (width > 0 && height > 0) {
        setReady(true);
        setSize({ width, height });
      } else {
        setReady(false);
      }
    });

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, []);

  // Rule 2: Apply fallback if still unresolved
  const enforcedStyle: React.CSSProperties = {
    width: '100%',
    height: size.height > 0 ? `${size.height}px` : `${minHeight}px`,
    minWidth: `${minWidth}px`,
    minHeight: `${minHeight}px`,
  };

  return { ref, ready, enforcedStyle };
}

