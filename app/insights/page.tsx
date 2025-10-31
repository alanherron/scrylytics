'use client';

import React, { useMemo, useState } from 'react';
import { PREBUILT_DECKS, analyzeDeck } from '../../lib/ai/insightEngine';
import InsightChart from '../../components/InsightChart';

// Helper function to determine chart type from issue
const getChartType = (issue: string) => {
  switch (issue) {
    case "MANA_CURVE_SKEW":
      return "bar";
    case "DRAW_INCONSISTENCY":
      return "line";
    case "ROLE_MISMATCH":
      return "radar";
    case "WEAK_SYNERGY_CHAINS":
      return "area";
    case "TECH_GAPS":
      return "bar";
    case "MATCHUP_PAINS":
      return "radar";
    case "HAND_SIZE_PRESSURE":
      return "line";
    case "BOARD_TEMPO_GAPS":
      return "area";
    default:
      return "bar";
  }
};

export default function InsightsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const result = useMemo(() => {
    const deck = PREBUILT_DECKS[selectedIndex];
    if (!deck) return null;

    try {
      const analysis = analyzeDeck(deck);
      return analysis;
    } catch (error) {
      return { error: 'Analysis failed', issue: 'ERROR', data: [], caption: 'Failed to analyze deck' };
    }
  }, [selectedIndex]);

  return (
    <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"1200px", margin:"0 auto"}}>
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
        ✅ REACT IS WORKING - Build #44 - RECHARTS v3.3.0 + STYLING UPGRADE! 🎨📊
      </div>

      <header style={{marginBottom:"2rem"}}>
        <h1>AI Insights (Charts)</h1>
        <p>Pick a deck to see analysis and charts</p>
      </header>

          <div style={{marginBottom:"2rem"}}>
            <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"500"}}>
              Select Deck to See Different Chart Types:
            </label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
              style={{
                width:"100%",
                padding:"0.5rem",
                borderRadius:"4px",
                border:"1px solid #ccc",
                fontSize:"1rem",
                backgroundColor: "#fefefe",
                border: "2px solid #8b5cf6"
              }}
            >
              {PREBUILT_DECKS.map((d, i) => (
                <option key={d.name} value={i}>
                  {d.name} - {d.chartType} Chart
                </option>
              ))}
            </select>
            <div style={{
              marginTop: "0.5rem",
              fontSize: "0.9rem",
              color: "#6b7280",
              fontStyle: "italic"
            }}>
              💡 Try different decks to see Bar, Line, Radar, and Area chart variations!
            </div>
          </div>


      {result && (
        <div style={{marginTop:"2rem", padding:"2rem", backgroundColor:"#f9fafb", borderRadius:"8px", border:"1px solid #e5e7eb"}}>
          <h3>Analysis Results</h3>
          <p><strong>Issue:</strong> {result.issue}</p>
          <p><strong>Grade:</strong> {(result as any).grade || 'N/A'}</p>
          <p><strong>Score:</strong> {(result as any).score || 'N/A'}/10</p>
          <p><strong>Caption:</strong> {result.caption}</p>

          {(result as any).strengths && (
            <div style={{marginTop:"1rem"}}>
              <h4>✅ Strengths</h4>
              <ul>
                {(result as any).strengths.map((strength: string, i: number) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {(result as any).weaknesses && (
            <div style={{marginTop:"1rem"}}>
              <h4>⚠️ Weaknesses</h4>
              <ul>
                {(result as any).weaknesses.map((weakness: string, i: number) => (
                  <li key={i}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

          {result && result.issue !== 'ERROR' && (
            <div style={{marginTop:"2rem"}}>
              <div style={{
                backgroundColor: "#fef7ed",
                border: "3px solid #d97706",
                borderRadius: "12px",
                padding: "2rem",
                margin: "2rem 0",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#fef7ed",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "20px",
                  border: "2px solid #d97706",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "#92400e"
                }}>
                  📊 {result.issue.replace(/_/g, ' ')} Analysis
                </div>

                <InsightChart
                  issue={result.issue as any}
                  data={result.data || []}
                />

                <div style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb"
                }}>
                  <p style={{
                    color: "#6b7280",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    margin: 0
                  }}>
                    <strong>Analysis:</strong> {result.caption}
                  </p>
                </div>

                {/* Debug Panel */}
                <details style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: "8px"
                }}>
                  <summary style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#92400e"
                  }}>
                    🔍 Debug: Chart Data & Requirements Check
                  </summary>
                  <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Chart Type:</strong> {getChartType(result.issue)} Chart
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Issue Type:</strong> {result.issue}
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Data Length:</strong> {Array.isArray(result.data) ? result.data.length : 'Not an array'}
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Data Sample:</strong>
                      <pre style={{
                        backgroundColor: "#f9fafb",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        overflow: "auto",
                        maxHeight: "200px"
                      }}>
                        {JSON.stringify(result.data?.slice(0, 3), null, 2)}
                      </pre>
                    </div>

                    {(() => {
                      const chartType = getChartType(result.issue);
                      const data = result.data;

                      switch (chartType) {
                        case 'bar':
                          return (
                            <div>
                              <strong>Bar Chart Requirements:</strong>
                              <ul>
                                <li>Data is array: {Array.isArray(data) ? '✅' : '❌'}</li>
                                <li>Each item has 'mana': {Array.isArray(data) && data.every(item => 'mana' in item) ? '✅' : '❌'}</li>
                                <li>Each item has 'count': {Array.isArray(data) && data.every(item => 'count' in item) ? '✅' : '❌'}</li>
                                <li>Data length &gt; 0: {Array.isArray(data) && data.length > 0 ? '✅' : '❌'}</li>
                              </ul>
                            </div>
                          );

                        case 'line':
                          return (
                            <div>
                              <strong>Line Chart Requirements:</strong>
                              <ul>
                                <li>Data is array: {Array.isArray(data) ? '✅' : '❌'}</li>
                                <li>Each item has 'mana': {Array.isArray(data) && data.every(item => 'mana' in item) ? '✅' : '❌'}</li>
                                <li>Each item has 'count': {Array.isArray(data) && data.every(item => 'count' in item) ? '✅' : '❌'}</li>
                                <li>Data length &gt; 0: {Array.isArray(data) && data.length > 0 ? '✅' : '❌'}</li>
                              </ul>
                            </div>
                          );

                        case 'radar':
                          return (
                            <div>
                              <strong>Radar Chart Requirements:</strong>
                              <ul>
                                <li>Data is array: {Array.isArray(data) ? '✅' : '❌'}</li>
                                <li>Each item has 'role' or 'subject': {Array.isArray(data) && data.every(item => 'role' in item || 'subject' in item) ? '✅' : '❌'}</li>
                                <li>Each item has 'value': {Array.isArray(data) && data.every(item => 'value' in item) ? '✅' : '❌'}</li>
                                <li>Data length &gt; 0: {Array.isArray(data) && data.length > 0 ? '✅' : '❌'}</li>
                              </ul>
                            </div>
                          );

                        case 'area':
                          return (
                            <div>
                              <strong>Area Chart Requirements:</strong>
                              <ul>
                                <li>Data is array: {Array.isArray(data) ? '✅' : '❌'}</li>
                                <li>Each item has 'mana': {Array.isArray(data) && data.every(item => 'mana' in item) ? '✅' : '❌'}</li>
                                <li>Each item has 'count': {Array.isArray(data) && data.every(item => 'count' in item) ? '✅' : '❌'}</li>
                                <li>Data length &gt; 0: {Array.isArray(data) && data.length > 0 ? '✅' : '❌'}</li>
                              </ul>
                            </div>
                          );

                        default:
                          return <div>Unknown chart type</div>;
                      }
                    })()}
                  </div>
                </details>
              </div>
            </div>
          )}
    </div>
  );
}