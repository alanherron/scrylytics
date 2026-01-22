'use client';

import { useMemo } from 'react';
import RadialArchetypeChart from '@/components/RadialArchetypeChart';
import { CLASS_COLOR_MAP, TOPDECKS_META } from '@/data/meta/topdecks';

const palette = ['#fb7185', '#f97316', '#facc15', '#34d399', '#22d3ee', '#38bdf8', '#60a5fa', '#a855f7', '#f472b6', '#fbbf24'];

export default function RadialChartStandalone() {
  const { radialData, archetypeOrder, colorMap } = useMemo(() => {
    const aggregation = TOPDECKS_META.decks.reduce<{
      classes: Record<string, { total: number; breakdown: Record<string, number> }>;
      archetypes: Record<string, number>;
    }>((acc, deck) => {
      const className = deck.class || 'Unknown';
      const archetype = deck.archetype?.trim() ? deck.archetype.trim() : 'Unspecified';

      if (!acc.classes[className]) {
        acc.classes[className] = { total: 0, breakdown: {} };
      }

      acc.classes[className].total += 1;
      acc.classes[className].breakdown[archetype] = (acc.classes[className].breakdown[archetype] || 0) + 1;
      acc.archetypes[archetype] = (acc.archetypes[archetype] || 0) + 1;
      return acc;
    }, { classes: {}, archetypes: {} });

    const archetypeOrder = Object.entries(aggregation.archetypes)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    if (!archetypeOrder.length) {
      archetypeOrder.push('Unspecified');
    }

    const colorMap = archetypeOrder.reduce<Record<string, string>>((map, archetype, index) => {
      map[archetype] = palette[index % palette.length];
      return map;
    }, {});

    const radialData = Object.entries(aggregation.classes)
      .map(([label, bucket]) => {
        const total = bucket.total;
        const globalPercent = TOPDECKS_META.totalDecks === 0 ? 0 : (total / TOPDECKS_META.totalDecks) * 100;

        const segments = archetypeOrder
          .filter((archetype) => bucket.breakdown[archetype])
          .map((archetype) => ({
            label: archetype,
            count: bucket.breakdown[archetype],
            percent: total === 0 ? 0 : (bucket.breakdown[archetype] / total) * 100,
            color: colorMap[archetype],
          }));

        return {
          name: label,
          label,
          color: CLASS_COLOR_MAP[label] ?? '#f8fafc',
          total,
          globalPercent,
          segments,
        };
      })
      .sort((a, b) => b.total - a.total);

    return { radialData, archetypeOrder, colorMap } as const;
  }, []);

  return (
    <div className="w-full max-w-5xl min-w-0">
      <RadialArchetypeChart data={radialData} archetypeKeys={archetypeOrder} colorMap={colorMap} />
    </div>
  );
}
