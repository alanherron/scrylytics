'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type CSSProperties,
} from 'react';
import { Listbox } from '@headlessui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  FunnelIcon,
  HeartIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseDeckCode } from '@/lib/hearthstone';
import { encode as encodeDeck } from 'deckstrings';
import { useGame } from '@/context/GameContext';
import { searchCardsPaginated } from '@/lib/magic';

type HSCard = {
  id: string;
  dbfId?: number;
  name: string;
  type?: string;
  cardClass?: string;
  rarity?: string;
  cost?: number;
  attack?: number;
  health?: number;
  text?: string;
  mechanics?: Array<{ name: string } | string>;
  set?: string;
  spellSchool?: string;
  race?: string;
  tribal?: string;
  minionType?: string;
  multiClassGroup?: string;
  spellSchoolId?: number;
  multiClassIds?: number[];
  collectible?: boolean;
};

type MagicCard = {
  id: string;
  name: string;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  colors?: string[];
  color_identity?: string[];
  rarity?: string;
  set?: string;
  set_name?: string;
  power?: string;
  toughness?: string;
  keywords?: string[];
  oracle_text?: string;
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
  };
  legalities?: Record<string, string>;
};

type Card = HSCard | MagicCard;

type DeckEntry = {
  id: string;
  dbfId?: number;
  name: string;
  cost: number;
  rarity?: string;
  cardClass?: string;
  type?: string;
  set?: string | null;
  mechanics?: string[];
  tribe?: string | null;
  spellSchool?: string | null;
  copies: number;
  legendary: boolean;
};

type SavedDeck = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  heroDbfId: number | null;
  deckCode: string | null;
  cards: DeckEntry[];
};

type MetaDeckSummary = {
  id: string;
  name: string;
  className?: string | null;
  winRate?: number | null;
  popularity?: number | null;
  deckCode?: string | null;
  heroDbfId: number | null;
};

type CardInfo = {
  id: string;
  name: string;
  cost: number;
  cardClass: string;
  type: string;
  rarity: string;
  text: string;
  htmlText: string;
  set: string;
  image: string;
};

type HoverCardState = {
  id: string;
  source: 'library' | 'deck';
  rect: Pick<DOMRect, 'top' | 'left' | 'bottom' | 'right' | 'width' | 'height'>;
};

const HS_CARDS_COLLECTIBLE_URL =
  'https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json';
const HS_CARDS_ALL_URL =
  'https://api.hearthstonejson.com/v1/latest/enUS/cards.json';

// Hearthstone filter options
const CLASSES = [
  'ALL',
  'DEMONHUNTER',
  'DRUID',
  'HUNTER',
  'MAGE',
  'PALADIN',
  'PRIEST',
  'ROGUE',
  'SHAMAN',
  'WARLOCK',
  'WARRIOR',
  'DEATHKNIGHT',
  'NEUTRAL',
] as const;
const CLASS_FILTER_OPTIONS = CLASSES;
const DECK_CLASSES = CLASSES.filter((klass) => klass !== 'ALL');
const HS_TYPES = ['ALL', 'MINION', 'SPELL', 'WEAPON', 'HERO', 'LOCATION'] as const;
const HS_RARITIES = ['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const;
const HS_FORMATS = ['ALL', 'STANDARD', 'WILD', 'TWIST'] as const;
const MANA = ['ALL', '0', '1', '2', '3', '4', '5', '6', '7+'] as const;
const ATTACK_VALUES = ['ALL', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'] as const;
const HEALTH_VALUES = ['ALL', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'] as const;

// Magic: The Gathering filter options
const MAGIC_COLORS = ['ALL', 'WHITE', 'BLUE', 'BLACK', 'RED', 'GREEN', 'COLORLESS', 'MULTICOLOR'] as const;
const MAGIC_TYPES = ['ALL', 'CREATURE', 'INSTANT', 'SORCERY', 'ENCHANTMENT', 'ARTIFACT', 'PLANESWALKER', 'LAND'] as const;
const MAGIC_RARITIES = ['ALL', 'COMMON', 'UNCOMMON', 'RARE', 'MYTHIC'] as const;
const MAGIC_FORMATS = ['ALL', 'STANDARD', 'MODERN', 'COMMANDER', 'LEGACY', 'VINTAGE', 'PAUPER'] as const;
const CMC = ['ALL', '0', '1', '2', '3', '4', '5', '6', '7+'] as const;
const FILTER_ALL = 'ALL';
const MAX_DECK_CARDS = 30;
const CARD_BASE_WIDTH = 200;
const CARD_ROW_HEIGHT_BASE = 320;

// Standard format sets - updated to include current Standard rotation
// Standard includes: Core set + sets from the last 2 years
const STANDARD_SET_IDS = new Set([
  'CORE',
  'PLACEHOLDER_202204',
  'PATH_OF_ARTHAS',
  'WHIZBANGS_WORKSHOP',
  'SPACE', // Dr. Boom's Incredible Inventions mini-set
  'ISLAND_VACATION',
  'THE_LOST_CITY', // Perils in Paradise mini-set
  'EMERALD_DREAM',
  'TIME_TRAVEL',
  // Add any newer sets that might be missing
]);

const CLASS_LABELS: Record<string, string> = {
  DEMONHUNTER: 'Demon Hunter',
  DRUID: 'Druid',
  HUNTER: 'Hunter',
  MAGE: 'Mage',
  PALADIN: 'Paladin',
  PRIEST: 'Priest',
  ROGUE: 'Rogue',
  SHAMAN: 'Shaman',
  WARLOCK: 'Warlock',
  WARRIOR: 'Warrior',
  DEATHKNIGHT: 'Death Knight',
  NEUTRAL: 'Neutral',
};

const isLegendary = (card: HSCard | DeckEntry) =>
  (card.rarity ?? card?.rarity) === 'LEGENDARY';

const cardImg = (id: string, card?: Card): string | null => {
  if (card && 'image_uris' in card) {
    // Magic card
    const magicCard = card as MagicCard;
    return magicCard.image_uris?.normal || magicCard.image_uris?.small || null;
  }
  // Hearthstone card
  return `https://art.hearthstonejson.com/v1/render/latest/enUS/512x/${id}.png`;
};

function normaliseMechanics(card: HSCard): string[] {
  if (!card.mechanics) return [];
  return card.mechanics
    .map((entry) =>
      typeof entry === 'string'
        ? entry
        : typeof entry?.name === 'string'
          ? entry.name
          : null,
    )
    .filter((value): value is string => Boolean(value));
}

function extractTribe(card: HSCard): string | null {
  return card.race ?? card.tribal ?? card.minionType ?? null;
}

function matchesFormat(card: Card, format: string, game: 'hearthstone' | 'magic'): boolean {
  if (format === 'ALL') return true;
  
  if (game === 'hearthstone') {
    const hsCard = card as HSCard;
    // If card has no set, exclude from format filtering (likely non-collectible or special card)
    if (!hsCard.set) {
      return format === 'WILD';
    }
    
    switch (format) {
      case 'STANDARD':
        return STANDARD_SET_IDS.has(hsCard.set);
      case 'TWIST':
        // Twist formats rotate frequently; default to including Standard card pool for now.
        return STANDARD_SET_IDS.has(hsCard.set);
      case 'WILD':
      default:
        return true;
    }
  } else if (game === 'magic') {
    const magicCard = card as MagicCard;
    if (!magicCard.legalities) return format === 'ALL';
    
    // Check if card is legal in the selected format
    const formatLower = format.toLowerCase();
    const legality = magicCard.legalities[formatLower];
    return legality === 'legal' || legality === 'restricted';
  }
  
  return true;
}

function formatClassName(value: string): string {
  if (!value || typeof value !== 'string') return value || '';
  return CLASS_LABELS[value] ?? value.charAt(0) + value.slice(1).toLowerCase();
}

function toTitleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function usePersistentState<T>(key: string, initialValue: T) {
  // Use useState with initialValue to ensure server/client match
  const [state, setState] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        // Use requestAnimationFrame to avoid synchronous setState in effect
        requestAnimationFrame(() => {
          setState(parsed);
          setIsHydrated(true);
        });
      } else {
        setIsHydrated(true);
      }
    } catch {
      setIsHydrated(true);
    }
  }, [key]);

  // Save to localStorage when state changes (but only after hydration)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state, isHydrated]);

  return [state, setState] as const;
}

function useLocalDeck(key: string) {
  return usePersistentState<DeckEntry[]>(key, []);
}

function formatPercent(value: number | null | undefined, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

type CardLibraryProps = {
  hideDeckPanel?: boolean;
};

export default function CardLibrary({ hideDeckPanel = false }: CardLibraryProps = {}) {
  const { game: contextGame } = useGame();
  // Use state to avoid hydration mismatch - always start with 'hearthstone' (default)
  // This ensures server and client render the same initial content
  const [game, setGame] = useState<'magic' | 'hearthstone'>('hearthstone');
  
  // Update game after hydration to match context
  useEffect(() => {
    setGame(contextGame);
  }, [contextGame]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  
  // Hearthstone filters
  const [klass, setKlass] =
    useState<(typeof CLASS_FILTER_OPTIONS)[number]>('ALL');
  const [ctype, setCtype] = useState<(typeof HS_TYPES)[number]>('ALL');
  const [rarity, setRarity] = useState<(typeof HS_RARITIES)[number]>('ALL');
  const [mana, setMana] = useState<(typeof MANA)[number]>('ALL');
  const [mechanic, setMechanic] = useState<string>(FILTER_ALL);
  const [cardSet, setCardSet] = useState<string>(FILTER_ALL);
  const [tribe, setTribe] = useState<string>(FILTER_ALL);
  const [spellSchool, setSpellSchool] = useState<string>(FILTER_ALL);
  const [attack, setAttack] = useState<(typeof ATTACK_VALUES)[number]>('ALL');
  const [health, setHealth] = useState<(typeof HEALTH_VALUES)[number]>('ALL');
  
  // Magic filters
  const [magicColor, setMagicColor] = useState<(typeof MAGIC_COLORS)[number]>('ALL');
  const [magicType, setMagicType] = useState<(typeof MAGIC_TYPES)[number]>('ALL');
  const [magicRarity, setMagicRarity] = useState<(typeof MAGIC_RARITIES)[number]>('ALL');
  const [cmc, setCmc] = useState<(typeof CMC)[number]>('ALL');
  const [deck, setDeck] = useLocalDeck('scrylytics:deck:v2');
  const [collectibleOnly, setCollectibleOnly] = usePersistentState<boolean>(
    'scrylytics:collectible-only',
    true,
  );
  const [myCardsOnly, setMyCardsOnly] = usePersistentState<boolean>(
    'scrylytics:my-cards-only',
    false,
  );
  const [zoom, setZoom] = useState(100);
  const [format, setFormat] = usePersistentState<(typeof HS_FORMATS)[number] | (typeof MAGIC_FORMATS)[number]>(
    'scrylytics:filter-format',
    'ALL',
  );
  const [deckName, setDeckName] = usePersistentState<string>(
    'scrylytics:deck-name',
    'Untitled Deck',
  );
  const [heroDbfId, setHeroDbfId] = usePersistentState<number | null>(
    'scrylytics:deck-hero',
    null,
  );
  const [deckFormat, setDeckFormat] = usePersistentState<(typeof HS_FORMATS)[number]>(
    'scrylytics:deck-format',
    'STANDARD',
  );
  const [deckClass, setDeckClass] = usePersistentState<string>(
    'scrylytics:deck-class',
    'NEUTRAL',
  );
  const [savedDecks, setSavedDecks] = usePersistentState<SavedDeck[]>(
    'scrylytics:saved-decks',
    [],
  );
  const [metaDecks, setMetaDecks] = useState<MetaDeckSummary[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [deckCodeInput, setDeckCodeInput] = useState('');
  const [deckActionMessage, setDeckActionMessage] = useState<
    { tone: 'success' | 'error'; message: string } | undefined
  >(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [hoverCard, setHoverCard] = useState<HoverCardState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importTab, setImportTab] = useState<'saved' | 'paste' | 'meta'>('saved');
  const [importPasteValue, setImportPasteValue] = useState('');
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [initialisedFilters, setInitialisedFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileDeckOpen, setMobileDeckOpen] = useState(false);
  const [showCompactFilters, setShowCompactFilters] = useState(false);
  const [showZoomOverlay, setShowZoomOverlay] = useState(false);

  const importRef = useRef<HTMLInputElement | null>(null);
  const listParentRef = useRef<HTMLDivElement | null>(null);
  const [columnCount, setColumnCount] = useState(4);
  const [draggingType, setDraggingType] = useState<'library-card' | 'deck-entry' | null>(null);
  const [deckDropActive, setDeckDropActive] = useState(false);
  const [libraryDropActive, setLibraryDropActive] = useState(false);
  const deckDragCounter = useRef(0);
  const libraryDragCounter = useRef(0);
  const deckNameSnapshotRef = useRef(deckName);
  const router = useRouter();
  const pathname = usePathname();
  const filterBarRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!isEditingDeckName) {
      deckNameSnapshotRef.current = deckName;
    }
  }, [deckName, isEditingDeckName]);

  type DragPayload = { type: 'library-card'; id: string } | { type: 'deck-entry'; id: string };

  const parseDragPayload = (event: DragEvent<HTMLElement>): DragPayload | null => {
    try {
      const raw = event.dataTransfer.getData('application/json');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DragPayload;
      if (parsed && typeof parsed === 'object' && 'type' in parsed && 'id' in parsed) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const resetDragState = () => {
    deckDragCounter.current = 0;
    libraryDragCounter.current = 0;
    setDraggingType(null);
    setDeckDropActive(false);
    setLibraryDropActive(false);
  };

  const openCardModal = (cardId: string) => {
    setHoverCard(null);
    setSelectedCardId(cardId);
  };

  const handleHoverCard = useCallback(
    (event: MouseEvent<HTMLElement>, cardId: string, source: 'library' | 'deck') => {
          const rect = event.currentTarget.getBoundingClientRect();
      setHoverCard({
        id: cardId,
        source,
        rect: {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        },
      });
    },
    [],
  );

  const closeCardModal = () => {
    setSelectedCardId(null);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadingCount(0);
        setError(null);
        
        if (game === 'hearthstone') {
          // Load Hearthstone cards
          const url = collectibleOnly ? HS_CARDS_COLLECTIBLE_URL : HS_CARDS_ALL_URL;
          const response = await fetch(url, { cache: 'default' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data: HSCard[] = await response.json();
          if (!mounted) return;
          const normalised = data.map((card) => ({
            ...card,
            mechanics: card.mechanics,
          }));
          normalised.sort(
            (a, b) =>
              (a.cost ?? 0) - (b.cost ?? 0) || a.name.localeCompare(b.name),
          );
          setCards(normalised);
        } else if (game === 'magic') {
          // Load Magic cards from Scryfall with pagination
          // Fetch ALL cards by paginating through all available pages
          // Use 'game:paper' to get all paper cards (Scryfall doesn't support '*' as a query)
          const searchQuery = collectibleOnly ? 'is:reprint game:paper' : 'game:paper';
          
          // Helper function to convert Scryfall cards to our MagicCard type
          const convertCards = (scryfallCards: any[]): MagicCard[] => {
            return scryfallCards.map((card: any) => ({
              id: card.id || card.name,
              name: card.name,
              mana_cost: card.mana_cost,
              cmc: card.cmc,
              type_line: card.type_line,
              colors: card.colors || [],
              color_identity: card.color_identity || [],
              rarity: card.rarity?.toUpperCase(),
              set: card.set,
              set_name: card.set_name,
              power: card.power,
              toughness: card.toughness,
              keywords: card.keywords || [],
              oracle_text: card.oracle_text,
              image_uris: card.image_uris,
              legalities: card.legalities,
            }));
          };
          
          // Fetch cards with incremental updates
          const magicCards = await searchCardsPaginated(searchQuery, (cards: any[], count: number) => {
            // Update cards and count in real-time as they're loaded
            if (mounted) {
              const normalised = convertCards(cards);
              // Sort incrementally loaded cards
              normalised.sort(
                (a, b) =>
                  (a.cmc ?? 0) - (b.cmc ?? 0) || a.name.localeCompare(b.name),
              );
              setCards(normalised);
              setLoadingCount(count);
            }
          }); // Fetch all pages
          if (!mounted) return;
          
          // Final conversion and sort (in case progress callback didn't fire for some reason)
          const normalised: MagicCard[] = convertCards(magicCards);
          normalised.sort(
            (a, b) =>
              (a.cmc ?? 0) - (b.cmc ?? 0) || a.name.localeCompare(b.name),
          );
          setCards(normalised);
          setLoadingCount(normalised.length);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load cards';
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingCount(0);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [game, collectibleOnly]);

  const handleLibraryCardDragStart = (event: DragEvent<HTMLElement>, card: Card) => {
    setDraggingType('library-card');
    deckDragCounter.current = 0;
    libraryDragCounter.current = 0;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'library-card', id: card.id }),
    );
  };

  const handleDeckEntryDragStart = (event: DragEvent<HTMLElement>, entry: DeckEntry) => {
    setDraggingType('deck-entry');
    deckDragCounter.current = 0;
    libraryDragCounter.current = 0;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'deck-entry', id: entry.id }),
    );
  };

  const handleDeckDragEnter = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'library-card') return;
    event.preventDefault();
    deckDragCounter.current += 1;
    setDeckDropActive(true);
  };

  const handleDeckDragLeave = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'library-card') return;
    event.preventDefault();
    deckDragCounter.current = Math.max(0, deckDragCounter.current - 1);
    if (deckDragCounter.current === 0) {
      setDeckDropActive(false);
    }
  };

  const handleDeckDragOver = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'library-card') return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDeckDrop = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'library-card') {
      resetDragState();
      return;
    }
    event.preventDefault();
    const payload = parseDragPayload(event);
    if (payload?.type === 'library-card') {
      const card = cards.find((item) => item.id === payload.id);
      if (card) {
        addToDeck(card);
      }
    }
    resetDragState();
  };

  const handleLibraryDragEnter = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'deck-entry') return;
    event.preventDefault();
    libraryDragCounter.current += 1;
    setLibraryDropActive(true);
  };

  const handleLibraryDragLeave = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'deck-entry') return;
    event.preventDefault();
    libraryDragCounter.current = Math.max(0, libraryDragCounter.current - 1);
    if (libraryDragCounter.current === 0) {
      setLibraryDropActive(false);
    }
  };

  const handleLibraryDragOver = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'deck-entry') return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleLibraryDrop = (event: DragEvent<HTMLElement>) => {
    if (draggingType !== 'deck-entry') {
      resetDragState();
      return;
    }
    event.preventDefault();
    const payload = parseDragPayload(event);
    if (payload?.type === 'deck-entry') {
      removeFromDeck(payload.id);
    }
    resetDragState();
  };

  const heroOptions = useMemo(() => {
    if (game !== 'hearthstone') return new Map<string, { dbfId: number; name: string }>();
    const map = new Map<string, { dbfId: number; name: string }>();
    cards
      .filter((card): card is HSCard => {
        const hsCard = card as HSCard;
        return hsCard.type === 'HERO' && hsCard.dbfId !== undefined;
      })
      .forEach((card) => {
        const hsCard = card as HSCard;
        if (!hsCard.cardClass || map.has(hsCard.cardClass)) return;
        map.set(hsCard.cardClass, { dbfId: hsCard.dbfId!, name: hsCard.name });
      });
    return map;
  }, [cards, game]);

  const cardLookup = useMemo(() => {
    const map = new Map<string, Card>();
    cards.forEach((card) => {
      map.set(card.id, card);
    });
    return map;
  }, [cards]);

  const cardWidth = CARD_BASE_WIDTH * (zoom / 100);
  const cardRowHeight = CARD_ROW_HEIGHT_BASE * (zoom / 100);

  useEffect(() => {
    const parent = listParentRef.current;
    if (!parent) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      const next = Math.max(1, Math.floor(width / cardWidth));
      setColumnCount(next);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [cardWidth]);

  useEffect(() => {
    if (deckClass && deckClass !== 'ALL' && deckClass !== 'NEUTRAL') {
      const hero = heroOptions.get(deckClass);
      if (hero) setHeroDbfId(hero.dbfId);
    } else if (deckClass === 'NEUTRAL') {
      setHeroDbfId(null);
    }
  }, [deckClass, heroOptions, setHeroDbfId]);

  const mechanicOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => {
      normaliseMechanics(card).forEach((name) => set.add(name));
    });
    return [FILTER_ALL, ...Array.from(set).sort()];
  }, [cards]);

  const setOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => {
      if (card.set) set.add(card.set);
    });
    return [FILTER_ALL, ...Array.from(set).sort()];
  }, [cards]);

  const tribeOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => {
      const tribeName = extractTribe(card);
      if (tribeName) set.add(tribeName);
    });
    return [FILTER_ALL, ...Array.from(set).sort()];
  }, [cards]);

  const spellSchoolOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => {
      if (game === 'hearthstone' && 'spellSchool' in card && card.spellSchool) {
        set.add(card.spellSchool);
      }
    });
    return [FILTER_ALL, ...Array.from(set).sort()];
  }, [cards]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setMetaLoading(true);
        setMetaError(null);
        const response = await fetch(
          '/api/meta?format=standard&rankRange=DIAMOND_THROUGH_LEGEND&timeRange=LAST_7_DAYS',
        );
        if (!response.ok) {
          throw new Error(`Meta API error ${response.status}`);
        }
        const payload = await response.json();
        if (cancelled) return;
        const latest = Array.isArray(payload?.latest)
          ? payload.latest.slice(0, 6)
          : [];
        const records: MetaDeckSummary[] = latest.map((item: any, index: number) => {
          const deckCode =
            Array.isArray(item?.deckCodes) && item.deckCodes.length > 0
              ? item.deckCodes[0]
              : null;
          const heroId = Array.isArray(item?.heroDbfIds)
            ? item.heroDbfIds[0] ?? null
            : null;
          return {
            id: String(item?.id ?? `meta-${index}`),
            name: String(item?.name ?? 'Meta Deck'),
            className: item?.class ?? null,
            winRate: typeof item?.winRate === 'number' ? item.winRate : null,
            popularity:
              typeof item?.popularity === 'number' ? item.popularity : null,
            deckCode,
            heroDbfId: heroId,
          };
        });
        setMetaDecks(records);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Unable to load meta snapshot';
        setMetaError(message);
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!deckActionMessage || typeof window === 'undefined') return;
    const timer = window.setTimeout(() => setDeckActionMessage(undefined), 4000);
    return () => window.clearTimeout(timer);
  }, [deckActionMessage]);

  useEffect(() => {
    if (typeof window === 'undefined' || initialisedFilters) return;
    const params = new URLSearchParams(window.location.search);
    const paramQ = params.get('q');
    if (paramQ !== null) setQ(paramQ);
    const paramClass = params.get('class');
    if (paramClass && (CLASS_FILTER_OPTIONS as readonly string[]).includes(paramClass)) {
      setKlass(paramClass as (typeof CLASS_FILTER_OPTIONS)[number]);
    }
    const paramFormat = params.get('format');
    if (paramFormat && game === 'hearthstone' && (HS_FORMATS as readonly string[]).includes(paramFormat)) {
      setFormat(paramFormat as (typeof HS_FORMATS)[number]);
    } else if (paramFormat && game === 'magic' && (MAGIC_FORMATS as readonly string[]).includes(paramFormat)) {
      setFormat(paramFormat as (typeof MAGIC_FORMATS)[number]);
    }
    const paramType = params.get('type');
    if (paramType && game === 'hearthstone' && (HS_TYPES as readonly string[]).includes(paramType)) {
      setCtype(paramType as (typeof HS_TYPES)[number]);
    } else if (paramType && game === 'magic' && (MAGIC_TYPES as readonly string[]).includes(paramType)) {
      setMagicType(paramType as (typeof MAGIC_TYPES)[number]);
    }
    const paramRarity = params.get('rarity');
    if (paramRarity && game === 'hearthstone' && (HS_RARITIES as readonly string[]).includes(paramRarity)) {
      setRarity(paramRarity as (typeof HS_RARITIES)[number]);
    } else if (paramRarity && game === 'magic' && (MAGIC_RARITIES as readonly string[]).includes(paramRarity)) {
      setMagicRarity(paramRarity as (typeof MAGIC_RARITIES)[number]);
    }
    const paramMana = params.get('mana');
    if (paramMana && (MANA as readonly string[]).includes(paramMana)) {
      setMana(paramMana as (typeof MANA)[number]);
    }
    const paramMechanic = params.get('mechanic');
    if (paramMechanic) setMechanic(paramMechanic);
    const paramSet = params.get('set');
    if (paramSet) setCardSet(paramSet);
    const paramTribe = params.get('tribe');
    if (paramTribe) setTribe(paramTribe);
    const paramSchool = params.get('spellSchool');
    if (paramSchool) setSpellSchool(paramSchool);
    const paramAttack = params.get('attack');
    if (paramAttack && (ATTACK_VALUES as readonly string[]).includes(paramAttack)) {
      setAttack(paramAttack as (typeof ATTACK_VALUES)[number]);
    }
    const paramHealth = params.get('health');
    if (paramHealth && (HEALTH_VALUES as readonly string[]).includes(paramHealth)) {
      setHealth(paramHealth as (typeof HEALTH_VALUES)[number]);
    }
    const collectibleParam = params.get('collectible');
    if (collectibleParam === 'false') setCollectibleOnly(false);
    setInitialisedFilters(true);
  }, [
    initialisedFilters,
    setCardSet,
    setCollectibleOnly,
    setFormat,
    setKlass,
    setMana,
    setMechanic,
    setQ,
    setRarity,
    setSpellSchool,
    setTribe,
    setCtype,
  ]);

  useEffect(() => {
    if (!initialisedFilters || typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (klass !== 'ALL') params.set('class', klass);
    if (format !== 'ALL') params.set('format', format);
    if (ctype !== 'ALL') params.set('type', ctype);
    if (rarity !== 'ALL') params.set('rarity', rarity);
    if (mana !== 'ALL') params.set('mana', mana);
    if (mechanic !== FILTER_ALL) params.set('mechanic', mechanic);
    if (cardSet !== FILTER_ALL) params.set('set', cardSet);
    if (tribe !== FILTER_ALL) params.set('tribe', tribe);
    if (spellSchool !== FILTER_ALL) params.set('spellSchool', spellSchool);
    if (attack !== 'ALL') params.set('attack', attack);
    if (health !== 'ALL') params.set('health', health);
    if (!collectibleOnly) params.set('collectible', 'false');
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname ?? '/decklytics/library';
    router.replace(url, { scroll: false });
  }, [
    cardSet,
    collectibleOnly,
    ctype,
    format,
    initialisedFilters,
    klass,
    mana,
    mechanic,
    pathname,
    q,
    rarity,
    router,
    spellSchool,
    tribe,
    attack,
    health,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encodedDeck = params.get('deck');
    const encodedName = params.get('name');
    if (encodedName) {
      setDeckName(encodedName);
    }
    if (encodedDeck) {
      importDeckFromCode(encodedDeck, { skipToast: true }).catch(() => {
        // best effort
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      if (!filterBarRef.current) return;
      const rect = filterBarRef.current.getBoundingClientRect();
      setShowCompactFilters(rect.bottom <= 80);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const filteredCards = useMemo(() => {
    const query = q.trim().toLowerCase();
    return cards.filter((card) => {
      if (game === 'hearthstone') {
        const hsCard = card as HSCard;
        // Hearthstone filters
        if (
          klass !== 'ALL' &&
          (hsCard.cardClass ?? 'NEUTRAL').toUpperCase() !== klass
        ) {
          return false;
        }
        if (!matchesFormat(card, format, game)) {
          return false;
        }
        if (collectibleOnly && !hsCard.collectible) {
          return false;
        }
        if (myCardsOnly && !deck.some((entry) => entry.id === hsCard.id)) {
          return false;
        }
        if (ctype !== 'ALL' && (hsCard.type ?? '').toUpperCase() !== ctype) {
          return false;
        }
        if (rarity !== 'ALL' && (hsCard.rarity ?? '').toUpperCase() !== rarity) {
          return false;
        }
        if (mana !== 'ALL') {
          const cost = hsCard.cost ?? 0;
          if (mana === '7+' && cost < 7) return false;
          if (mana !== '7+' && cost !== Number(mana)) return false;
        }
        if (attack !== 'ALL') {
          const atk = hsCard.attack ?? 0;
          if (attack === '10+' && atk < 10) return false;
          if (attack !== '10+' && atk !== Number(attack)) return false;
        }
        if (health !== 'ALL') {
          const hp = hsCard.health ?? 0;
          if (health === '10+' && hp < 10) return false;
          if (health !== '10+' && hp !== Number(health)) return false;
        }
        if (mechanic !== FILTER_ALL) {
          const names = normaliseMechanics(hsCard);
          if (!names.includes(mechanic)) {
            return false;
          }
        }
        if (cardSet !== FILTER_ALL && (hsCard.set ?? '') !== cardSet) {
          return false;
        }
        if (tribe !== FILTER_ALL) {
          const tribeName = extractTribe(hsCard);
          if (tribeName !== tribe) {
            return false;
          }
        }
        if (spellSchool !== FILTER_ALL) {
          if ((hsCard.spellSchool ?? '') !== spellSchool) {
            return false;
          }
        }
        if (query.length > 0) {
          const haystack = [
            hsCard.name,
            hsCard.text,
            normaliseMechanics(hsCard).join(' '),
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(query)) {
            return false;
          }
        }
      } else if (game === 'magic') {
        const magicCard = card as MagicCard;
        // Magic filters
        if (!matchesFormat(card, format, game)) {
          return false;
        }
        if (myCardsOnly && !deck.some((entry) => entry.id === magicCard.id)) {
          return false;
        }
        if (magicColor !== 'ALL') {
          const colors = magicCard.colors || magicCard.color_identity || [];
          if (magicColor === 'COLORLESS') {
            if (colors.length > 0) return false;
          } else if (magicColor === 'MULTICOLOR') {
            if (colors.length < 2) return false;
          } else {
            const colorMap: Record<string, string> = {
              'WHITE': 'W',
              'BLUE': 'U',
              'BLACK': 'B',
              'RED': 'R',
              'GREEN': 'G',
            };
            const targetColor = colorMap[magicColor];
            if (!colors.includes(targetColor)) return false;
          }
        }
        if (magicType !== 'ALL') {
          const typeLine = (magicCard.type_line || '').toUpperCase();
          if (!typeLine.includes(magicType)) {
            return false;
          }
        }
        if (magicRarity !== 'ALL') {
          const cardRarity = (magicCard.rarity || '').toUpperCase();
          if (cardRarity !== magicRarity) {
            return false;
          }
        }
        if (cmc !== 'ALL') {
          const cardCmc = magicCard.cmc ?? 0;
          if (cmc === '7+' && cardCmc < 7) return false;
          if (cmc !== '7+' && cardCmc !== Number(cmc)) return false;
        }
        if (query.length > 0) {
          const haystack = [
            magicCard.name,
            magicCard.oracle_text || '',
            magicCard.type_line || '',
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(query)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [
    cards,
    game,
    q,
    klass,
    format,
    collectibleOnly,
    myCardsOnly,
    deck,
    ctype,
    rarity,
    mana,
    attack,
    health,
    mechanic,
    cardSet,
    tribe,
    spellSchool,
    magicColor,
    magicType,
    magicRarity,
    cmc,
  ]);

  const rowCount = useMemo(() => {
    if (filteredCards.length === 0) return 0;
    return Math.ceil(filteredCards.length / Math.max(columnCount, 1));
  }, [filteredCards.length, columnCount]);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => cardRowHeight,
    overscan: 6,
  });

  const deckCount = deck.reduce((total, entry) => total + entry.copies, 0);

  const manaCurve = useMemo(() => {
    const buckets: Record<string, number> = {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7+': 0,
    };
    deck.forEach((entry) => {
      const cost = entry.cost ?? 0;
      const bucket = cost >= 7 ? '7+' : String(cost as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      buckets[bucket] += entry.copies;
    });
    return buckets;
  }, [deck]);

  const deckValidation = useMemo(() => {
    const issues: string[] = [];
    const invalidIds = new Set<string>();
    let blood = 0;
    let frost = 0;
    let unholy = 0;

    if (deckCount !== MAX_DECK_CARDS) {
      issues.push(`Deck must contain ${MAX_DECK_CARDS} cards (currently ${deckCount}).`);
    }

    if (deckClass && deckClass !== 'ALL' && deckClass !== 'NEUTRAL') {
      deck.forEach((entry) => {
        const cardData = cardLookup.get(entry.id);
        // Type guard: cardClass only exists on HSCard, not MagicCard
        let cardClass = entry.cardClass ?? '';
        if (cardData && 'cardClass' in cardData) {
          cardClass = (cardData as HSCard).cardClass ?? cardClass;
        }
        cardClass = cardClass.toUpperCase();
        if (cardClass && cardClass !== 'NEUTRAL' && cardClass !== deckClass) {
          invalidIds.add(entry.id);
        }
      });
      if (invalidIds.size > 0) {
        issues.push('Contains cards outside the selected class.');
      }
    }

    if (deckClass === 'DEATHKNIGHT') {
      deck.forEach((entry) => {
        const cardData = cardLookup.get(entry.id as string);
        const runeCost = (cardData as any)?.runeCost;
        if (runeCost) {
          blood = Math.max(blood, runeCost.blood ?? 0);
          frost = Math.max(frost, runeCost.frost ?? 0);
          unholy = Math.max(unholy, runeCost.unholy ?? 0);
        }
      });
      const runeTotal = blood + frost + unholy;
      if (runeTotal > 3) {
        issues.push('Rune requirements exceed three slots.');
        deck.forEach((entry) => {
          const cardData = cardLookup.get(entry.id as string);
          if ((cardData as any)?.runeCost) {
            invalidIds.add(entry.id);
          }
        });
      }
    }

    return {
      issues,
      invalidCardIds: invalidIds,
      runes: { blood, frost, unholy },
    };
  }, [cardLookup, deck, deckClass, deckCount]);

  const deckIssues = deckValidation.issues;
  const invalidCardIds = deckValidation.invalidCardIds;
  const runeSummary = deckValidation.runes;
  const deckCountValid = deckCount === MAX_DECK_CARDS;

  const getCardInfo = useCallback(
    (cardId: string): CardInfo | null => {
      const baseCard = cardLookup.get(cardId);
      if (baseCard) {
        if (game === 'hearthstone') {
          const hsCard = baseCard as HSCard;
          const text = hsCard.text ?? '';
          return {
            id: hsCard.id,
            name: hsCard.name,
            cost: hsCard.cost ?? 0,
            cardClass: hsCard.cardClass ?? 'NEUTRAL',
            type: hsCard.type ?? '',
            rarity: hsCard.rarity ?? '',
            text,
            htmlText: text.replace(/\n/g, '<br />'),
            set: hsCard.set ?? '',
            image: cardImg(hsCard.id, hsCard) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjIzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==',
          };
        } else {
          const magicCard = baseCard as MagicCard;
          const text = magicCard.oracle_text ?? '';
          return {
            id: magicCard.id,
            name: magicCard.name,
            cost: magicCard.cmc ?? 0,
            cardClass: '',
            type: magicCard.type_line ?? '',
            rarity: magicCard.rarity ?? '',
            text,
            htmlText: text.replace(/\n/g, '<br />'),
            set: magicCard.set ?? '',
            image: cardImg(magicCard.id, magicCard) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjIzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==',
          };
        }
      }
      const entry = deck.find((card) => card.id === cardId);
      if (entry) {
        const baseCardForEntry = cardLookup.get(entry.id);
        return {
          id: entry.id,
          name: entry.name,
          cost: entry.cost ?? 0,
          cardClass: entry.cardClass ?? 'NEUTRAL',
          type: entry.type ?? '',
          rarity: entry.rarity ?? '',
          text: '',
          htmlText: '',
          set: entry.set ?? '',
          image: cardImg(entry.id, baseCardForEntry) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjIzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==',
        };
      }
      return null;
    },
    [cardLookup, deck, game],
  );

  const previewCardInfo = hoverCard ? getCardInfo(hoverCard.id) : null;
  const previewPositionStyle = useMemo<CSSProperties | null>(() => {
    if (!hoverCard) return null;
    const padding = 16;
    const cardWidth = 256;
    const cardHeight = 358;
    const midX = hoverCard.rect.left + hoverCard.rect.width / 2;
    const midY = hoverCard.rect.top + hoverCard.rect.height / 2;
    const clampedX = Math.min(
      Math.max(midX, padding + cardWidth / 2),
      window.innerWidth - padding - cardWidth / 2,
    );
    const clampedY = Math.min(
      Math.max(midY, padding + cardHeight / 2),
      window.innerHeight - padding - cardHeight / 2,
    );
    return {
      top: clampedY,
      left: clampedX,
      transform: 'translate(-50%, -50%)',
    };
  }, [hoverCard]);
  const selectedCardInfo = selectedCardId ? getCardInfo(selectedCardId) : null;

  const renderDeckPanel = (variant: 'desktop' | 'mobile') => (
    <div className={`flex flex-col ${variant === 'mobile' ? 'h-full' : ''}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          {isEditingDeckName ? (
            <input
              value={deckName}
              onChange={handleDeckNameChange}
              onBlur={() => setIsEditingDeckName(false)}
              onKeyDown={handleDeckNameKeyDown}
              autoFocus
              className="w-full rounded-md border border-emerald-400/40 bg-black/40 px-2 py-1 text-xl font-display focus:border-emerald-400 focus:outline-none"
            />
          ) : (
            <h2 
              className="font-display text-xl cursor-pointer hover:text-white/80"
              onClick={beginDeckNameEdit}
            >
              {deckName || 'Untitled Deck'}
            </h2>
          )}
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs ${
            deckCountValid ? 'bg-emerald-500 text-black' : 'border border-rose-500/40 bg-rose-500/20 text-rose-200'
          }`}
        >
          {deckCount}/{MAX_DECK_CARDS}
        </span>
      </header>

      <div className="mb-4 flex gap-2 text-xs text-white/70 md:text-[11px]">
          <select
            value={deckFormat}
            onChange={(event) => setDeckFormat(event.target.value as (typeof HS_FORMATS)[number])}
          className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
          >
            {HS_FORMATS.filter((option) => option !== 'ALL').map((option) => (
              <option key={option} value={option}>
                {toTitleCase(option)}
              </option>
            ))}
          </select>
          <select
            value={deckClass}
            onChange={(event) => setDeckClass(event.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
          >
            {DECK_CLASSES.map((option) => (
              <option key={option} value={option}>
                {formatClassName(option)}
              </option>
            ))}
          </select>
      </div>

      {deckClass === 'DEATHKNIGHT' && (
        <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <div className="font-semibold uppercase tracking-[0.3em] text-emerald-300">Active Runes</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <span className="w-full rounded bg-emerald-500/20 px-2 py-1 text-center">Blood: {runeSummary.blood}</span>
            <span className="w-full rounded bg-emerald-500/20 px-2 py-1 text-center">Frost: {runeSummary.frost}</span>
            <span className="w-full rounded bg-emerald-500/20 px-2 py-1 text-center">Unholy: {runeSummary.unholy}</span>
          </div>
        </div>
      )}

      {deckIssues.length > 0 && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          <ul className="space-y-1">
            {deckIssues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
        >
          <ArrowUpTrayIcon className="size-4" /> Import
        </button>
        <button
          type="button"
          onClick={() => setShowExportModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
        >
          <ArrowDownTrayIcon className="size-4" /> Export
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <span className="text-xs text-white/60">Deck code</span>
        <div className="relative">
          <textarea
            value={deckCodeInput}
            onChange={(event) => setDeckCodeInput(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            placeholder="Paste or generate a deck code"
          />
          <button
            type="button"
            onClick={copyDeckCode}
            className="absolute right-2 top-2 inline-flex items-center justify-center rounded border border-white/10 bg-white/5 p-1 text-white/70 hover:bg-white/10"
            title="Copy deck code"
          >
            <ClipboardDocumentIcon className="size-4" />
          </button>
        </div>
          <button
            type="button"
            onClick={() => importDeckFromCode(deckCodeInput)}
          className="w-full rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
          >
            Import code
          </button>
      </div>

      {deckActionMessage && (
        <div
          className={`mb-3 rounded-lg border px-3 py-2 text-xs ${
            deckActionMessage.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
          role="status"
        >
          {deckActionMessage.message}
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto pr-1 rounded-lg ${
          deckDropActive ? 'border border-emerald-400/40 bg-emerald-500/10 ring-2 ring-emerald-400 ring-opacity-40' : ''
        }`}
        onDragEnter={handleDeckDragEnter}
        onDragLeave={handleDeckDragLeave}
        onDragOver={handleDeckDragOver}
        onDrop={handleDeckDrop}
      >
        <ul className="space-y-2">
          {deck
            .slice()
            .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
            .map((entry) => (
              <li
                key={entry.id}
                className={`group relative cursor-pointer rounded-lg border p-2 transition ${
                  invalidCardIds.has(entry.id)
                    ? 'border-rose-500/60 bg-rose-500/10'
                    : 'border-white/10 bg-black/40 hover:border-emerald-300/40 hover:bg-emerald-500/5'
                }`}
                draggable
                onDragStart={(event) => handleDeckEntryDragStart(event, entry)}
                onDragEnd={resetDragState}
                onMouseEnter={(event) => handleHoverCard(event, entry.id, 'deck')}
                onMouseLeave={() => setHoverCard(null)}
                onClick={() => openCardModal(entry.id)}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const imgSrc = cardImg(entry.id, cardLookup.get(entry.id));
                    return imgSrc ? (
                      <img src={imgSrc} alt={entry.name} className="h-10 w-10 rounded-sm object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-sm bg-zinc-800" />
                    );
                  })()}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">{entry.cost}</span>
                      <span className="truncate text-sm">{entry.name}</span>
                    </div>
                    <div className="text-[10px] text-white/40">
                      {formatClassName(entry.cardClass ?? 'NEUTRAL')} • {entry.rarity ?? '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFromDeck(entry.id);
                      }}
                      className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                      title="Remove a copy"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-xs">{entry.copies}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        addToDeck({
                          id: entry.id,
                          dbfId: entry.dbfId,
                          name: entry.name,
                          cost: entry.cost,
                          rarity: entry.rarity,
                          cardClass: entry.cardClass,
                          type: entry.type,
                          set: entry.set ?? undefined,
                          mechanics: entry.mechanics,
                          spellSchool: entry.spellSchool ?? undefined,
                          race: entry.tribe ?? undefined,
                          collectible: true,
                        });
                      }}
                      className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                      title="Add a copy"
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
        <div className="mb-2 text-xs text-white/60">Mana Curve</div>
        <div className="grid grid-cols-8 gap-1 text-center text-[10px] text-white/60">
          {['0', '1', '2', '3', '4', '5', '6', '7+'].map((bucket) => (
            <div key={bucket} className="space-y-1">
              <div
                className="mx-auto w-3 rounded bg-emerald-400/80"
                style={{
                  height: `${manaCurve[bucket] * 8 + 2}px`,
                }}
                title={`${bucket}: ${manaCurve[bucket] ?? 0}`}
              />
              <div>{bucket}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const resetFilters = () => {
    setQ('');
    setKlass('ALL');
    setCtype('ALL');
    setRarity('ALL');
    setMana('ALL');
    setMechanic(FILTER_ALL);
    setCardSet(FILTER_ALL);
    setTribe(FILTER_ALL);
    setSpellSchool(FILTER_ALL);
    setAttack('ALL');
    setHealth('ALL');
    setFormat('ALL');
    setCollectibleOnly(true);
    setShowAdvancedFilters(false);
    setShowMobileFilters(false);
  };

  function addToDeck(card: Card) {
    const total = deck.reduce((sum, entry) => sum + entry.copies, 0);
    const maxCards = game === 'hearthstone' ? MAX_DECK_CARDS : 60; // Magic decks are typically 60 cards
    if (total >= maxCards) {
      setDeckActionMessage({
        tone: 'error',
        message: 'Deck is full — remove a card to add more.',
      });
      return;
    }

    const existing = deck.find((entry) => entry.id === card.id);
    
    if (game === 'hearthstone') {
      const hsCard = card as HSCard;
      const legendary = isLegendary(hsCard);
      const limit = legendary ? 1 : 2;

      if (
        heroDbfId === null &&
        hsCard.cardClass &&
        hsCard.cardClass !== 'NEUTRAL' &&
        heroOptions.has(hsCard.cardClass)
      ) {
        setHeroDbfId(heroOptions.get(hsCard.cardClass)!.dbfId);
      }

      if (existing) {
        if (existing.copies >= limit) {
          setDeckActionMessage({
            tone: 'error',
            message: `${hsCard.name} is already at its copy limit.`,
          });
          return;
        }
        setDeck(
          deck.map((entry) =>
            entry.id === hsCard.id
              ? { ...entry, copies: entry.copies + 1 }
              : entry,
          ),
        );
        setDeckActionMessage({
          tone: 'success',
          message: `Added another copy of ${hsCard.name}.`,
        });
      } else {
        const entry: DeckEntry = {
          id: hsCard.id,
          dbfId: hsCard.dbfId,
          name: hsCard.name,
          cost: hsCard.cost ?? 0,
          rarity: hsCard.rarity,
          cardClass: hsCard.cardClass,
          type: hsCard.type,
          set: hsCard.set ?? null,
          mechanics: normaliseMechanics(hsCard),
          tribe: extractTribe(hsCard),
          spellSchool: hsCard.spellSchool ?? null,
          copies: 1,
          legendary,
        };
        setDeck([...deck, entry]);
        setDeckActionMessage({
          tone: 'success',
          message: `Added ${hsCard.name} to the deck.`,
        });
      }
    } else if (game === 'magic') {
      const magicCard = card as MagicCard;
      // Magic cards typically have a limit of 4 copies (except basic lands)
      const isBasicLand = magicCard.type_line?.toLowerCase().includes('basic land');
      const limit = isBasicLand ? 999 : 4;

      if (existing) {
        if (existing.copies >= limit) {
          setDeckActionMessage({
            tone: 'error',
            message: `${magicCard.name} is already at its copy limit (${limit}).`,
          });
          return;
        }
        setDeck(
          deck.map((entry) =>
            entry.id === magicCard.id
              ? { ...entry, copies: entry.copies + 1 }
              : entry,
          ),
        );
        setDeckActionMessage({
          tone: 'success',
          message: `Added another copy of ${magicCard.name}.`,
        });
      } else {
        const entry: DeckEntry = {
          id: magicCard.id,
          dbfId: undefined,
          name: magicCard.name,
          cost: magicCard.cmc ?? 0,
          rarity: magicCard.rarity,
          cardClass: '',
          type: magicCard.type_line ?? '',
          set: magicCard.set ?? '',
          mechanics: magicCard.keywords || [],
          tribe: null,
          spellSchool: null,
          copies: 1,
          legendary: magicCard.rarity === 'MYTHIC',
        };
        setDeck([...deck, entry]);
        setDeckActionMessage({
          tone: 'success',
          message: `Added ${magicCard.name} to the deck.`,
        });
      }
    }
  }

  function removeFromDeck(id: string) {
    const entry = deck.find((card) => card.id === id);
    if (!entry) return;
    if (entry.copies > 1) {
      setDeck(
        deck.map((card) =>
          card.id === id ? { ...card, copies: card.copies - 1 } : card,
        ),
      );
    } else {
      setDeck(deck.filter((card) => card.id !== id));
    }
  }

  function clearDeck() {
    setDeck([]);
    setDeckActionMessage({
      tone: 'success',
      message: 'Deck cleared.',
    });
  }

  function exportDeck() {
    try {
      const payload = {
        name: deckName,
        createdAt: new Date().toISOString(),
        heroDbfId,
        cards: deck,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${deckName.replace(/\s+/g, '-').toLowerCase() || 'deck'}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setDeckActionMessage({
        tone: 'error',
        message: 'Failed to export deck.',
      });
    }
  }

  function importDeckFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<SavedDeck>;
        if (!parsed || !Array.isArray(parsed.cards)) {
          throw new Error('Invalid deck file.');
        }
        setDeck(parsed.cards as DeckEntry[]);
        if (parsed.name) setDeckName(parsed.name);
        if (typeof parsed.heroDbfId === 'number') {
          setHeroDbfId(parsed.heroDbfId);
        }
        setDeckActionMessage({
          tone: 'success',
          message: 'Deck imported from file.',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to import deck file.';
        setDeckActionMessage({ tone: 'error', message });
      }
    };
    reader.readAsText(file);
  }

  const encodeCurrentDeck = useCallback(() => {
    if (deck.length === 0) return null;
    const cardsPayload = deck
      .filter((entry) => typeof entry.dbfId === 'number')
      .map((entry) => [entry.dbfId!, entry.copies] as [number, number]);
    if (cardsPayload.length === 0) return null;
    const heroes = heroDbfId ? [heroDbfId] : [];
    const payload = {
      heroes,
      cards: cardsPayload,
      format: 2 as const, // 2 = Standard format
    };
    try {
      return encodeDeck(payload);
    } catch {
      return null;
    }
  }, [deck, heroDbfId]);

  async function copyDeckCode() {
    const code = encodeCurrentDeck();
    if (!code) {
      setDeckActionMessage({
        tone: 'error',
        message: 'Add cards to generate a deck code.',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setDeckActionMessage({
        tone: 'success',
        message: 'Deck code copied to clipboard.',
      });
    } catch {
      setDeckActionMessage({
        tone: 'error',
        message: 'Clipboard copy failed — copy manually.',
      });
    }
  }

  async function copyShareLink() {
    if (typeof window === 'undefined') return;
    const code = encodeCurrentDeck();
    if (!code) {
      setDeckActionMessage({
        tone: 'error',
        message: 'Need a valid deck code before sharing.',
      });
      return;
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('deck', code);
      url.searchParams.set('name', deckName);
      await navigator.clipboard.writeText(url.toString());
      setDeckActionMessage({
        tone: 'success',
        message: 'Sharable link copied.',
      });
    } catch {
      setDeckActionMessage({
        tone: 'error',
        message: 'Unable to copy link to clipboard.',
      });
    }
  }

  async function importDeckFromCode(code: string, options?: { skipToast?: boolean }) {
    try {
      const trimmed = code.trim();
      if (!trimmed) throw new Error('Deck code cannot be empty.');
      const parsed = await parseDeckCode(trimmed);
      if (!parsed.cards || parsed.cards.length === 0) {
        throw new Error('That deck code did not contain any cards.');
      }
      const entries: DeckEntry[] = parsed.cards.map((card: any) => ({
        id: card.id ?? String(card.dbfId),
        dbfId: card.dbfId,
        name: card.name ?? 'Unknown Card',
        cost: card.cost ?? 0,
        rarity: card.rarity ?? undefined,
        cardClass: card.cardClass ?? undefined,
        type: card.type ?? undefined,
        set: card.set ?? null,
        mechanics: card.mechanics ?? [],
        tribe: card.tribe ?? null,
        spellSchool: card.spellSchool ?? null,
        copies: card.copies ?? card.count ?? 1,
        legendary: card.legendary ?? false,
      }));
      setDeck(entries);
      if ('heroDbfId' in parsed && parsed.heroDbfId) {
        setHeroDbfId((parsed as any).heroDbfId);
      }
      const parsedClass = ('heroCard' in parsed && (parsed as any).heroCard?.cardClass) ?? null;
      if (typeof parsedClass === 'string') {
        setDeckClass(parsedClass.toUpperCase());
      } else {
        const inferredClass = entries.find((entry) => entry.cardClass && entry.cardClass !== 'NEUTRAL')?.cardClass;
        if (inferredClass) setDeckClass(inferredClass);
      }
      setDeckActionMessage(
        options?.skipToast
          ? undefined
          : {
              tone: parsed.valid ? 'success' : 'error',
              message: parsed.valid
                ? 'Deck imported from code.'
                : 'Deck loaded, but it may be incomplete.',
            },
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to import deck code.';
      setDeckActionMessage({ tone: 'error', message });
    }
  }

  function saveCurrentDeck() {
    const code = encodeCurrentDeck();
    const now = new Date().toISOString();
    const record: SavedDeck = {
      id: `local-${Date.now()}`,
      name: deckName || 'Untitled Deck',
      createdAt: now,
      updatedAt: now,
      heroDbfId: heroDbfId ?? null,
      deckCode: code,
      cards: deck,
    };
    setSavedDecks((prev) => {
      const next = [record, ...prev];
      return next.slice(0, 20);
    });
    setDeckActionMessage({
      tone: 'success',
      message: 'Deck saved locally.',
    });
  }

  function loadSavedDeck(saved: SavedDeck) {
    setDeck(saved.cards);
    setDeckName(saved.name);
    setHeroDbfId(saved.heroDbfId);
    const inferredClass = saved.cards.find((card) => card.cardClass && card.cardClass !== 'NEUTRAL')?.cardClass;
    if (inferredClass) {
      setDeckClass(inferredClass);
    }
    setDeckActionMessage({
      tone: 'success',
      message: `Loaded deck "${saved.name}".`,
    });
  }

  const handleDeckNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDeckName(event.target.value);
  };

  const beginDeckNameEdit = () => {
    deckNameSnapshotRef.current = deckName;
    setIsEditingDeckName(true);
  };

  const handleDeckNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditingDeckName(false);
    } else if (event.key === 'Escape') {
      setDeckName(deckNameSnapshotRef.current);
      setIsEditingDeckName(false);
    }
  };

  const activeFilterChips = useMemo(
    () => {
      const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
      if (q.trim()) {
        chips.push({ key: 'search', label: `Search: "${q.trim()}"`, onClear: () => setQ('') });
      }
      if (game === 'hearthstone') {
        if (klass !== 'ALL') {
          chips.push({ key: 'class', label: `Class: ${formatClassName(klass)}`, onClear: () => setKlass('ALL') });
        }
        if (format !== 'ALL') {
          chips.push({ key: 'format', label: `Format: ${toTitleCase(format)}`, onClear: () => setFormat('ALL') });
        }
        if (ctype !== 'ALL') {
          chips.push({ key: 'type', label: `Type: ${toTitleCase(ctype)}`, onClear: () => setCtype('ALL') });
        }
        if (mana !== 'ALL') {
          chips.push({ key: 'mana', label: `Mana: ${mana}`, onClear: () => setMana('ALL') });
        }
        if (attack !== 'ALL') {
          chips.push({ key: 'attack', label: `Attack: ${attack}`, onClear: () => setAttack('ALL') });
        }
        if (health !== 'ALL') {
          chips.push({ key: 'health', label: `Health: ${health}`, onClear: () => setHealth('ALL') });
        }
        if (rarity !== 'ALL') {
          chips.push({ key: 'rarity', label: `Rarity: ${toTitleCase(rarity)}`, onClear: () => setRarity('ALL') });
        }
        if (mechanic !== FILTER_ALL) {
          chips.push({ key: 'mechanic', label: `Mechanic: ${mechanic}`, onClear: () => setMechanic(FILTER_ALL) });
        }
        if (cardSet !== FILTER_ALL) {
          chips.push({ key: 'set', label: `Set: ${cardSet}`, onClear: () => setCardSet(FILTER_ALL) });
        }
        if (tribe !== FILTER_ALL) {
          chips.push({ key: 'tribe', label: `Tribe: ${tribe}`, onClear: () => setTribe(FILTER_ALL) });
        }
        if (spellSchool !== FILTER_ALL) {
          chips.push({ key: 'school', label: `Spell School: ${spellSchool}`, onClear: () => setSpellSchool(FILTER_ALL) });
        }
        if (!collectibleOnly) {
          chips.push({ key: 'collectible', label: 'Collectible: Off', onClear: () => setCollectibleOnly(true) });
        }
      } else if (game === 'magic') {
        if (format !== 'ALL') {
          chips.push({ key: 'format', label: `Format: ${toTitleCase(format)}`, onClear: () => setFormat('ALL') });
        }
        if (magicColor !== 'ALL') {
          chips.push({ key: 'color', label: `Color: ${toTitleCase(magicColor)}`, onClear: () => setMagicColor('ALL') });
        }
        if (magicType !== 'ALL') {
          chips.push({ key: 'type', label: `Type: ${toTitleCase(magicType)}`, onClear: () => setMagicType('ALL') });
        }
        if (magicRarity !== 'ALL') {
          chips.push({ key: 'rarity', label: `Rarity: ${toTitleCase(magicRarity)}`, onClear: () => setMagicRarity('ALL') });
        }
        if (cmc !== 'ALL') {
          chips.push({ key: 'cmc', label: `CMC: ${cmc}`, onClear: () => setCmc('ALL') });
        }
      }
      return chips;
    },
    [game, attack, cardSet, collectibleOnly, ctype, format, health, klass, mana, mechanic, q, rarity, spellSchool, tribe, magicColor, magicType, magicRarity, cmc],
  );

  const zoomProgress = useMemo(() => {
    const range = 130 - 70;
    return Math.min(Math.max((zoom - 70) / range, 0), 1);
  }, [zoom]);

  return (
    <>
      <div className="relative flex">
      <main className="flex-1 px-4 pb-16 sm:px-6">
        <div
          ref={filterBarRef}
          className="sticky top-[68px] z-20 -mx-4 border-b border-emerald-500/30 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_rgba(12,18,28,0.92))] px-4 py-4 shadow-[0_20px_40px_-30px_rgba(34,197,94,0.6)] backdrop-blur sm:-mx-6 sm:px-6"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl text-white">Arcane Compendium</h1>
              <div className="flex items-center gap-2">
                {hideDeckPanel && (
                  <Link
                    href="/decklytics/editor"
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/20 transition"
                  >
                    <PlusIcon className="size-4" />
                    Build a Deck
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setShowZoomOverlay(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10 md:hidden"
                >
                  Zoom
                  <ChevronUpIcon className={`size-3 transition ${showZoomOverlay ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            <div className="hidden items-end gap-3 md:flex">
              <div className="relative w-full max-w-xs">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/40" />
                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Search cards..."
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 px-10 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              {game === 'hearthstone' ? (
                <>
                  <Filter label="Class" value={klass} onChange={setKlass} options={CLASS_FILTER_OPTIONS} className="min-w-[150px]" />
                  <Filter label="Format" value={format} onChange={setFormat} options={HS_FORMATS} className="min-w-[140px]" />
                  <Filter label="Type" value={ctype} onChange={setCtype} options={HS_TYPES} className="min-w-[140px]" />
                  <Filter label="Mana" value={mana} onChange={setMana} options={MANA} className="min-w-[120px]" />
                </>
              ) : (
                <>
                  <Filter label="Color" value={magicColor} onChange={setMagicColor} options={MAGIC_COLORS} className="min-w-[150px]" />
                  <Filter label="Format" value={format} onChange={setFormat} options={MAGIC_FORMATS} className="min-w-[140px]" />
                  <Filter label="Type" value={magicType} onChange={setMagicType} options={MAGIC_TYPES} className="min-w-[140px]" />
                  <Filter label="CMC" value={cmc} onChange={setCmc} options={CMC} className="min-w-[120px]" />
                </>
              )}
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="inline-flex h-10 items-center gap-2 self-end rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/80 transition hover:bg-white/10"
                aria-label={showAdvancedFilters ? 'Hide advanced filters' : 'Show advanced filters'}
              >
                <FunnelIcon className="size-4" />
                <span>Filters</span>
              </button>
            </div>

            <div className="md:hidden">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/40" />
                  <input
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Search cards..."
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-10 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  <FunnelIcon className="size-4" />
                  Filters
                </button>
              </div>
              {showMobileFilters && (
                <div className="mt-3 space-y-3">
                  {game === 'hearthstone' ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <Filter label="Class" value={klass} onChange={setKlass} options={CLASS_FILTER_OPTIONS} className="w-full" />
                        <Filter label="Format" value={format} onChange={setFormat} options={HS_FORMATS} className="w-full" />
                      </div>
                      <Filter label="Type" value={ctype} onChange={setCtype} options={HS_TYPES} className="w-full" />
                      <div className="grid grid-cols-3 gap-2">
                        <Filter label="Mana" value={mana} onChange={setMana} options={MANA} className="w-full" />
                        <Filter label="Attack" value={attack} onChange={setAttack} options={ATTACK_VALUES} className="w-full" />
                        <Filter label="Health" value={health} onChange={setHealth} options={HEALTH_VALUES} className="w-full" />
                      </div>
                      <Filter label="Mechanic" value={mechanic} onChange={setMechanic} options={mechanicOptions} className="w-full" />
                      <Filter label="Set" value={cardSet} onChange={setCardSet} options={setOptions} className="w-full" />
                      <div className="grid grid-cols-2 gap-2">
                        <Filter label="Spell School" value={spellSchool} onChange={setSpellSchool} options={spellSchoolOptions} className="w-full" />
                        <Filter label="Tribe" value={tribe} onChange={setTribe} options={tribeOptions} className="w-full" />
                      </div>
                      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-emerald-400"
                          checked={collectibleOnly}
                          onChange={(event) => setCollectibleOnly(event.target.checked)}
                        />
                        <span>Collectible</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <Filter label="Color" value={magicColor} onChange={setMagicColor} options={MAGIC_COLORS} className="w-full" />
                        <Filter label="Format" value={format} onChange={setFormat} options={MAGIC_FORMATS} className="w-full" />
                      </div>
                      <Filter label="Type" value={magicType} onChange={setMagicType} options={MAGIC_TYPES} className="w-full" />
                      <Filter label="CMC" value={cmc} onChange={setCmc} options={CMC} className="w-full" />
                      <Filter label="Rarity" value={magicRarity} onChange={setMagicRarity} options={MAGIC_RARITIES} className="w-full" />
                    </>
                  )}
                  <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-emerald-400"
                      checked={myCardsOnly}
                      onChange={(event) => setMyCardsOnly(event.target.checked)}
                    />
                    <span>My Cards</span>
                  </label>
                </div>
              )}
            </div>

            {showAdvancedFilters && (
              <div className="hidden gap-3 border-t border-white/10 pt-3 text-xs text-white/70 md:grid md:grid-cols-3">
                {game === 'hearthstone' ? (
                  <>
                    <Filter label="Rarity" value={rarity} onChange={setRarity} options={HS_RARITIES} className="flex-col items-start w-full" />
                    <Filter label="Attack" value={attack} onChange={setAttack} options={ATTACK_VALUES} className="flex-col items-start w-full" />
                    <Filter label="Health" value={health} onChange={setHealth} options={HEALTH_VALUES} className="flex-col items-start w-full" />
                    <Filter label="Mechanic" value={mechanic} onChange={setMechanic} options={mechanicOptions} className="flex-col items-start w-full" />
                    <Filter label="Set" value={cardSet} onChange={setCardSet} options={setOptions} className="flex-col items-start w-full" />
                    <Filter label="Tribe" value={tribe} onChange={setTribe} options={tribeOptions} className="flex-col items-start w-full" />
                    <Filter label="Spell School" value={spellSchool} onChange={setSpellSchool} options={spellSchoolOptions} className="flex-col items-start w-full" />
                    <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-emerald-400"
                        checked={collectibleOnly}
                        onChange={(event) => setCollectibleOnly(event.target.checked)}
                      />
                      <span>Collectible</span>
                    </label>
                  </>
                ) : (
                  <>
                    <Filter label="Rarity" value={magicRarity} onChange={setMagicRarity} options={MAGIC_RARITIES} className="flex-col items-start w-full" />
                    <Filter label="Color" value={magicColor} onChange={setMagicColor} options={MAGIC_COLORS} className="flex-col items-start w-full" />
                    <Filter label="Type" value={magicType} onChange={setMagicType} options={MAGIC_TYPES} className="flex-col items-start w-full" />
                    <Filter label="CMC" value={cmc} onChange={setCmc} options={CMC} className="flex-col items-start w-full" />
                  </>
                )}
                <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-400"
                    checked={myCardsOnly}
                    onChange={(event) => setMyCardsOnly(event.target.checked)}
                  />
                  <span>My Cards</span>
                </label>
              </div>
            )}
          </div>
        </div>
        <header className="mx-auto flex max-w-7xl flex-col gap-3 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {activeFilterChips.length > 0 ? (
                activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onClear}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-900/50 px-3 py-1 text-xs text-emerald-100 transition hover:border-emerald-300/60 hover:bg-emerald-800/60"
                  >
                    {chip.label}
                    <XMarkIcon className="size-3" />
                  </button>
                ))
              ) : (
                <span className="text-xs text-white/40">No filters applied</span>
              )}
              {activeFilterChips.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 text-xs text-white/60 md:flex-row md:items-center md:gap-4">
              <span className="whitespace-nowrap">Total cards: {filteredCards.length}</span>
              <div className="hidden items-center gap-2 md:flex">
                <span>Zoom</span>
                <input
                  type="range"
                  min={70}
                  max={130}
                  step={5}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="h-1 w-36 appearance-none rounded-full bg-white/20 accent-emerald-400"
                />
                <span>{zoom}%</span>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto flex max-w-7xl flex-col gap-4">
          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-100">
              <ExclamationTriangleIcon className="size-5" />
              <span>{error}</span>
            </div>
          ) : loading ? (
            <div className="rounded-xl border border-white/5 bg-black/40 p-6 text-white/60">
              {loadingCount > 0 ? `Loading ${loadingCount.toLocaleString()} cards…` : 'Loading cards…'}
            </div>
          ) : (
            <div
              ref={listParentRef}
              className={`relative h-[calc(100vh-280px)] overflow-y-auto rounded-xl border border-white/10 bg-transparent ${
                libraryDropActive
                  ? 'ring-2 ring-rose-400 ring-opacity-40'
                  : ''
              }`}
              onDragEnter={handleLibraryDragEnter}
              onDragLeave={handleLibraryDragLeave}
              onDragOver={handleLibraryDragOver}
              onDrop={handleLibraryDrop}
            >
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const startIndex = virtualRow.index * columnCount;
                  const endIndex = Math.min(
                    startIndex + columnCount,
                    filteredCards.length,
                  );
                  const slice = filteredCards.slice(startIndex, endIndex);
                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div
                        className="grid gap-4"
                        style={{
                          gridTemplateColumns: `repeat(${columnCount}, minmax(0,1fr))`,
                        }}
                      >
                        {slice.map((card) => (
                          <div
                            key={card.id}
                            role="button"
                            tabIndex={0}
                            draggable
                            onDragStart={(event) => handleLibraryCardDragStart(event, card)}
                            onDragEnd={resetDragState}
                            onMouseEnter={(event) => handleHoverCard(event, card.id, 'library')}
                            onMouseLeave={() => setHoverCard(null)}
                            onClick={() => openCardModal(card.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') openCardModal(card.id);
                            }}
                            className="group relative cursor-pointer overflow-visible transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                addToDeck(card);
                              }}
                              className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-emerald-500/90 p-1 text-black shadow hover:bg-emerald-300"
                              title="Add to deck"
                            >
                              <PlusIcon className="size-4" />
                            </button>
                            {(() => {
                              const imgSrc = cardImg(card.id, card);
                              return imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt={card.name}
                                  className="w-full"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-white/40">
                                  No image
                                </div>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredCards.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
                  No cards match your current filters.
                </div>
              )}
            </div>
          )}
        </section>

        {!mobileDeckOpen && (
          <div
            className={`pointer-events-auto fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between rounded-2xl border border-white/10 bg-black/85 px-4 py-3 text-sm text-white shadow-xl md:hidden ${
              deckDropActive ? 'border-emerald-400/60 ring-2 ring-emerald-400/30' : ''
            }`}
            onDragEnter={handleDeckDragEnter}
            onDragLeave={handleDeckDragLeave}
            onDragOver={handleDeckDragOver}
            onDrop={handleDeckDrop}
          >
            <div>
              <button
                type="button"
                onClick={() => {
                  setMobileDeckOpen(true);
                  setTimeout(() => {
                    beginDeckNameEdit();
                  }, 0);
                }}
                className="font-semibold text-left"
              >
                {deckName || 'Untitled Deck'}
              </button>
              <div className={`text-xs ${deckCountValid ? 'text-white/60' : 'text-rose-300'}`}>
                {deckCount}/{MAX_DECK_CARDS}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileDeckOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
            >
              Open deck <ChevronUpIcon className="size-4" />
            </button>
          </div>
        )}

        {mobileDeckOpen && (
          <div className="fixed inset-0 z-40 flex flex-col bg-[#040810] text-white md:hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileDeckOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
              >
                <ChevronDownIcon className="size-4" /> Minimize
              </button>
              <button
                type="button"
                onClick={beginDeckNameEdit}
                className="text-sm font-semibold text-white hover:text-emerald-200"
              >
                {deckName || 'Untitled Deck'}
              </button>
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  deckCountValid
                    ? 'bg-emerald-500 text-black'
                    : 'border border-rose-500/40 bg-rose-500/20 text-rose-200'
                }`}
              >
                {deckCount}/{MAX_DECK_CARDS}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!hideDeckPanel && renderDeckPanel('mobile')}
            </div>
          </div>
        )}

        {showZoomOverlay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8"
            onClick={() => setShowZoomOverlay(false)}
          >
            <div
              className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-emerald-400/40 bg-[#07101f]/95 px-6 py-8 text-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowZoomOverlay(false)}
                className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
                aria-label="Close zoom overlay"
              >
                <XMarkIcon className="size-4" />
              </button>
              <h3 className="font-display text-lg">Adjust Zoom</h3>
              <p className="text-center text-xs text-white/60">
                Drag the glyph to change how large cards appear in the library.
              </p>
              <div className="flex w-full items-center justify-center gap-6">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Small</span>
                <div className="relative h-64 w-10">
                  <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-white/20" />
                  <div
                    className="pointer-events-none absolute left-1/2 h-full w-[3px] -translate-x-1/2 bg-gradient-to-b from-emerald-300/60 to-transparent"
                  />
                  <span
                    className="absolute -left-[18px] flex h-7 w-7 items-center justify-center text-emerald-200"
                    style={{ bottom: `${zoomProgress * 100}%` }}
                  >
                    ▲
                  </span>
                  <input
                    type="range"
                    min={70}
                    max={130}
                    step={5}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    aria-label="Zoom level"
                    className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
                    style={{ writingMode: 'vertical-lr' } as React.CSSProperties}
                  />
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Large</span>
              </div>
              <div className="text-sm text-white/70">Current zoom: {zoom}%</div>
              <button
                type="button"
                onClick={() => setShowZoomOverlay(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>

      {!hideDeckPanel && (
        <aside className="sticky top-0 hidden h-[100dvh] w-96 shrink-0 border-l border-white/10 bg-zinc-950 p-4 text-white lg:flex lg:flex-col">
          {renderDeckPanel('desktop')}
        </aside>
      )}
      </div>

      {showCompactFilters && (
        <div className="fixed left-0 right-0 top-[68px] z-30 px-4 md:hidden">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-400/30 bg-[#09121f]/95 px-3 py-2 text-sm text-white shadow-lg backdrop-blur">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search cards..."
                className="w-full rounded-lg border border-white/10 bg-zinc-900 px-8 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMobileFilters(true);
                const top = filterBarRef.current?.offsetTop ?? 0;
                window.scrollTo({ top: top - 80, behavior: 'smooth' });
              }}
              className="relative inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
              aria-label="Open filters"
            >
              <FunnelIcon className="size-5" />
              {activeFilterChips.length > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-semibold text-black">
                  {activeFilterChips.length}
                </span>
              )}
            </button>
            <span className="whitespace-nowrap text-xs text-white/70">{filteredCards.length} cards</span>
          </div>
        </div>
      )}

      {previewCardInfo && previewPositionStyle && previewCardInfo.image && (
        <img
          src={previewCardInfo.image}
          alt={previewCardInfo.name}
          className="pointer-events-none fixed z-40 w-64 max-w-full"
          style={previewPositionStyle}
        />
      )}

      {selectedCardInfo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-6 py-10">
          <div className="relative flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-950 p-8 text-white shadow-2xl lg:flex-row">
            <button
              type="button"
              onClick={closeCardModal}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
            >
              <XMarkIcon className="size-5" />
            </button>
            <div className="flex justify-center lg:flex-1">
              {selectedCardInfo.image ? (
                <img
                  src={selectedCardInfo.image}
                  alt={selectedCardInfo.name}
                  className="w-64 max-w-full rounded-2xl border border-white/10 shadow-lg"
                />
              ) : (
                <div className="flex h-96 w-64 items-center justify-center rounded-2xl border border-white/10 bg-zinc-800 text-white/40">
                  No image available
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-display text-2xl text-white">{selectedCardInfo.name}</h3>
                <p className="mt-1 text-sm text-white/60">
                  Cost {selectedCardInfo.cost} • {selectedCardInfo.type ? selectedCardInfo.type.toLowerCase() : '—'} • {formatClassName(selectedCardInfo.cardClass)}
                </p>
                {selectedCardInfo.set && (
                  <p className="text-xs text-white/50">Set: {selectedCardInfo.set}</p>
                )}
              </div>
              <div
                className="text-sm leading-relaxed text-white/70"
                dangerouslySetInnerHTML={{
                  __html:
                    selectedCardInfo.htmlText || '<span class="text-white/40">No rules text available.</span>',
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cardData = cardLookup.get(selectedCardInfo.id);
                    if (cardData) addToDeck(cardData);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
                >
                  <PlusIcon className="size-4" /> Add to deck
                </button>
                <button
                  type="button"
                  onClick={() => removeFromDeck(selectedCardInfo.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  Remove copy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeCardModal();
                    setShowExportModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  <ShareIcon className="size-4" /> Share deck
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setShowImportModal(false);
                setImportPasteValue('');
              }}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
            >
              <XMarkIcon className="size-5" />
            </button>
            <h3 className="font-display text-xl">Import Deck</h3>
            <p className="mt-1 text-sm text-white/60">Load a deck from your saved decks, paste a code, or import from meta.</p>
            
            <div className="mt-4 flex gap-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setImportTab('saved')}
                className={`px-3 py-2 text-sm transition ${
                  importTab === 'saved'
                    ? 'border-b-2 border-emerald-400 text-emerald-200'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Saved Decks
              </button>
              <button
                type="button"
                onClick={() => setImportTab('paste')}
                className={`px-3 py-2 text-sm transition ${
                  importTab === 'paste'
                    ? 'border-b-2 border-emerald-400 text-emerald-200'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Paste Code
              </button>
              <button
                type="button"
                onClick={() => setImportTab('meta')}
                className={`px-3 py-2 text-sm transition ${
                  importTab === 'meta'
                    ? 'border-b-2 border-emerald-400 text-emerald-200'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Meta Deck
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {importTab === 'saved' && (
                <div className="space-y-2">
                  {savedDecks.length > 0 ? (
                    savedDecks.map((saved) => (
                      <button
                        key={saved.id}
                        type="button"
                        onClick={() => {
                          loadSavedDeck(saved);
                          setShowImportModal(false);
                          setImportPasteValue('');
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10"
                      >
                        <div className="font-medium">{saved.name}</div>
                        <div className="mt-1 text-xs text-white/60">
                          {saved.cards.length} cards • {new Date(saved.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-black/40 p-6 text-center text-sm text-white/60">
                      No saved decks yet. Save a deck to import it here.
                    </div>
                  )}
                </div>
              )}

              {importTab === 'paste' && (
                <div className="space-y-3">
                  <textarea
                    value={importPasteValue}
                    onChange={(e) => setImportPasteValue(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                    placeholder="Paste deck code or JSON here..."
                  />
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        ref={importRef}
                        type="file"
                        accept="application/json"
                        hidden
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            importDeckFromFile(file);
                            setShowImportModal(false);
                            setImportPasteValue('');
                          }
                          if (importRef.current) importRef.current.value = '';
                        }}
                      />
                      <div className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                        <ArrowUpTrayIcon className="size-4" /> Upload JSON
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (importPasteValue.trim()) {
                          // Try as deck code first, then JSON
                          if (importPasteValue.trim().startsWith('{')) {
                            try {
                              const parsed = JSON.parse(importPasteValue);
                              if (parsed && Array.isArray(parsed.cards)) {
                                setDeck(parsed.cards);
                                if (parsed.name) setDeckName(parsed.name);
                                if (typeof parsed.heroDbfId === 'number') {
                                  setHeroDbfId(parsed.heroDbfId);
                                }
                                setDeckActionMessage({
                                  tone: 'success',
                                  message: 'Deck imported from JSON.',
                                });
                              } else {
                                await importDeckFromCode(importPasteValue);
                              }
                            } catch {
                              await importDeckFromCode(importPasteValue);
                            }
                          } else {
                            await importDeckFromCode(importPasteValue);
                          }
                          setShowImportModal(false);
                          setImportPasteValue('');
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20"
                    >
                      Import
                    </button>
                  </div>
                </div>
              )}

              {importTab === 'meta' && (
                <div className="space-y-2">
                  {metaLoading ? (
                    <div className="rounded-lg border border-white/10 bg-black/40 p-6 text-center text-sm text-white/60">
                      Loading meta decks...
                    </div>
                  ) : metaError ? (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-6 text-center text-sm text-rose-200">
                      {metaError}
                    </div>
                  ) : metaDecks.length > 0 ? (
                    metaDecks.map((meta) => (
                      <button
                        key={meta.id}
                        type="button"
                        onClick={async () => {
                          if (meta.deckCode) {
                            await importDeckFromCode(meta.deckCode);
                            if (meta.name) setDeckName(meta.name);
                            if (meta.heroDbfId) setHeroDbfId(meta.heroDbfId);
                            if (meta.className && typeof meta.className === 'string') {
                              setDeckClass(meta.className.toUpperCase());
                            }
                            setShowImportModal(false);
                            setImportPasteValue('');
                          }
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10"
                      >
                        <div className="font-medium">{meta.name}</div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
                          {meta.className && typeof meta.className === 'string' ? <span>{formatClassName(meta.className.toUpperCase())}</span> : null}
                          {meta.winRate !== null && meta.winRate !== undefined ? <span>{meta.winRate.toFixed(1)}% WR</span> : null}
                          {meta.popularity !== null && meta.popularity !== undefined ? <span>{meta.popularity.toFixed(1)}% meta</span> : null}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-black/40 p-6 text-center text-sm text-white/60">
                      No meta decks available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
            >
              <XMarkIcon className="size-5" />
            </button>
            <h3 className="font-display text-xl">Export Deck</h3>
            <p className="mt-1 text-sm text-white/60">Save, share, or analyze your deck.</p>
            <div className="mt-4 grid gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  saveCurrentDeck();
                  setShowExportModal(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <ArrowDownTrayIcon className="size-4" /> Save to My Decks
              </button>
              <button
                type="button"
                onClick={async () => {
                  const code = encodeCurrentDeck();
                  if (code) {
                    setDeckCodeInput(code);
                    await copyDeckCode();
                    setShowExportModal(false);
                  } else {
                    setDeckActionMessage({
                      tone: 'error',
                      message: 'Add cards before generating a deck code.',
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <ClipboardDocumentCheckIcon className="size-4" /> Generate a Deck Code
              </button>
              <button
                type="button"
                onClick={async () => {
                  await copyShareLink();
                  setShowExportModal(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <ShareIcon className="size-4" /> Share deck to social media
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const code = encodeCurrentDeck();
                    if (code) {
                      router.push(`/playlytics?deck=${encodeURIComponent(code)}`);
                      setShowExportModal(false);
                    } else {
                      setDeckActionMessage({
                        tone: 'error',
                        message: 'Add cards before playtesting.',
                      });
                    }
                  } catch (error) {
                    console.error('Error navigating to playlytics:', error);
                    setDeckActionMessage({
                      tone: 'error',
                      message: 'Failed to navigate to playtest.',
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <ArrowUpTrayIcon className="size-4" /> Playtest this deck
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const code = encodeCurrentDeck();
                    if (code) {
                      router.push(`/analyzer?deck=${encodeURIComponent(code)}`);
                      setShowExportModal(false);
                    } else {
                      setDeckActionMessage({
                        tone: 'error',
                        message: 'Add cards before analyzing.',
                      });
                    }
                  } catch (error) {
                    console.error('Error navigating to analyzer:', error);
                    setDeckActionMessage({
                      tone: 'error',
                      message: 'Failed to navigate to analyzer.',
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <MagnifyingGlassIcon className="size-4" /> Get a deck Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
            >
              <XMarkIcon className="size-5" />
            </button>
            <h3 className="font-display text-xl">Share this deck</h3>
            <p className="mt-1 text-sm text-white/60">Quick actions for exporting or sharing your current list.</p>
            <div className="mt-4 grid gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  exportDeck();
                  setShowShareModal(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <ArrowDownTrayIcon className="size-4" /> Export as JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  copyDeckCode();
                  setShowShareModal(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <ClipboardDocumentIcon className="size-4" /> Generate & copy deck code
              </button>
              <button
                type="button"
                onClick={() => {
                  copyShareLink();
                  setShowShareModal(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <LinkIcon className="size-4" /> Copy link to deck
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type FilterProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly T[] | T[];
  className?: string;
};

function Filter<T extends string>({ label, value, onChange, options, className = '' }: FilterProps<T>) {
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <span className="text-xs font-medium text-white/60">{label}</span>
      <Listbox value={value} onChange={onChange}>
        <div className="relative w-full">
          <Listbox.Button className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
            <span className="truncate text-left">{value}</span>
            <ChevronDownIcon className="size-4 text-white/50" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-white/10 bg-zinc-900 p-1 text-sm text-white shadow-lg">
            {options.map((option, index) => (
              <Listbox.Option
                key={`${label}-${option}-${index}`}
                value={option}
                className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10"
              >
                {option}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
