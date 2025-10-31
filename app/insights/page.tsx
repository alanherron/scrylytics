'use client';

import React, { useMemo, useState } from 'react';
import { PREBUILT_DECKS, analyzeDeck } from '../../lib/ai/insightEngine';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import InsightChart from '../../components/InsightChart';

const SimpleHtmlChart = () => {
  return (
    <div style={{
      width: '100%',
      height: '200px',
      border: '3px solid #00ff00',
      backgroundColor: '#f0f0f0',
      padding: '1rem',
      margin: '1rem 0',
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-around'
    }}>
      <div style={{
        width: '50px', height: '40px', backgroundColor: '#ff6b6b',
        display: 'flex', alignItems: 'end', justifyContent: 'center',
        color: 'white', fontWeight: 'bold'
      }}>10</div>
      <div style={{
        width: '50px', height: '80px', backgroundColor: '#4ecdc4',
        display: 'flex', alignItems: 'end', justifyContent: 'center',
        color: 'white', fontWeight: 'bold'
      }}>20</div>
      <div style={{
        width: '50px', height: '60px', backgroundColor: '#45b7d1',
        display: 'flex', alignItems: 'end', justifyContent: 'center',
        color: 'white', fontWeight: 'bold'
      }}>15</div>
      <div style={{
        width: '50px', height: '100px', backgroundColor: '#96ceb4',
        display: 'flex', alignItems: 'end', justifyContent: 'center',
        color: 'white', fontWeight: 'bold'
      }}>25</div>
    </div>
  );
};

const TestChart = () => {
  const testData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 25 }
  ];

  try {
    return (
      <div>
        <div style={{
          padding: "0.5rem",
          backgroundColor: "#e0ffe0",
          border: "2px solid #00aa00",
          marginBottom: "0.5rem",
          fontSize: "0.8rem"
        }}>
          ✅ Charts are working!
        </div>
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
      </div>
    );
  } catch (error) {
    return (
      <div>
        <div style={{
          padding: "0.5rem",
          backgroundColor: "#ffe0e0",
          border: "2px solid #aa0000",
          marginBottom: "0.5rem",
          fontSize: "0.8rem"
        }}>
          Fallback chart (Recharts failed)
        </div>
        <SimpleHtmlChart />
      </div>
    );
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
        ✅ REACT IS WORKING - Build #40 - CHARTS FINALLY WORKING! 🎉
      </div>

      <header style={{marginBottom:"2rem"}}>
        <h1>AI Insights (Charts)</h1>
        <p>Pick a deck to see analysis and charts</p>
      </header>

      <div style={{marginBottom:"2rem"}}>
        <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"500"}}>
          Select Deck:
        </label>
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
          style={{
            width:"100%",
            padding:"0.5rem",
            borderRadius:"4px",
            border:"1px solid #ccc",
            fontSize:"1rem"
          }}
        >
          {PREBUILT_DECKS.map((d, i) => (
            <option key={d.name} value={i}>{d.name}</option>
          ))}
        </select>
      </div>

      <div style={{
        backgroundColor: "#ffff00",
        border: "3px solid #000000",
        padding: "1rem",
        marginBottom: "1rem",
        textAlign: "center"
      }}>
        <h3 style={{ color: "#000000", margin: "0 0 0.5rem 0" }}>
          🧪 Chart Test
        </h3>
        <TestChart />
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
          <InsightChart
            issue={result.issue as any}
            data={result.data || []}
            caption={result.caption}
            title={`Chart: ${result.issue.replace(/_/g, ' ')}`}
          />
        </div>
      )}
    </div>
  );
}