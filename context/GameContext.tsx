'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_GAME,
  GAME_STORAGE_KEY,
  type GameType,
  isGameType,
} from '@/lib/game';

type GameContextValue = {
  game: GameType;
  setGame: (next: GameType) => void;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGameState] = useState<GameType>(() => {
    if (typeof window === 'undefined') return DEFAULT_GAME;
    const stored = window.localStorage.getItem(GAME_STORAGE_KEY);
    return isGameType(stored) ? stored : DEFAULT_GAME;
  });

  const setGame = useCallback((next: GameType) => {
    setGameState(next);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(GAME_STORAGE_KEY, game);
  }, [game]);

  const value = useMemo(
    () => ({
      game,
      setGame,
    }),
    [game, setGame],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
