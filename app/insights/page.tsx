"use client";

import React, { useMemo, useState } from "react";
import InsightChart from "@/components/InsightChart";
import { PREBUILT_DECKS, analyzeDeck } from "@/lib/ai/insightEngine";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// Simple test chart component
const TestChart = () => {
  const testData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 25 }
  ];

  console.log('🧪 TestChart: Attempting to render simple chart');
  console.log('🧪 TestChart: Recharts available?', typeof BarChart);
  console.log('🧪 TestChart: Data:', testData);

  try {
    return (
      <div style={{ width: '100%', height: '200px', border: '2px solid #000', margin: '1rem 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={testData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('🧪 TestChart: FAILED to render', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <div style={{
        padding: "1rem",
        backgroundColor: "#ffcccc",
        border: "2px solid #ff0000",
        borderRadius: "4px",
        margin: "1rem 0"
      }}>
        <strong>❌ Test Chart Failed:</strong> {errorMessage}
        <br />
        <small>Recharts may not be loading properly</small>
      </div>
    );
  }
};

export default function InsightsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rechartsStatus, setRechartsStatus] = useState('checking');
  const [pageLoaded, setPageLoaded] = useState(false);

  // Cache busting - force reload if chunks are outdated
  React.useEffect(() => {
    const currentTime = Date.now();
    const lastLoadTime = localStorage.getItem('insightsPageLoadTime');

    if (!lastLoadTime || (currentTime - parseInt(lastLoadTime)) > 300000) { // 5 minutes
      console.log('🔄 Cache busting: First load or old cache detected');
      localStorage.setItem('insightsPageLoadTime', currentTime.toString());
    }

    // Check if we need to reload due to chunk mismatch
    const checkChunks = () => {
      const scripts = document.querySelectorAll('script[src*="/_next/static/chunks/app/insights/"]');
      if (scripts.length === 0) {
        console.warn('⚠️ No insights chunks found, page may need reload');
      }
    };

    setTimeout(checkChunks, 1000);
  }, []);

  // Check if Recharts is available
  React.useEffect(() => {
    console.log('🔍 Checking Recharts availability...');

    try {
      // Check if recharts is loaded
      if (typeof BarChart !== 'undefined') {
        console.log('✅ Recharts is available in browser');
        setRechartsStatus('available');
      } else {
        console.error('❌ Recharts BarChart is undefined');
        setRechartsStatus('missing');
      }
    } catch (error) {
      console.error('❌ Error checking Recharts:', error);
      setRechartsStatus('error');
    }

    // Also check window object
    setTimeout(() => {
      console.log('🔍 Window recharts check:', typeof window !== 'undefined' ? 'window available' : 'no window');
      setPageLoaded(true);
    }, 100);
  }, []);

  const deck = PREBUILT_DECKS[selectedIndex];

  const result = useMemo(() => {
    if (!pageLoaded) {
      console.log('⏳ Page not loaded yet, skipping analysis');
      return null;
    }

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
  }, [deck, pageLoaded]);

  // Basic error boundary
  try {
    console.log('🔍 InsightsPage: Starting render');

    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* BASIC TEST - If you see this, React is working */}
        <div style={{
          backgroundColor: "#00ff00",
          color: "#000000",
          padding: "1rem",
          borderRadius: "8px",
          border: "2px solid #000000",
          fontSize: "1rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "1rem"
        }}>
          ✅ REACT IS WORKING - Page loaded successfully
        </div>

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
          Build #19 - Cache Busting Added
          <br />
          <button
            onClick={() => {
              // Clear localStorage to force fresh load
              localStorage.removeItem('insightsPageLoadTime');
              // Force hard reload
              window.location.href = window.location.href;
            }}
            style={{
              backgroundColor: "#ffffff",
              color: "#ff0000",
              border: "2px solid #000000",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "0.5rem"
            }}
          >
            🔄 Hard Reload (Fix Cache Issues)
          </button>
        </div>

      {/* RECHARTS STATUS */}
      <div style={{
        backgroundColor: rechartsStatus === 'available' ? "#ccffcc" : "#ffcccc",
        border: "2px solid #000000",
        padding: "0.5rem",
        marginBottom: "1rem",
        textAlign: "center",
        fontWeight: "bold"
      }}>
        📊 Recharts Status: {rechartsStatus.toUpperCase()}
        {rechartsStatus === 'available' && " ✅"}
        {rechartsStatus === 'missing' && " ❌"}
        {rechartsStatus === 'error' && " 💥"}
        {rechartsStatus === 'checking' && " 🔄"}
      </div>

      {/* CHART TEST SECTION */}
      <div style={{
        backgroundColor: "#ffff00",
        border: "3px solid #000000",
        padding: "1rem",
        marginBottom: "1rem",
        textAlign: "center"
      }}>
        <h3 style={{ color: "#000000", fontSize: "1.1rem", margin: "0 0 0.5rem 0" }}>
          🧪 CHART TEST: Simple Bar Chart
        </h3>
        <TestChart />
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">AI Insights (Parchment Charts)</h1>
        <p className="text-sm opacity-80">
          Pick a prebuilt deck to see an automatically chosen chart and a plain-English recommendation.
        </p>
      </header>

      {!result && (
        <div style={{
          backgroundColor: "#ffff00",
          border: "2px solid #000000",
          padding: "1rem",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "1rem"
        }}>
          <strong>⏳ LOADING...</strong> Waiting for page to initialize
        </div>
      )}

      {result && (
        <>
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
        </>
      )}
    </div>
  );
  } catch (error) {
    console.error('💥 InsightsPage: CRASHED during render', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <div style={{
        padding: "2rem",
        backgroundColor: "#ff0000",
        color: "#ffffff",
        minHeight: "100vh",
        textAlign: "center"
      }}>
        <h1>🚨 PAGE CRASH DETECTED 🚨</h1>
        <p style={{ fontSize: "1.2rem", margin: "1rem 0" }}>
          The insights page crashed during rendering
        </p>
        <div style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          padding: "1rem",
          borderRadius: "8px",
          margin: "1rem auto",
          maxWidth: "600px",
          textAlign: "left"
        }}>
          <strong>Error:</strong> {errorMessage}
          <br />
          <small>Check browser console (F12) for full error details</small>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <a
            href="/"
            style={{
              backgroundColor: "#ffffff",
              color: "#ff0000",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }
}
