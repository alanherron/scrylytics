'use client';

import { ELEMENTS, type ElementKey } from '@/lib/theme';

type SectionIconProps = {
  element: ElementKey;
  size?: number;
  className?: string;
};

const ICON_PATHS: Record<ElementKey, string> = {
  fire: '/cardlytics.svg',
  earth: '/decklytics.svg',
  air: '/playlytics.svg',
  water: '/metalytics.svg',
  aether: '/crystal_ball.svg',
};

export default function SectionIcon({ element, size = 48, className = '' }: SectionIconProps) {
  const iconPath = ICON_PATHS[element];
  const elementData = ELEMENTS[element];
  const gradientId = `gradient-${element}-${size}`;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 713.11 713.11"
        className="drop-shadow-lg"
        style={{
          filter: `drop-shadow(0 0 8px ${elementData.glow})`,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={elementData.hue} stopOpacity="1" />
            <stop offset="100%" stopColor={elementData.hue} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <image
          href={iconPath}
          width="713.11"
          height="713.11"
          x="0"
          y="0"
          style={{
            filter: `brightness(0) saturate(100%) invert(1)`,
            mask: `url(${iconPath})`,
            WebkitMask: `url(${iconPath})`,
          }}
        />
        <rect
          width="713.11"
          height="713.11"
          fill={`url(#${gradientId})`}
          mask={`url(${iconPath})`}
          style={{
            mixBlendMode: 'multiply',
          }}
        />
      </svg>
    </div>
  );
}








