'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Metalyzer() {
  const [gameType, setGameType] = useState('hearthstone');
  const [format, setFormat] = useState('standard');
  const [metaData, setMetaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetaData();
  }, [gameType, format]);

  const loadMetaData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meta?game=${gameType}&format=${format}`);
      if (!response.ok) {
        throw new Error(`Failed to load meta data: ${response.status}`);
      }
      const data = await response.json();
      setMetaData(data);
    } catch (error) {
      console.error('Failed to load meta data:', error);
      setMetaData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#16a34a';
      case 'down': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"1400px", margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:"2rem"}}>
        <Link href="/" style={{color:"#4f46e5", textDecoration:"none", marginBottom:"1rem", display:"inline-block"}}>
          ← Back to Home
        </Link>
        <h1>📊 Metalyzer - Meta Analysis & Trends</h1>
        <p>Track tournament data, analyze meta trends, and discover popular decks.</p>
      </div>

      {/* Controls */}
      <div style={{display:"flex", gap:"1rem", marginBottom:"2rem", flexWrap:"wrap"}}>
        <div>
          <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"500"}}>Game:</label>
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

        <div>
          <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"500"}}>Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{
              padding:"0.5rem",
              border:"1px solid #d1d5db",
              borderRadius:"4px",
              fontSize:"1rem",
              backgroundColor:"white"
            }}
          >
            <option value="standard">Standard</option>
            <option value="pioneer">Pioneer</option>
            <option value="modern">Modern</option>
            <option value="legacy">Legacy</option>
          </select>
        </div>

        <div style={{alignSelf:"flex-end"}}>
          <button
            onClick={loadMetaData}
            disabled={loading}
            style={{
              padding:"0.5rem 1rem",
              backgroundColor:"#4f46e5",
              color:"white",
              border:"none",
              borderRadius:"4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{textAlign:"center", padding:"3rem"}}>
          <div style={{fontSize:"2rem", marginBottom:"1rem"}}>🔄</div>
          <div>Loading meta data...</div>
        </div>
      )}

      {/* Error State */}
      {metaData?.error && !loading && (
        <div style={{
          padding:"2rem",
          backgroundColor:"#fef2f2",
          border:"1px solid #fecaca",
          borderRadius:"8px",
          color:"#dc2626",
          marginBottom:"2rem"
        }}>
          <h3 style={{marginTop:0}}>❌ Error Loading Meta Data</h3>
          <p>{metaData.error}</p>
          {metaData.availableFormats && (
            <p>Available formats: {metaData.availableFormats.join(', ')}</p>
          )}
        </div>
      )}

      {/* Meta Data Display */}
      {metaData && !metaData.error && !loading && (
        <div>
          {/* Meta Overview */}
          <div style={{
            backgroundColor:"#f8fafc",
            padding:"2rem",
            borderRadius:"8px",
            marginBottom:"2rem"
          }}>
            <h2 style={{marginTop:0}}>
              {gameType === 'hearthstone' ? '🃏' : '🎴'} {gameType.charAt(0).toUpperCase() + gameType.slice(1)} {format.charAt(0).toUpperCase() + format.slice(1)} Meta
            </h2>

            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
              gap:"1rem",
              marginBottom:"1rem"
            }}>
              <div style={{textAlign:"center", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
                <div style={{fontSize:"2rem", fontWeight:"bold", color:"#4f46e5"}}>{metaData.totalTournaments}</div>
                <div style={{color:"#6b7280"}}>Tournaments</div>
              </div>
              <div style={{textAlign:"center", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
                <div style={{fontSize:"2rem", fontWeight:"bold", color:"#4f46e5"}}>{metaData.totalDecks}</div>
                <div style={{color:"#6b7280"}}>Decks Played</div>
              </div>
              <div style={{textAlign:"center", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
                <div style={{fontSize:"2rem", fontWeight:"bold", color:"#16a34a"}}>{metaData.analysis?.powerLevel?.toFixed(1)}%</div>
                <div style={{color:"#6b7280"}}>Meta Power Level</div>
              </div>
              <div style={{textAlign:"center", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
                <div style={{fontSize:"2rem", fontWeight:"bold", color:"#ca8a04"}}>{metaData.analysis?.metaStability?.toFixed(1)}%</div>
                <div style={{color:"#6b7280"}}>Stability</div>
              </div>
            </div>

            <div style={{fontSize:"0.9rem", color:"#6b7280", marginTop:"1rem"}}>
              Last updated: {metaData.lastUpdated} • Dominant Strategy: {metaData.analysis?.dominantStrategy?.toUpperCase() || 'Unknown'}
            </div>
          </div>

          {/* Top Decks */}
          <div style={{marginBottom:"2rem"}}>
            <h3>🏆 Top Performing Decks</h3>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",
              gap:"1rem"
            }}>
              {metaData.topDecks.map((deck, index) => (
                <div key={index} style={{
                  padding:"1.5rem",
                  border:"1px solid #e5e7eb",
                  borderRadius:"8px",
                  backgroundColor:"white"
                }}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
                    <h4 style={{margin:0}}>{deck.archetype}</h4>
                    <span style={{
                      fontSize:"1.2rem",
                      color: getTrendColor(deck.trend)
                    }}>
                      {getTrendIcon(deck.trend)}
                    </span>
                  </div>

                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem"}}>
                    <div>
                      <div style={{fontSize:"1.5rem", fontWeight:"bold", color:"#16a34a"}}>
                        {deck.winRate.toFixed(1)}%
                      </div>
                      <div style={{fontSize:"0.9rem", color:"#6b7280"}}>Win Rate</div>
                    </div>
                    <div>
                      <div style={{fontSize:"1.5rem", fontWeight:"bold", color:"#4f46e5"}}>
                        {deck.pickRate.toFixed(1)}%
                      </div>
                      <div style={{fontSize:"0.9rem", color:"#6b7280"}}>Pick Rate</div>
                    </div>
                  </div>

                  <div style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"1rem"}}>
                    {deck.decksPlayed} decks played
                  </div>

                  <div>
                    <div style={{fontSize:"0.9rem", fontWeight:"500", marginBottom:"0.5rem"}}>Key Cards:</div>
                    <div style={{fontSize:"0.9rem", color:"#6b7280"}}>
                      {deck.keyCards.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Distribution */}
          {metaData.metaEfficiency && (
            <div style={{marginBottom:"2rem"}}>
              <h3>🎯 Strategy Distribution</h3>
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
                gap:"1rem"
              }}>
                {Object.entries(metaData.metaEfficiency).map(([strategy, percentage]) => (
                  <div key={strategy} style={{
                    padding:"1rem",
                    backgroundColor:"white",
                    border:"1px solid #e5e7eb",
                    borderRadius:"8px",
                    textAlign:"center"
                  }}>
                    <div style={{fontSize:"2rem", fontWeight:"bold", color:"#4f46e5"}}>
                      {percentage.toFixed(1)}%
                    </div>
                    <div style={{textTransform:"capitalize"}}>{strategy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Cards */}
          {metaData.cardPopularity && (
            <div style={{marginBottom:"2rem"}}>
              <h3>🔥 Most Popular Cards</h3>
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
                gap:"1rem"
              }}>
                {metaData.cardPopularity.map((card, index) => (
                  <div key={index} style={{
                    padding:"1rem",
                    backgroundColor:"white",
                    border:"1px solid #e5e7eb",
                    borderRadius:"8px",
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center"
                  }}>
                    <div>
                      <div style={{fontWeight:"600"}}>{card.name}</div>
                      <div style={{fontSize:"0.9rem", color:"#6b7280"}}>
                        Pick Rate: {card.pickRate.toFixed(1)}%
                      </div>
                    </div>
                    <div style={{
                      fontSize:"1.2rem",
                      fontWeight:"bold",
                      color: card.winRate > 65 ? "#16a34a" : card.winRate > 55 ? "#ca8a04" : "#dc2626"
                    }}>
                      {card.winRate.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Recommendations */}
          {metaData.recommendations && (
            <div style={{marginBottom:"2rem"}}>
              <h3>💡 Meta Recommendations</h3>
              <div style={{
                padding:"1.5rem",
                backgroundColor:"white",
                border:"1px solid #e5e7eb",
                borderRadius:"8px"
              }}>
                <ul style={{margin:0, paddingLeft:"1.5rem"}}>
                  {metaData.recommendations.map((rec, index) => (
                    <li key={index} style={{marginBottom:"0.5rem"}}>{rec}</li>
                  ))}
                </ul>
              </div>
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
          Meta analysis and tournament tracking
        </div>
      </footer>
    </div>
  );
}
