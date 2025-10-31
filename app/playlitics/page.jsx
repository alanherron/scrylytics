'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Playlitics() {
  const [deck1, setDeck1] = useState('');
  const [deck2, setDeck2] = useState('');
  const [gameType, setGameType] = useState('hearthstone');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeMatchup = async () => {
    if (!deck1.trim() || !deck2.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/matchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck1: deck1.trim(), deck2: deck2.trim(), gameType })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Matchup analysis failed:', error);
      setAnalysis({ error: 'Failed to analyze matchup. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"1400px", margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:"2rem"}}>
        <Link href="/" style={{color:"#4f46e5", textDecoration:"none", marginBottom:"1rem", display:"inline-block"}}>
          ← Back to Home
        </Link>
        <h1>⚔️ Playlitics - Matchup Analysis</h1>
        <p>Analyze deck matchups and predict win probabilities using advanced simulation algorithms.</p>
      </div>

      {/* Game Selection */}
      <div style={{marginBottom:"2rem"}}>
        <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"500"}}>
          Select Game:
        </label>
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          style={{
            padding:"0.5rem",
            border:"1px solid #d1d5db",
            borderRadius:"4px",
            fontSize:"1rem",
            backgroundColor:"white"
          }}
        >
          <option value="hearthstone">🃏 Hearthstone</option>
          <option value="magic">🎴 Magic: The Gathering</option>
        </select>
      </div>

      {/* Deck Input Grid */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(400px, 1fr))",
        gap:"2rem",
        marginBottom:"2rem"
      }}>
        {/* Deck 1 Input */}
        <div>
          <h3 style={{marginTop:0, color:"#1f2937"}}>Deck 1</h3>
          <textarea
            value={deck1}
            onChange={(e) => setDeck1(e.target.value)}
            placeholder={
              gameType === 'hearthstone'
                ? "AAEBAf0EBMABoAHCAe0DqwTLBMsEzATNBM8EzgTOBM8E0ATQBNEE0gTRBNIE1ATVBNYE1wTXBNgE2ATZBNkE2gTaBNsE2wTcBN0E3gTfBOAE4AThBOIE4gTjBOQE5ATmBOYE5gTnBOgE6ATqBOoE6gTrBOwE7ATuBO4E7gTvBO8E8ATxBPQE9AT2BPYE9gT3BPgE+AT5BPkE+QT6BP4GCg=="
                : "1 Island\n1 Plains\n1 Counterspell\n1 Wrath of God\n\n20 cards remaining..."
            }
            style={{
              width:"100%",
              minHeight:"300px",
              padding:"1rem",
              border:"1px solid #d1d5db",
              borderRadius:"8px",
              fontFamily:"monospace",
              fontSize:"0.9rem",
              resize:"vertical"
            }}
          />
        </div>

        {/* Deck 2 Input */}
        <div>
          <h3 style={{marginTop:0, color:"#1f2937"}}>Deck 2</h3>
          <textarea
            value={deck2}
            onChange={(e) => setDeck2(e.target.value)}
            placeholder={
              gameType === 'hearthstone'
                ? "AAEBAf0EBMABoAHCAe0DqwTLBMsEzATNBM8EzgTOBM8E0ATQBNEE0gTRBNIE1ATVBNYE1wTXBNgE2ATZBNkE2gTaBNsE2wTcBN0E3gTfBOAE4AThBOIE4gTjBOQE5ATmBOYE5gTnBOgE6ATqBOoE6gTrBOwE7ATuBO4E7gTvBO8E8ATxBPQE9AT2BPYE9gT3BPgE+AT5BPkE+QT6BP4GCg=="
                : "1 Forest\n1 Mountain\n1 Lightning Bolt\n1 Giant Growth\n\n20 cards remaining..."
            }
            style={{
              width:"100%",
              minHeight:"300px",
              padding:"1rem",
              border:"1px solid #d1d5db",
              borderRadius:"8px",
              fontFamily:"monospace",
              fontSize:"0.9rem",
              resize:"vertical"
            }}
          />
        </div>
      </div>

      {/* Analyze Button */}
      <div style={{textAlign:"center", marginBottom:"2rem"}}>
        <button
          onClick={analyzeMatchup}
          disabled={loading || !deck1.trim() || !deck2.trim()}
          style={{
            backgroundColor: loading ? "#9ca3af" : "#4f46e5",
            color:"white",
            border:"none",
            padding:"1rem 3rem",
            borderRadius:"8px",
            fontSize:"1.1rem",
            fontWeight:"600",
            cursor: loading || !deck1.trim() || !deck2.trim() ? "not-allowed" : "pointer",
            transition:"background-color 0.2s"
          }}
        >
          {loading ? "🔄 Analyzing Matchup..." : "⚔️ Analyze Matchup"}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div style={{
          border:"1px solid #e5e7eb",
          borderRadius:"12px",
          padding:"2rem",
          backgroundColor: analysis.error ? "#fef2f2" : "#f8fafc",
          marginTop:"2rem"
        }}>
          {analysis.error ? (
            <div>
              <h3 style={{color:"#dc2626", marginTop:0}}>❌ Analysis Error</h3>
              <p>{analysis.error}</p>
            </div>
          ) : (
            <div>
              <h3 style={{marginTop:0, textAlign:"center"}}>🏆 Matchup Analysis Results</h3>

              {/* Win Probability */}
              <div style={{textAlign:"center", marginBottom:"2rem"}}>
                <div style={{
                  fontSize:"3rem",
                  fontWeight:"bold",
                  color: analysis.winProbability > 60 ? "#16a34a" :
                         analysis.winProbability < 40 ? "#dc2626" : "#ca8a04",
                  marginBottom:"0.5rem"
                }}>
                  {analysis.winProbability}% - {analysis.winProbability > 50 ? '50%' : '50%'}
                </div>
                <div style={{fontSize:"1.2rem", color:"#6b7280"}}>
                  Deck 1 Win Probability
                </div>
                {analysis.confidence > 0 && (
                  <div style={{fontSize:"0.9rem", color:"#6b7280", marginTop:"0.5rem"}}>
                    Confidence: {analysis.confidence.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Prediction */}
              <div style={{textAlign:"center", marginBottom:"2rem", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
                <div style={{fontSize:"1.5rem", fontWeight:"600", marginBottom:"0.5rem"}}>
                  {analysis.winner === 'deck1' ? '🏆 Deck 1 Wins' :
                   analysis.winner === 'deck2' ? '🏆 Deck 2 Wins' :
                   '🤝 Even Matchup'}
                </div>
                <div style={{color:"#6b7280"}}>
                  {analysis.winner === 'deck1' && `Deck 1 has a ${analysis.winProbability}% chance to win`}
                  {analysis.winner === 'deck2' && `Deck 2 has a ${(100 - analysis.winProbability).toFixed(1)}% chance to win`}
                  {analysis.winner === 'tie' && 'This matchup appears to be very close'}
                </div>
              </div>

              {/* Analysis Factors */}
              <div style={{marginBottom:"2rem"}}>
                <h4>📊 Key Factors</h4>
                <div style={{display:"grid", gap:"1rem"}}>
                  {analysis.factors.map((factor, index) => (
                    <div key={index} style={{
                      padding:"1rem",
                      border:"1px solid #e5e7eb",
                      borderRadius:"8px",
                      backgroundColor:"white"
                    }}>
                      <div style={{fontWeight:"600", marginBottom:"0.5rem"}}>{factor.factor}</div>
                      <div style={{color:"#6b7280", marginBottom:"0.5rem"}}>{factor.description}</div>
                      <div style={{
                        fontSize:"0.9rem",
                        color: factor.impact > 0 ? "#16a34a" : factor.impact < 0 ? "#dc2626" : "#6b7280"
                      }}>
                        Impact: {factor.impact > 0 ? '+' : ''}{factor.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div style={{marginBottom:"2rem"}}>
                <h4>💡 Strategic Recommendations</h4>
                <div style={{backgroundColor:"white", padding:"1.5rem", borderRadius:"8px"}}>
                  <ul style={{margin:0, paddingLeft:"1.5rem"}}>
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} style={{marginBottom:"0.5rem"}}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Analysis */}
              {analysis.detailedAnalysis && Object.keys(analysis.detailedAnalysis).length > 0 && (
                <div>
                  <h4>🔬 Detailed Analysis</h4>
                  <div style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
                    gap:"1rem"
                  }}>
                    {Object.entries(analysis.detailedAnalysis).map(([key, value]) => (
                      <div key={key} style={{
                        padding:"1rem",
                        backgroundColor:"white",
                        borderRadius:"8px",
                        textAlign:"center"
                      }}>
                        <div style={{fontSize:"1.5rem", fontWeight:"600", marginBottom:"0.5rem"}}>
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </div>
                        <div style={{
                          fontSize:"0.9rem",
                          color:"#6b7280",
                          textTransform:"capitalize"
                        }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Version Footer */}
      <footer style={{
        marginTop:"3rem",
        paddingTop:"2rem",
        borderTop:"1px solid #e5e7eb",
        textAlign:"center",
        color:"#6b7280",
        fontSize:"0.9rem"
      }}>
        <div style={{marginBottom:"0.5rem"}}>
          <strong>Scrylytics v1.2.0</strong> • Built 2025-10-31
        </div>
        <div style={{fontSize:"0.8rem"}}>
          AI-powered matchup analysis and prediction
        </div>
      </footer>
    </div>
  );
}
