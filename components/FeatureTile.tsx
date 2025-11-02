'use client';
import { motion } from 'framer-motion';
import type { ComponentType } from 'react';

export default function FeatureTile({
  icon:Icon, title, body, hue,
}: { icon: ComponentType<{className?:string, color?:string}>, title:string, body:string, hue:string }) {
  return (
    <motion.div whileHover={{ y:-4 }} className="group rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-5" color={hue} />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-white/70">{body}</p>
      <div className="mt-4 h-1 w-0 group-hover:w-16 transition-all" style={{ background:hue }} />
    </motion.div>
  );
}
