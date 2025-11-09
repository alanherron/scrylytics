'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type CSSProperties } from 'react';
import { ELEMENTS, type ElementKey } from '@/lib/theme';
// import GameSwitcher from './GameSwitcher';
// import ThemeToggle from './ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  element: ElementKey;
  iconPath: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/cardlytics', label: 'Cardlytics', element: 'earth', iconPath: '/cardlytics.svg' },
  { href: '/decklytics', label: 'Decklytics', element: 'water', iconPath: '/decklytics.svg' },
  { href: '/playlytics', label: 'Playlytics', element: 'fire', iconPath: '/playlytics.svg' },
  { href: '/metalytics', label: 'Metalytics', element: 'air', iconPath: '/metalytics.svg' },
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
    <header className="sticky top-0 z-40 border-b backdrop-blur w-full" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(15,17,20,0.8)' }}>
      <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: accentColor }} />
      <div className="flex items-center justify-between px-6 py-3 w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-gradient-to-b from-white/80 to-purple-400 shadow-glow" />
          <span className="font-display text-lg text-white">Scrylytics</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {NAV_ITEMS.map((item) => {
            const active = activeNav?.href === item.href;
            const element = ELEMENTS[item.element];
            const iconColor = active ? '#ffffff' : element.accent ?? element.hue;
            const baseClasses = 'flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 transition-colors duration-200 hover:bg-white/10';

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
                <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
                  <img
                    src={item.iconPath}
                    alt={item.label}
                    width={20}
                    height={20}
                    className="object-contain"
                    style={{
                      filter: active 
                        ? 'brightness(0) invert(1)' 
                        : `brightness(0) saturate(100%)`,
                      opacity: active ? 1 : 0.8,
                    }}
                  />
                  {!active && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundColor: iconColor,
                        mixBlendMode: 'screen',
                        opacity: 1,
                      }}
                    />
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
          {/* <GameSwitcher /> */}
          {/* <ThemeToggle /> */}
        </nav>
      </div>
    </header>
  );
}
