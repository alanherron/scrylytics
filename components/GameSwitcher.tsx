'use client';

import { type ChangeEvent } from 'react';
import { ListChecks } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { GAME_OPTIONS, type GameType } from '@/lib/game';

export default function GameSwitcher() {
  const { game, setGame } = useGame();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGame(event.target.value as GameType);
  };

  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.08)] hover:border-white/20 focus-within:border-emerald-300/40 focus-within:ring-2 focus-within:ring-emerald-400/20">
      <span className="flex items-center gap-1 uppercase tracking-[0.25em] text-[10px] text-white/50">
        <ListChecks className="size-3 text-emerald-300" />
        Game
      </span>
      <select
        value={game}
        onChange={handleChange}
        className="rounded-lg border border-transparent bg-transparent text-sm text-white/80 outline-none transition focus:border-emerald-400/60 focus:bg-white/10"
      >
        {GAME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#080d18] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
