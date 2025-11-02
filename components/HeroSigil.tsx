'use client';
import { motion } from 'framer-motion';
import SacredGeometry from '@/components/SacredGeometry';

export default function HeroSigil({
  color = '#f59e0b',
  glow = 'rgba(251,191,36,0.28)',
  variant = 'fire',
  size = 176,
}: {
  color?: string;
  glow?: string;
  variant?: 'fire' | 'earth' | 'air' | 'water' | 'aether';
  size?: number | string;
}) {
  const dimensionStyle = typeof size === 'number'
    ? { width: `${size}px`, height: `${size}px` }
    : { width: size, height: size };

  return (
    <div
      className="relative flex items-center justify-center overflow-visible"
      style={dimensionStyle}
    >
      <SacredGeometry color={color} glow={glow} variant={variant} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 14 }}
        className="relative z-20 h-20 w-20 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 40%, #fff, ${color})`,
          boxShadow: `inset 0 0 14px ${color}, 0 0 22px ${glow}`,
        }}
      />
      <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 translate-y-[54px] flex-col items-center gap-1">
        <div
          className="h-2 w-16 rounded-full opacity-90"
          style={{
            background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.85), ${color})`,
            boxShadow: `0 6px 12px -4px ${glow}`,
          }}
        />
        <div
          className="h-8 w-20 rounded-b-[18px] rounded-t-[10px] opacity-90"
          style={{
            background: `linear-gradient(180deg, ${color}dd, ${color})`,
            boxShadow: `0 10px 20px -6px ${glow}`,
          }}
        />
      </div>
    </div>
  );
}
