"use client";

import React, { useMemo, useState } from "react";
import InsightChart from "@/components/InsightChart";
import { PREBUILT_DECKS, analyzeDeck } from "@/lib/ai/insightEngine";

export default function InsightsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const deck = PREBUILT_DECKS[selectedIndex];

  const result = useMemo(() => analyzeDeck(deck), [deck]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">AI Insights (Parchment Charts)</h1>
        <p className="text-sm opacity-80">
          Pick a prebuilt deck to see an automatically chosen chart and a plain-English recommendation.
        </p>
      </header>

      <div className="flex items-center gap-3">
        <label htmlFor="deck" className="text-sm font-medium">Deck</label>
        <select
          id="deck"
          className="border rounded-md px-3 py-2"
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
        >
          {PREBUILT_DECKS.map((d, i) => (
            <option key={d.name} value={i}>{d.name} — {d.archetype}</option>
          ))}
        </select>
      </div>

      <InsightChart
        issue={result.issue}
        data={result.data}
        caption={result.caption}
        title={result.title}
      />

      <section className="text-sm opacity-80">
        <p>
          The AI engine picked <strong>{result.issue}</strong> based on deck patterns,
          then generated chart data + a recommendation. Swap decks to see different issues and chart types.
        </p>
      </section>
    </div>
  );
}
