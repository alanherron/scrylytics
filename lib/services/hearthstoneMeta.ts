import fs from 'node:fs/promises';
import path from 'node:path';
import { decode as decodeDeck } from 'deckstrings';

type DeckstringsDecodeResult = ReturnType<typeof decodeDeck>;

type CardSummary = {
  id: string;
  dbfId: number;
  name: string;
  manaCost: number | null;
  type: string | null;
  class: string | null;
  rarity: string | null;
  set: string | null;
  image: string | null;
};

type CachedCardIndex = Record<string, CardSummary>;

type ArchetypeHistoryEntry = {
  id?: number | string;
  name: string;
  winRate: number | null;
  popularity: number | null;
  deckCodes: string[];
};

type FormatHistoryEntry = {
  timestamp: string;
  archetypes: ArchetypeHistoryEntry[];
};

type CachedMetaEntry = {
  updatedAt: string | null;
  latest?: NormalizedArchetype[];
  history: FormatHistoryEntry[];
  params: MetaRequestOptions & { hsReplayUrl: string };
  lastError?: string;
};

type CacheFile = {
  version: number;
  cards: {
    locale: string;
    updatedAt: string | null;
    data: CachedCardIndex;
  };
  meta: Record<string, CachedMetaEntry>;
};

type MetaRequestOptions = {
  format?: string;
  region?: string;
  timeRange?: string;
  rankRange?: string;
  locale?: string;
};

export type NormalizedCard = CardSummary & { count: number };

export type NormalizedArchetype = {
  id?: number | string;
  name: string;
  class?: string | null;
  winRate: number | null;
  popularity: number | null;
  deckCodes: string[];
  sampleSize: number | null;
  totalGames: number | null;
  cardBreakdown: NormalizedCard[];
  heroDbfIds: number[];
  trend: {
    winRateDelta: number | null;
    popularityDelta: number | null;
  };
  sources: {
    archetypeId?: number | string;
    hsReplayUrl: string;
  };
};

type MetaResponse = {
  format: string;
  region: string;
  rankRange: string;
  timeRange: string;
  locale: string;
  lastUpdated: string | null;
  refreshed: boolean;
  archetypes: NormalizedArchetype[];
  history: FormatHistoryEntry[];
  sources: {
    hsReplay: {
      url: string;
      error?: string;
    };
    hearthstoneJson: {
      url: string;
      updatedAt: string | null;
    };
  };
};

type RawHsReplayArchetype = Record<string, unknown>;

type NormalizedHsReplayArchetype = {
  id?: number | string;
  name: string;
  playerClass?: string | null;
  winRate: number | null;
  popularity: number | null;
  deckCodes: string[];
  cardEntries: Array<{ dbfId: number; count: number }>;
  sampleSize: number | null;
  totalGames: number | null;
  heroes: number[];
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const HISTORY_LIMIT = 14;
const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'cache', 'hearthstone-meta.json');
const CACHE_VERSION = 1;
const DEFAULT_LOCALE = 'enUS';
const DEFAULT_TIME_RANGE = 'LAST_7_DAYS';
const DEFAULT_RANK_RANGE = 'ALL';
const DEFAULT_REGION = 'ALL';
const DEFAULT_FORMAT = 'standard';

const DEFAULT_HSREPLAY_URL = 'https://hsreplay.net/analytics/query/list_decks_by_win_rate/';
const DEFAULT_CARDS_URL_TEMPLATE = 'https://api.hearthstonejson.com/v1/latest/{locale}/cards.json';
const DEFAULT_CARD_ART_ROOT = 'https://art.hearthstonejson.com/v1/render/latest/{locale}/512x';

const HSREPLAY_SOURCE_URL = process.env.HSREPLAY_META_URL ?? DEFAULT_HSREPLAY_URL;
const HEARTHSTONE_JSON_URL_TEMPLATE = process.env.HEARTHSTONE_JSON_URL ?? DEFAULT_CARDS_URL_TEMPLATE;
const HEARTHSTONE_ART_ROOT = process.env.HEARTHSTONE_ART_ROOT ?? DEFAULT_CARD_ART_ROOT;
const HSREPLAY_SAMPLE_DIR =
  process.env.HSREPLAY_SAMPLE_DIR ?? path.join(process.cwd(), 'data', 'samples');

const hsFormatMap: Record<string, string> = {
  standard: 'RANKED_STANDARD',
  wild: 'RANKED_WILD',
  twist: 'RANKED_TWIST',
  classic: 'RANKED_CLASSIC',
  duels: 'PVPDR_FORMAT',
};

function resolveCardsUrl(locale: string) {
  return HEARTHSTONE_JSON_URL_TEMPLATE.replace('{locale}', locale);
}

function resolveCardArtUrl(locale: string, cardId: string) {
  const base = HEARTHSTONE_ART_ROOT.replace('{locale}', locale);
  return `${base}/${cardId}.png`;
}

function isStale(updatedAt: string | null | undefined, ttlMs: number) {
  if (!updatedAt) return true;
  const updatedValue = new Date(updatedAt).valueOf();
  if (Number.isNaN(updatedValue)) return true;
  return Date.now() - updatedValue > ttlMs;
}

async function ensureCacheFile(): Promise<CacheFile> {
  try {
    const raw = await fs.readFile(CACHE_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as CacheFile;
    if (parsed.version !== CACHE_VERSION) {
      return createEmptyCache();
    }
    return parsed;
  } catch (error) {
    return createEmptyCache();
  }
}

function createEmptyCache(): CacheFile {
  return {
    version: CACHE_VERSION,
    cards: {
      locale: DEFAULT_LOCALE,
      updatedAt: null,
      data: {},
    },
    meta: {},
  };
}

async function persistCache(cache: CacheFile) {
  const dir = path.dirname(CACHE_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'scrylytics-meta-fetcher/1.0 (+https://scrylytics.app)',
      accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function ensureCardIndex(cache: CacheFile, locale: string): Promise<CachedCardIndex> {
  if (
    cache.cards.locale === locale &&
    cache.cards.data &&
    !isStale(cache.cards.updatedAt, CACHE_TTL_MS)
  ) {
    return cache.cards.data;
  }

  const cardsUrl = resolveCardsUrl(locale);
  const cards = await fetchJson<any[]>(cardsUrl);
  const index: CachedCardIndex = {};

  for (const card of cards) {
    if (!card || typeof card !== 'object') continue;
    const dbfId = card.dbfId ?? card.dbf_id;
    const id = card.id ?? card.cardId;
    const name = card.name;

    if (!dbfId || !id || !name) continue;

    const manaCost = typeof card.cost === 'number' ? card.cost : null;
    const type = typeof card.type === 'string' ? card.type : null;
    const cardClass = typeof card.cardClass === 'string' ? card.cardClass : null;
    const rarity = typeof card.rarity === 'string' ? card.rarity : null;
    const set = typeof card.set === 'string' ? card.set : null;

    let image: string | null = null;
    if (typeof card.battlegroundsImage === 'string') {
      image = card.battlegroundsImage;
    } else if (typeof card.battlegroundsHeroPortrait === 'string') {
      image = card.battlegroundsHeroPortrait;
    } else if (typeof card.img === 'string') {
      image = card.img;
    } else if (typeof card.tile === 'string') {
      image = card.tile;
    } else {
      image = resolveCardArtUrl(locale, id);
    }

    index[String(dbfId)] = {
      id,
      dbfId,
      name,
      manaCost,
      type,
      class: cardClass,
      rarity,
      set,
      image,
    };
  }

  cache.cards = {
    locale,
    updatedAt: new Date().toISOString(),
    data: index,
  };

  await persistCache(cache);

  return index;
}

function normalisePercentage(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : (value as number);
  if (!Number.isFinite(numeric)) return null;
  const scaled = numeric > 1 ? numeric : numeric * 100;
  return Number(scaled.toFixed(2));
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const val of values) {
    if (typeof val !== 'string' || !val) continue;
    if (seen.has(val)) continue;
    seen.add(val);
    result.push(val);
  }
  return result;
}

function parseCardsArray(cards: unknown): Array<{ dbfId: number; count: number }> {
  if (!Array.isArray(cards)) return [];
  const parsed: Array<{ dbfId: number; count: number }> = [];

  for (const entry of cards) {
    if (Array.isArray(entry)) {
      const [dbfIdRaw, countRaw] = entry;
      const dbfId = typeof dbfIdRaw === 'number' ? dbfIdRaw : Number(dbfIdRaw);
      const count = typeof countRaw === 'number' ? countRaw : Number(countRaw);
      if (Number.isFinite(dbfId) && Number.isFinite(count)) {
        parsed.push({ dbfId, count });
      }
      continue;
    }

    if (entry && typeof entry === 'object') {
      const obj = entry as Record<string, unknown>;
      const dbfId =
        typeof obj.dbfId === 'number'
          ? obj.dbfId
          : typeof obj.dbf_id === 'number'
            ? obj.dbf_id
            : Number(obj.id ?? obj.card_id);
      const count =
        typeof obj.count === 'number'
          ? obj.count
          : typeof obj.quantity === 'number'
            ? obj.quantity
            : typeof obj.num === 'number'
              ? obj.num
              : Number(obj.count);

      if (Number.isFinite(dbfId) && Number.isFinite(count)) {
        parsed.push({ dbfId, count });
      }
    }
  }

  return parsed;
}

function buildHsReplayUrl(options: Required<MetaRequestOptions>) {
  const params = new URLSearchParams();
  const formatCode = hsFormatMap[options.format] ?? options.format.toUpperCase();

  params.set('GameType', formatCode);
  params.set('Region', options.region);
  params.set('RankRange', options.rankRange);
  params.set('TimeRange', options.timeRange);
  params.set('format', 'json');

  return `${HSREPLAY_SOURCE_URL}?${params.toString()}`;
}

function extractArchetypeCandidates(raw: unknown): RawHsReplayArchetype[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((entry): entry is RawHsReplayArchetype => typeof entry === 'object' && entry !== null);
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.archetypes)) {
      return extractArchetypeCandidates(obj.archetypes);
    }
    if (Array.isArray(obj.data)) {
      return extractArchetypeCandidates(obj.data);
    }
    if (obj.series && typeof obj.series === 'object') {
      const series = obj.series as Record<string, unknown>;
      if (Array.isArray(series.data)) {
        return extractArchetypeCandidates(series.data);
      }
    }
  }

  return [];
}

function normaliseArchetypeCandidate(candidate: RawHsReplayArchetype): NormalizedHsReplayArchetype | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const c = candidate as Record<string, unknown>;

  const id =
    (typeof c.id === 'number' || typeof c.id === 'string') ? c.id :
    (typeof c.archetype_id === 'number' || typeof c.archetype_id === 'string') ? c.archetype_id :
    (typeof c.deck_id === 'number' || typeof c.deck_id === 'string') ? c.deck_id :
    undefined;

  const nameRaw = c.name ?? c.archetype ?? c.archetype_name ?? c.deck_name ?? c.label;
  const name = typeof nameRaw === 'string' && nameRaw.length > 0 ? nameRaw : undefined;
  if (!name) return null;

  const playerClass =
    typeof c.player_class === 'string'
      ? c.player_class
      : typeof c.class === 'string'
        ? c.class
        : typeof c.hero_class === 'string'
          ? c.hero_class
          : null;

  const deckCodes = uniqueStrings([
    ...(Array.isArray(c.deckCodes) ? (c.deckCodes as unknown[]) : []),
    ...(Array.isArray(c.deck_codes) ? (c.deck_codes as unknown[]) : []),
    ...(Array.isArray(c.deckstrings) ? (c.deckstrings as unknown[]) : []),
    ...(Array.isArray(c.deckStrings) ? (c.deckStrings as unknown[]) : []),
    typeof c.deck_code === 'string' ? c.deck_code : undefined,
    typeof c.deckString === 'string' ? c.deckString : undefined,
    typeof c.best_deck === 'string' ? (c.best_deck as string) : undefined,
  ]);

  const cardsFromEntry = parseCardsArray(c.cards ?? c.card_list ?? c.card_data);

  const sampleSize =
    typeof c.sample_size === 'number'
      ? c.sample_size
      : typeof c.total_games === 'number'
        ? c.total_games
        : typeof c.games === 'number'
          ? c.games
          : typeof c.game_count === 'number'
            ? c.game_count
            : null;

  const totalGames =
    typeof c.total_games === 'number'
      ? c.total_games
      : typeof c.games_played === 'number'
        ? c.games_played
        : sampleSize;

  const heroesRaw = c.heroes ?? c.hero_dbf_ids ?? c.hero_ids;
  const heroes: number[] = Array.isArray(heroesRaw)
    ? heroesRaw
        .map((hero) => {
          if (typeof hero === 'number') return hero;
          if (typeof hero === 'string') {
            const parsed = Number.parseInt(hero, 10);
            return Number.isFinite(parsed) ? parsed : null;
          }
          return null;
        })
        .filter((hero): hero is number => hero !== null)
    : [];

  const winRate = normalisePercentage(c.win_rate ?? c.winrate ?? c.winRate ?? c.win_percentage ?? c.win);
  const popularity = normalisePercentage(
    c.popularity ?? c.popularity_rate ?? c.frequency ?? c.play_rate ?? c.playrate ?? c.pick_rate,
  );

  return {
    id,
    name,
    playerClass,
    winRate,
    popularity,
    deckCodes,
    cardEntries: cardsFromEntry,
    sampleSize,
    totalGames,
    heroes,
  };
}

function decodeDeckToCards(deckCode: string): { cards: Array<{ dbfId: number; count: number }>; heroes: number[] } | null {
  try {
    const decoded: DeckstringsDecodeResult = decodeDeck(deckCode);
    const cards = Array.isArray(decoded.cards)
      ? decoded.cards.map(([dbfId, count]) => ({ dbfId, count }))
      : [];
    const heroes = Array.isArray(decoded.heroes) ? decoded.heroes : [];
    return { cards, heroes };
  } catch (error) {
    return null;
  }
}

function enrichArchetypeWithCards(
  candidate: NormalizedHsReplayArchetype,
  cardIndex: CachedCardIndex,
  hsReplayUrl: string,
): NormalizedArchetype {
  let cardEntries = candidate.cardEntries;
  let heroDbfIds = candidate.heroes;

  if ((!cardEntries || cardEntries.length === 0 || !heroDbfIds.length) && candidate.deckCodes.length > 0) {
    const decoded = decodeDeckToCards(candidate.deckCodes[0]);
    if (decoded) {
      if (!cardEntries || cardEntries.length === 0) {
        cardEntries = decoded.cards;
      }
      if (!heroDbfIds.length) {
        heroDbfIds = decoded.heroes;
      }
    }
  }

  const cardBreakdown: NormalizedCard[] = [];
  for (const entry of cardEntries) {
    const card = cardIndex[String(entry.dbfId)];
    if (!card) continue;
    cardBreakdown.push({
      ...card,
      count: entry.count,
    });
  }

  return {
    id: candidate.id,
    name: candidate.name,
    class: candidate.playerClass ?? (heroDbfIds.length ? inferClassFromHero(heroDbfIds[0], cardIndex) : null),
    winRate: candidate.winRate,
    popularity: candidate.popularity,
    deckCodes: candidate.deckCodes,
    sampleSize: candidate.sampleSize ?? candidate.totalGames ?? null,
    totalGames: candidate.totalGames ?? candidate.sampleSize ?? null,
    cardBreakdown,
    heroDbfIds,
    trend: {
      winRateDelta: null,
      popularityDelta: null,
    },
    sources: {
      archetypeId: candidate.id,
      hsReplayUrl,
    },
  };
}

function inferClassFromHero(heroDbfId: number, cardIndex: CachedCardIndex) {
  const heroCard = cardIndex[String(heroDbfId)];
  return heroCard?.class ?? null;
}

function applyTrendData(archetypes: NormalizedArchetype[], previous?: ArchetypeHistoryEntry[]) {
  if (!previous || previous.length === 0) return archetypes;

  const previousMap = new Map<string, ArchetypeHistoryEntry>();
  for (const entry of previous) {
    const key = entry.id ? String(entry.id) : entry.name.toLowerCase();
    previousMap.set(key, entry);
  }

  return archetypes.map((archetype) => {
    const key = archetype.id ? String(archetype.id) : archetype.name.toLowerCase();
    const prior = previousMap.get(key);
    if (!prior) return archetype;

    const winRateDelta =
      archetype.winRate !== null && prior.winRate !== null
        ? Number((archetype.winRate - prior.winRate).toFixed(2))
        : null;
    const popularityDelta =
      archetype.popularity !== null && prior.popularity !== null
        ? Number((archetype.popularity - prior.popularity).toFixed(2))
        : null;

    return {
      ...archetype,
      trend: {
        winRateDelta,
        popularityDelta,
      },
    };
  });
}

function buildHistorySummary(archetypes: NormalizedArchetype[]): ArchetypeHistoryEntry[] {
  return archetypes.map((archetype) => ({
    id: archetype.id,
    name: archetype.name,
    winRate: archetype.winRate,
    popularity: archetype.popularity,
    deckCodes: archetype.deckCodes,
  }));
}

async function fetchHsReplayMeta(options: Required<MetaRequestOptions>) {
  const hsReplayUrl = buildHsReplayUrl(options);
  const payload = await fetchJson<Record<string, unknown>>(hsReplayUrl);
  const candidates = extractArchetypeCandidates(payload);
  if (candidates.length === 0) {
    const msg =
      typeof payload?.msg === 'string'
        ? payload.msg
        : 'HSReplay response did not contain archetype data';
    throw new Error(msg);
  }

  return {
    url: hsReplayUrl,
    candidates,
  };
}

async function loadSampleMeta(format: string) {
  const filePath = path.join(HSREPLAY_SAMPLE_DIR, `hsreplay-${format}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const payload = JSON.parse(raw) as Record<string, unknown>;
    const candidates = extractArchetypeCandidates(payload);
    if (!candidates.length) return null;
    const updatedAt =
      typeof payload.updated_at === 'string'
        ? payload.updated_at
        : typeof payload.last_updated === 'string'
          ? payload.last_updated
          : new Date().toISOString();
    return {
      url: `file://${filePath}`,
      updatedAt,
      candidates,
    };
  } catch (error) {
    return null;
  }
}

export async function getHearthstoneMeta(options: MetaRequestOptions = {}): Promise<MetaResponse> {
  const resolved: Required<MetaRequestOptions> = {
    format: (options.format ?? DEFAULT_FORMAT).toLowerCase(),
    region: options.region ?? DEFAULT_REGION,
    rankRange: options.rankRange ?? DEFAULT_RANK_RANGE,
    timeRange: options.timeRange ?? DEFAULT_TIME_RANGE,
    locale: options.locale ?? DEFAULT_LOCALE,
  };

  const cache = await ensureCacheFile();
  const cardIndex = await ensureCardIndex(cache, resolved.locale);
  const formatKey = [
    resolved.format,
    resolved.region,
    resolved.rankRange,
    resolved.timeRange,
    resolved.locale,
  ].join(':');

  let entry = cache.meta[formatKey];
  let refreshed = false;
  let fetchError: string | undefined;

  const needsRefresh = !entry || isStale(entry.updatedAt, CACHE_TTL_MS);

  if (!entry) {
    entry = {
      updatedAt: null,
      latest: [],
      history: [],
      params: { ...resolved, hsReplayUrl: HSREPLAY_SOURCE_URL },
    };
    cache.meta[formatKey] = entry;
  }

  if (needsRefresh) {
    try {
      const { url, candidates } = await fetchHsReplayMeta(resolved);
      const normalizedCandidates = candidates
        .map(normaliseArchetypeCandidate)
        .filter((value): value is NormalizedHsReplayArchetype => value !== null);

      const archetypes = normalizedCandidates.map((candidate) =>
        enrichArchetypeWithCards(candidate, cardIndex, url),
      );

      const previousSummary = entry.history[0]?.archetypes;
      const archetypesWithTrend = applyTrendData(archetypes, previousSummary);

      const timestamp = new Date().toISOString();
      entry.updatedAt = timestamp;
      entry.latest = archetypesWithTrend;
      entry.params = { ...resolved, hsReplayUrl: url };
      entry.lastError = undefined;

      entry.history = [
        {
          timestamp,
          archetypes: buildHistorySummary(archetypesWithTrend),
        },
        ...entry.history,
      ].slice(0, HISTORY_LIMIT);

      refreshed = true;
      await persistCache(cache);
    } catch (error) {
      fetchError = error instanceof Error ? error.message : 'Unknown HSReplay fetch error';
      entry.lastError = fetchError;

      const sample = await loadSampleMeta(resolved.format);

      if (sample) {
        const normalizedCandidates = sample.candidates
          .map(normaliseArchetypeCandidate)
          .filter((value): value is NormalizedHsReplayArchetype => value !== null);

        const archetypes = normalizedCandidates.map((candidate) =>
          enrichArchetypeWithCards(candidate, cardIndex, sample.url),
        );

        const previousSummary = entry.history[0]?.archetypes;
        const archetypesWithTrend = applyTrendData(archetypes, previousSummary);

        const timestamp = sample.updatedAt;
        entry.updatedAt = timestamp;
        entry.latest = archetypesWithTrend;
        entry.params = { ...resolved, hsReplayUrl: sample.url };

        entry.history = [
          {
            timestamp,
            archetypes: buildHistorySummary(archetypesWithTrend),
          },
          ...entry.history,
        ].slice(0, HISTORY_LIMIT);

        refreshed = true;
        await persistCache(cache);
      } else if (!entry.updatedAt || !entry.latest || entry.latest.length === 0) {
        throw new Error(fetchError);
      }

      await persistCache(cache);
    }
  } else if (!entry.latest) {
    entry.latest = [];
  }

  const archetypes =
    entry.latest && entry.history.length > 1
      ? applyTrendData(entry.latest, entry.history[1]?.archetypes)
      : entry.latest ?? [];

  const cardsUrl = resolveCardsUrl(resolved.locale);

  return {
    format: resolved.format,
    region: resolved.region,
    rankRange: resolved.rankRange,
    timeRange: resolved.timeRange,
    locale: resolved.locale,
    lastUpdated: entry.updatedAt,
    refreshed,
    archetypes,
    history: entry.history,
    sources: {
      hsReplay: {
        url: entry.params.hsReplayUrl,
        error: fetchError ?? entry.lastError,
      },
      hearthstoneJson: {
        url: cardsUrl,
        updatedAt: cache.cards.updatedAt,
      },
    },
  };
}

export const __testing__ = {
  createEmptyCache,
  normalisePercentage,
  parseCardsArray,
  normaliseArchetypeCandidate,
  enrichArchetypeWithCards,
  applyTrendData,
};
