export type TrendDirection = 'up' | 'down' | 'flat';

export interface ArchetypeStats {
  class: string;
  archetype: string;
  popularityPct: number;
  winRatePct: number;
  trend: TrendDirection;
}

