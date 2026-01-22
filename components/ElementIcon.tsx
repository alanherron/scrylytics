'use client';

import Image from 'next/image';
import { ELEMENTS, type ElementKey } from '@/lib/theme';

type ElementIconProps = {
  element: ElementKey;
  size?: number;
  className?: string;
};

const ICON_MAP: Record<ElementKey, string> = {
  fire: '/cardlytics.svg',
  earth: '/decklytics.svg',
  air: '/playlytics.svg',
  water: '/metalytics.svg',
  aether: '/crystal_ball.svg',
};

export default function ElementIcon({ element, size = 48, className = '' }: ElementIconProps) {
  const iconPath = ICON_MAP[element];
  const elementData = ELEMENTS[element];
  
  // Create gradient ID unique to this element
  const gradientId = `gradient-${element}`;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 713.11 713.11" className="drop-shadow-lg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: elementData.hue, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: elementData.hue, stopOpacity: 0.7 }} />
          </linearGradient>
        </defs>
        <image
          href={iconPath}
          width="713.11"
          height="713.11"
          x="0"
          y="0"
          style={{
            filter: `drop-shadow(0 0 8px ${elementData.glow})`,
          }}
        />
        <style jsx>{`
          image {
            filter: drop-shadow(0 0 8px ${elementData.glow});
          }
        `}</style>
      </svg>
    </div>
  );
}








