'use client';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { GameProvider } from '@/context/GameContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <GameProvider>{children}</GameProvider>
    </ThemeProvider>
  );
}
