import type { DeckRecord } from '@/data/deck-editor';

export type GameType = 'magic' | 'hearthstone';

export const DEFAULT_GAME: GameType = 'magic';

export const GAME_OPTIONS: { value: GameType; label: string }[] = [
  { value: 'magic', label: 'Magic: The Gathering' },
  { value: 'hearthstone', label: 'Hearthstone' },
];

export const GAME_LABELS: Record<GameType, string> = {
  magic: 'Magic: The Gathering',
  hearthstone: 'Hearthstone',
};

export const GAME_STORAGE_KEY = 'scrylytics:selectedGame';

export function isGameType(value: unknown): value is GameType {
  return value === 'magic' || value === 'hearthstone';
}

export function getGameLabel(value: GameType) {
  return GAME_LABELS[value] ?? GAME_LABELS.magic;
}

export function formatToGameType(format?: DeckRecord['format']): GameType {
  if (!format) return 'magic';
  return format === 'Wild' || format === 'Standard (HS)' ? 'hearthstone' : 'magic';
}
