'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type CSSProperties } from 'react';
import { ELEMENTS, type ElementKey } from '@/lib/theme';
import GameSwitcher from './GameSwitcher';
import ThemeToggle from './ThemeToggle';

type NavItem = {
  href: string;
  label: string;
  element: ElementKey;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/decklytics', label: 'Decklytics', element: 'earth' },
  { href: '/playlytics', label: 'Playlytics', element: 'air' },
  { href: '/the-forge', label: 'The Forge', element: 'fire' },
  { href: '/metalytics', label: 'Metalytics', element: 'water' },
  { href: '/the-oracle', label: 'The Oracle', element: 'aether' },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();

  const activeNav = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  const accentElement: ElementKey = activeNav?.element ?? 'aether';
  const accentColor = ELEMENTS[accentElement].hue;

  return (
    <header className="relative sticky top-0 z-40 border-b border-white/10 bg-[var(--bg)]/80 backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: accentColor }} />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-gradient-to-b from-white/80 to-aether-400 shadow-glow" />
          <span className="font-display text-lg">Scrylytics</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[color:var(--ink)]/80">
          {NAV_ITEMS.map((item) => {
            const active = activeNav?.href === item.href;
            const element = ELEMENTS[item.element];
            const baseClasses = 'rounded-lg border border-transparent px-3 py-1.5 transition-colors duration-200 hover:bg-white/10';

            const activeStyles: CSSProperties | undefined = active
              ? {
                  background: element.glow,
                  borderColor: element.hue,
                  color: '#ffffff',
                  boxShadow: `0 8px 18px -12px ${element.hue}`,
                }
              : undefined;

            return (
              <Link key={item.href} href={item.href} className={baseClasses} style={activeStyles}>
                {item.label}
              </Link>
            );
          })}
          <GameSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
