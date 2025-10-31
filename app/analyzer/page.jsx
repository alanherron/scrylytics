'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Analyzer() {
  const [deckCode, setDeckCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState('hearthstone');

  const analyzeDeck = async () => {
    if (!deckCode.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckCode, gameType })
      });

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: 'Failed to analyze deck. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"1200px", margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:"2rem"}}>
        <Link href="/" style={{color:"#4f46e5", textDecoration:"none", marginBottom:"1rem", display:"inline-block"}}>
          ← Back to Home
        </Link>
        <h1>🧙‍♂️ Decklytics - AI Deck Analyzer</h1>
        <p>Get detailed analysis, synergy ratings, and optimization suggestions for your deck.</p>
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

      {/* Deck Input */}
      <div style={{marginBottom:"2rem"}}>
        <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"500"}}>
          Paste your deck code or list:
        </label>
        <textarea
          value={deckCode}
          onChange={(e) => setDeckCode(e.target.value)}
          placeholder={
            gameType === 'hearthstone'
              ? "AAEBAf0EBMABoAHCAe0DqwTLBMsEzATNBM8EzgTOBM8E0ATQBNEE0gTRBNIE1ATVBNYE1wTXBNgE2ATZBNkE2gTaBNsE2wTcBN0E3gTfBOAE4AThBOIE4gTjBOQE5ATmBOYE5gTnBOgE6ATqBOoE6gTrBOwE7ATuBO4E7gTvBO8E8ATxBPQE9AT2BPYE9gT3BPgE+AT5BPkE+QT6BP4GCg=="
              : "1 Forest\n1 Island\n1 Mountain\n1 Plains\n1 Swamp\n\n1 Sol Ring\n1 Lightning Bolt\n1 Counterspell\n\n20 cards remaining..."
          }
          style={{
            width:"100%",
            minHeight:"200px",
            padding:"1rem",
            border:"1px solid #d1d5db",
            borderRadius:"8px",
            fontFamily:"monospace",
            fontSize:"0.9rem",
            resize:"vertical"
          }}
        />
      </div>

      {/* Analyze Button */}
      <div style={{marginBottom:"2rem"}}>
        <button
          onClick={analyzeDeck}
          disabled={loading || !deckCode.trim()}
          style={{
            backgroundColor: loading ? "#9ca3af" : "#4f46e5",
            color:"white",
            border:"none",
            padding:"0.75rem 2rem",
            borderRadius:"8px",
            fontSize:"1rem",
            fontWeight:"500",
            cursor: loading || !deckCode.trim() ? "not-allowed" : "pointer",
            transition:"background-color 0.2s"
          }}
        >
          {loading ? "🔄 Analyzing..." : "🧙‍♂️ Analyze Deck"}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div style={{
          border:"1px solid #e5e7eb",
          borderRadius:"8px",
          padding:"2rem",
          backgroundColor: analysis.error ? "#fef2f2" : "#f8fafc"
        }}>
          {analysis.error ? (
            <div>
              <h3 style={{color:"#dc2626", marginTop:0}}>❌ Analysis Error</h3>
              <p>{analysis.error}</p>
              {analysis.grade === 'Basic Analysis' && (
                <div style={{marginTop:"1rem", padding:"1rem", backgroundColor:"#fef3c7", borderRadius:"4px"}}>
                  <p style={{margin:0, fontSize:"0.9rem"}}>
                    <strong>💡 Note:</strong> AI analysis requires OpenAI API key configuration.
                    Currently showing basic heuristic analysis.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{marginTop:0}}>
                📊 Deck Analysis Results
                {analysis.grade === 'Basic Analysis' ? ' 🤖' : ' 🧙‍♂️'}
                <span style={{fontSize:"0.8rem", fontWeight:"normal", marginLeft:"0.5rem", color:"#6b7280"}}>
                  {analysis.grade === 'Basic Analysis' ? '(Basic Analysis)' : '(AI-Powered Analysis)'}
                </span>
              </h3>

              {/* Deck Score */}
              <div style={{marginBottom:"2rem"}}>
                <h4>Overall Score</h4>
                <div style={{
                  fontSize:"2rem",
                  fontWeight:"bold",
                  color: analysis.score >= 8 ? "#16a34a" : analysis.score >= 6 ? "#ca8a04" : "#dc2626"
                }}>
                  {analysis.score}/10
                </div>
                <p>{analysis.grade}</p>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div style={{marginBottom:"2rem"}}>
                  <h4>✅ Strengths</h4>
                  <ul>
                    {analysis.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                <div style={{marginBottom:"2rem"}}>
                  <h4>⚠️ Areas for Improvement</h4>
                  <ul>
                    {analysis.weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div style={{marginBottom:"2rem"}}>
                  <h4>💡 Optimization Suggestions</h4>
                  <ul>
                    {analysis.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Synergies */}
              {analysis.synergies && (
                <div style={{marginBottom:"2rem"}}>
                  <h4>🔗 Card Synergies</h4>
                  <div style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
                    gap:"1rem"
                  }}>
                    {Object.entries(analysis.synergies).map(([type, cards]) => (
                      <div key={type} style={{
                        padding:"1rem",
                        border:"1px solid #e5e7eb",
                        borderRadius:"4px"
                      }}>
                        <h5 style={{marginTop:0, textTransform:"capitalize"}}>{type}</h5>
                        <div style={{fontSize:"0.9rem", color:"#6b7280"}}>
                          {cards.join(", ")}
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

      {/* Sample Decks */}
      <div style={{marginTop:"3rem", padding:"2rem", backgroundColor:"#f8fafc", borderRadius:"8px"}}>
        <h3>🎴 Sample Decks to Try</h3>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"1rem"}}>
          <div>
            <h4>Hearthstone: Control Warrior</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              A classic control deck with strong board control and comeback potential.
            </p>
            <button
              onClick={() => setDeckCode("AAEBAf0EBMABoAHCAe0DqwTLBMsEzATNBM8EzgTOBM8E0ATQBNEE0gTRBNIE1ATVBNYE1wTXBNgE2ATZBNkE2gTaBNsE2wTcBN0E3gTfBOAE4AThBOIE4gTjBOQE5ATmBOYE5gTnBOgE6ATqBOoE6gTrBOwE7ATuBO4E7gTvBO8E8ATxBPQE9AT2BPYE9gT3BPgE+AT5BPkE+QT6BP4GCg==")}
              style={{
                backgroundColor:"#4f46e5",
                color:"white",
                border:"none",
                padding:"0.5rem 1rem",
                borderRadius:"4px",
                cursor:"pointer",
                fontSize:"0.9rem"
              }}
            >
              Load Sample Deck
            </button>
          </div>

          <div>
            <h4>Magic: Blue-White Control</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              Counters and board wipes with card advantage engines.
            </p>
            <button
              onClick={() => {
                setGameType('magic');
                setDeckCode("1 Island\n1 Plains\n1 Sol Ring\n1 Counterspell\n1 Wrath of God\n1 Timetwister\n1 Ancestral Recall\n1 Timetwister\n\n20 cards remaining...");
              }}
              style={{
                backgroundColor:"#4f46e5",
                color:"white",
                border:"none",
                padding:"0.5rem 1rem",
                borderRadius:"4px",
                cursor:"pointer",
                fontSize:"0.9rem"
              }}
            >
              Load Sample Deck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
