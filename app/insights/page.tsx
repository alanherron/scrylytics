"use client";

import React, { useMemo, useState } from "react";
import InsightChart from "@/components/InsightChart";
import { PREBUILT_DECKS, analyzeDeck } from "@/lib/ai/insightEngine";

export default function InsightsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const deck = PREBUILT_DECKS[selectedIndex];

  const result = useMemo(() => {
    console.log('🎲 Insights: Analyzing deck:', { name: deck.name, archetype: deck.archetype });
    const analysis = analyzeDeck(deck);
    console.log('📊 Insights analysis result:', {
      issue: analysis.issue,
      dataLength: analysis.data?.length,
      dataType: typeof analysis.data,
      dataSample: analysis.data?.slice(0, 3),
      title: analysis.title,
      caption: analysis.caption
    });
    return analysis;
  }, [deck]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* SUPER VISIBLE DEBUG BANNER */}
      <div style={{
        backgroundColor: "#ff0000",
        color: "#ffffff",
        padding: "1rem",
        borderRadius: "8px",
        border: "4px solid #000000",
        fontSize: "1.2rem",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "1rem"
      }}>
        🚨 DEBUG MODE ACTIVE 🚨<br />
        Build #12 - Enhanced Chart Debugging
      </div>

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

      <div>
        <div style={{
          padding: "0.5rem",
          backgroundColor: "#e0f2fe",
          border: "1px solid #0ea5e9",
          borderRadius: "4px",
          marginBottom: "1rem",
          fontSize: "0.8rem",
          color: "#0c4a6e"
        }}>
          🔍 Debug: Rendering chart for issue "{result.issue}" with {result.data?.length || 0} data points
        </div>
        <InsightChart
          issue={result.issue}
          data={result.data}
          caption={result.caption}
          title={result.title}
        />
      </div>

      <section className="text-sm opacity-80">
        <p>
          The AI engine picked <strong>{result.issue}</strong> based on deck patterns,
          then generated chart data + a recommendation. Swap decks to see different issues and chart types.
        </p>
      </section>
    </div>
  );
}
