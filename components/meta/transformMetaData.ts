import type { ArchetypeStats } from './types';

export interface MetaDrillDownData {
  class: string;
  popularityPct: number;
  winRatePct: number;
  popularityDelta: number;
  winRateDelta: number;
  sampleSize: number;
  archetypes: Array<{
    name: string;
    popularityPct: number;
    winRatePct: number;
    popularityDelta: number;
    winRateDelta: number;
    sampleSize: number;
  }>;
}

/**
 * Transform archetype stats into drill-down chart data format
 * Includes weekly trend calculations (mock data for now, can be replaced with real historical data)
 */
export function transformToDrillDownData(
  stats: ArchetypeStats[],
  totalDecks: number,
): MetaDrillDownData[] {
  // Group by class
  const classMap = new Map<string, ArchetypeStats[]>();
  
  stats.forEach((stat) => {
    const className = stat.class || 'Unknown';
    if (!classMap.has(className)) {
      classMap.set(className, []);
    }
    classMap.get(className)!.push(stat);
  });

  const result: MetaDrillDownData[] = [];

  classMap.forEach((archetypes, className) => {
    // Calculate class-level aggregates
    const totalClassPopularity = archetypes.reduce((sum, arch) => sum + arch.popularityPct, 0);
    const weightedWinRate = archetypes.reduce(
      (sum, arch) => sum + arch.winRatePct * arch.popularityPct,
      0,
    ) / (totalClassPopularity || 1);
    
    // Estimate sample size based on popularity (mock calculation)
    const estimatedGames = Math.round((totalClassPopularity / 100) * totalDecks * 50);
    
    // Generate mock weekly trends (in real implementation, compare current vs previous week)
    // For now, use a hash-based approach to create consistent "trends"
    const classHash = className.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const popularityDelta = ((classHash % 200) - 100) / 10; // -10% to +10%
    const winRateDelta = ((classHash % 40) - 20) / 10; // -2% to +2%

    // Transform archetypes
    const archetypeData = archetypes.map((arch) => {
      const archHash = arch.archetype.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const archPopularityDelta = ((archHash % 200) - 100) / 10;
      const archWinRateDelta = ((archHash % 40) - 20) / 10;
      const archSampleSize = Math.round((arch.popularityPct / 100) * totalDecks * 50);

      return {
        name: arch.archetype,
        popularityPct: arch.popularityPct,
        winRatePct: arch.winRatePct,
        popularityDelta: archPopularityDelta,
        winRateDelta: archWinRateDelta,
        sampleSize: archSampleSize,
      };
    });

    result.push({
      class: className,
      popularityPct: totalClassPopularity,
      winRatePct: Number(weightedWinRate.toFixed(1)),
      popularityDelta: Number(popularityDelta.toFixed(2)),
      winRateDelta: Number(winRateDelta.toFixed(1)),
      sampleSize: estimatedGames,
      archetypes: archetypeData.sort((a, b) => b.popularityPct - a.popularityPct),
    });
  });

  // Sort by popularity descending
  return result.sort((a, b) => b.popularityPct - a.popularityPct);
}






