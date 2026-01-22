'use client';



import { useEffect, useRef, useState } from 'react';

import { ResponsiveContainer } from 'recharts';

export function SafeResponsiveContainer({

  minHeight = 320,

  children,

}: {

  minHeight?: number;

  children: React.ReactNode;

}) {

  const ref = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);

  const [size, setSize] = useState({ w: 0, h: 0 });

  // Don't render on the server or first hydration frame

  useEffect(() => setMounted(true), []);

  // Measure container size and update continuously

  useEffect(() => {

    const el = ref.current;

    if (!el) return;

    const obs = new ResizeObserver(([entry]) => {

      const { width, height } = entry.contentRect;

      setSize({ w: width, h: height });

    });

    obs.observe(el);

    return () => obs.disconnect();

  }, []);

  // Until both true, show placeholder (no ResponsiveContainer yet)

  if (!mounted || size.w === 0 || size.h === 0) {

    return (

      <div

        ref={ref}

        style={{ width: '100%', minHeight }}

        className="flex items-center justify-center text-sm text-white/40 animate-pulse"

      >

        Initializing chart…

      </div>

    );

  }

  // Render ResponsiveContainer only after real size exists

  return (

    <div ref={ref} style={{ width: '100%', minHeight }}>

      <ResponsiveContainer

        width={size.w}

        height={size.h}

        minWidth={0}

        minHeight={minHeight}

      >

        {children}

      </ResponsiveContainer>

    </div>

  );

}

