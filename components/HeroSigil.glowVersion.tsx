'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SacredGeometry from '@/components/SacredGeometry';

type HeroSigilProps = {
  color?: string;
  glow?: string;
  variant?: 'fire' | 'earth' | 'air' | 'water' | 'aether';
  size?: number | string;
  className?: string;
  scaleMultiplier?: number;
  haloScale?: number;
};

export default function HeroSigil({
  color = '#f59e0b',
  glow = 'rgba(251,191,36,0.28)',
  variant = 'fire',
  size = 176,
  className,
  scaleMultiplier,
  haloScale = 1,
}: HeroSigilProps) {
  const numericSize = typeof size === 'number' ? size : Number.parseFloat(size) || 176;
  const dimensionStyle = { width: `${numericSize}px`, height: `${numericSize}px` };
  const BASE_CANVAS = 176;
  const baseOrbDiameter = numericSize * 0.455;
  const orbScale = baseOrbDiameter / BASE_CANVAS;
  const geometryScale = (variant === 'aether' ? 1 : 1.12) * (scaleMultiplier ?? 1);
  const baseWidth = numericSize * 0.4;
  const baseHeight = numericSize * 0.2;
  const baseTop =
    numericSize / 2 + baseOrbDiameter / 2 - baseHeight * 0.35;
  const [prefersLightMode, setPrefersLightMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => setPrefersLightMode(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const isLightMode = prefersLightMode;

  return (
    <div className={`relative flex items-center justify-center overflow-visible ${className ?? ''}`} style={dimensionStyle}>
      <div
        className="pointer-events-none absolute -z-10 rounded-full"
        style={{
          width: `${numericSize * haloScale}px`,
          height: `${numericSize * haloScale}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 50% 50%, ${color}55 0%, transparent 48%)`,
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: `${baseOrbDiameter * 0.92}px`,
          height: `${baseOrbDiameter * 0.28}px`,
          left: '50%',
          bottom: `${-baseOrbDiameter * 0.18}px`,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle at 50% 50%, rgba(12,14,24,0.45) 0%, rgba(7,7,12,0) 70%)',
          filter: 'blur(1.5px)',
        }}
      />

      <div
        className="pointer-events-none"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${BASE_CANVAS}px`,
          height: `${BASE_CANVAS}px`,
          transform: `translate(-50%, -50%) scale(${orbScale})`,
          transformOrigin: 'center center',
        }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0.92 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-full"
          style={{
            background:
              'radial-gradient(circle at 52% 40%, rgba(255,255,255,0.1) 12%, rgba(255,255,255,0.02) 38%, rgba(7,12,18,0.34) 88%)',
            backdropFilter: 'blur(9px)',
            WebkitBackdropFilter: 'blur(9px)',
            border: 'none',
            boxShadow: isLightMode
              ? `0 14px 26px -24px ${glow}, inset 0 0 14px rgba(0,0,0,0.2), inset 0 0 14px rgba(255,255,255,0.18)`
              : `0 18px 34px -26px ${glow}, inset 0 0 22px rgba(0,0,0,0.34), inset 0 0 14px rgba(255,255,255,0.08)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle at 50% 50%, ${color}28 0%, ${color}10 55%, transparent 78%)` }}
          />
          <div
            className="absolute inset-[12%] rounded-full mix-blend-multiply"
            style={{
              background: isLightMode
                ? 'radial-gradient(circle at 55% 55%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.1) 60%, transparent 88%)'
                : 'radial-gradient(circle at 50% 75%, rgba(0,0,0,0.36) 0%, rgba(0,0,0,0.2) 58%, transparent 85%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-[2%] rounded-full"
            style={{
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: 'inset 0 0 9px rgba(255,255,255,0.11)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-[20%] rounded-full mix-blend-screen"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${color}85 0%, ${color}30 60%, transparent 82%)`,
              opacity: isLightMode ? 0.62 : 0.76,
            }}
          />
          <div
            className="pointer-events-none absolute inset-[24%] rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${color}e8 0%, ${color}7a 48%, transparent 78%)`,
              mixBlendMode: isLightMode ? 'multiply' : 'screen',
              filter: 'blur(4px)',
              opacity: isLightMode ? 0.54 : 0.82,
            }}
          />
          <div
            className="pointer-events-none absolute inset-[26%] rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${color}42 0%, transparent 68%)`,
              mixBlendMode: 'screen',
              filter: 'blur(10px)',
              opacity: 0.42,
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-[20%] inset-y-[34%] rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${color}80 0deg, transparent 90deg, ${color}6b 180deg, transparent 270deg)`,
              mixBlendMode: 'screen',
              opacity: 0.38,
              filter: 'blur(4px)',
            }}
          />
          <div
            className="pointer-events-none absolute left-[14px] top-[16px] h-[44px] w-[66px] mix-blend-screen"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 62%, rgba(255,255,255,0) 95%)',
              clipPath: 'path("M6 20C18 0 54 -3 78 16C88 24 82 40 58 44C36 48 14 40 6 30Z")',
              opacity: 0.66,
            }}
          />
          <div
            className="pointer-events-none absolute left-[20px] top-[28px] h-[28px] w-[56px] mix-blend-screen"
            style={{
              background:
                'radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.32) 55%, rgba(255,255,255,0) 90%)',
              opacity: 0.5,
            }}
          />
          <div
            className="pointer-events-none absolute left-[16px] top-[10px] h-[48px] w-[48px] mix-blend-screen"
            style={{
              background:
                'conic-gradient(from 200deg at 0% 0%, rgba(255,255,255,0.86) 0deg, rgba(255,255,255,0.6) 25deg, rgba(255,255,255,0) 70deg)',
              maskImage: 'radial-gradient(circle at 0% 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 70%)',
              WebkitMaskImage: 'radial-gradient(circle at 0% 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 70%)',
              opacity: 0.42,
            }}
          />
          <div
            className="pointer-events-none absolute left-[20px] top-[34px] h-[12px] w-[62px] rotate-[-6deg] mix-blend-screen"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.36) 60%, rgba(255,255,255,0) 100%)',
              borderRadius: '46% / 90%',
              opacity: 0.34,
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-[14%] bottom-[-12px] h-[30px] rounded-[50%]"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(16,12,20,0.65) 0%, rgba(10,8,14,0.38) 55%, rgba(4,3,6,0) 100%)',
              opacity: 0.88,
            }}
          />
          <div
            className="pointer-events-none absolute right-[8px] bottom-[8px] h-[58px] w-[58px] rounded-full mix-blend-multiply"
            style={{
              background:
                'radial-gradient(circle at 34% 34%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0) 80%)',
              opacity: isLightMode ? 0.7 : 0.82,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-[12px] right-[12px] h-[46px] w-[44px] mix-blend-multiply"
            style={{
              background:
                'radial-gradient(circle at 65% 70%, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.08) 95%)',
              clipPath: 'path("M12 42C26 28 34 20 44 12C48 8 50 4 44 -1C36 -5 20 0 10 9C0 18 4 34 12 42Z")',
              opacity: isLightMode ? 0.56 : 0.68,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-[6px] right-[6px] h-[44px] w-[44px] mix-blend-multiply"
            style={{
              background:
                'conic-gradient(from 350deg at 100% 100%, rgba(0,0,0,0.86) 0deg, rgba(0,0,0,0.6) 40deg, rgba(0,0,0,0) 120deg)',
              maskImage: 'radial-gradient(circle at 95% 95%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 74%)',
              WebkitMaskImage: 'radial-gradient(circle at 95% 95%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 74%)',
              opacity: 0.48,
            }}
          />
          <div
            className="pointer-events-none absolute inset-[1.5%] rounded-full mix-blend-screen"
            style={{
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)',
              opacity: isLightMode ? 0.38 : 0.5,
            }}
          />
          <div
            className="pointer-events-none absolute inset-[14%] rounded-full mix-blend-screen opacity-45"
            style={{
              background:
                'conic-gradient(from 220deg at 50% 50%, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            }}
          />
          <SacredGeometry
            color={color}
            glow={glow}
            variant={variant}
          />
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center"
        style={{ top: `${baseTop}px` }}
      >
        <img
          src="/crystal-base.png"
          alt="Crystal ball base"
          className="select-none"
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: 'translateY(0)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
