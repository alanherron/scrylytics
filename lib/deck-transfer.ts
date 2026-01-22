import type { DeckRecord } from '@/data/deck-editor';

export type DeckPrefillPayload = {
  deckCode: string;
  format?: DeckRecord['format'];
};

const STORAGE_KEY = 'scrylytics:decklytics-prefill';

export function saveDeckPrefill(payload: DeckPrefillPayload) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to store deck prefill payload:', error);
  }
}

export function consumeDeckPrefill(): DeckPrefillPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.deckCode === 'string') {
      window.localStorage.removeItem(STORAGE_KEY);
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to read deck prefill payload:', error);
  }

  window.localStorage.removeItem(STORAGE_KEY);
  return null;
}
