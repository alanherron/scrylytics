'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VERSION, BUILD_DATE, BUILD_NUMBER } from '../../lib/version.js';
import { analyzeDeckFromAnalysis } from '../../lib/ai/insightEngine';
import InsightChart from '../../components/InsightChart';

export default function Analyzer() {
  const [deckCode, setDeckCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState('hearthstone');
  const [user, setUser] = useState(null);
  const [deckName, setDeckName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [insights, setInsights] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    // Load user data on component mount
    if (typeof window !== 'undefined') {
      loadUserData();
    }
  }, []);

  const loadUserData = async () => {
    try {
      const { getCurrentUser } = await import('../../lib/auth/user.js');
      const currentUser = getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn('Failed to load user data:', error);
    }
  };

  const saveDeck = async () => {
    if (!user || !analysis || !deckName.trim()) return;

    try {
      const { saveDeck } = await import('../../lib/auth/user.js');
      const deckData = {
        gameType,
        deckCode: deckCode.trim(),
        analysis,
        stats: analysis.detailedAnalysis || {}
      };

      const savedDeck = saveDeck(deckData, deckName.trim());
      if (savedDeck) {
        setShowSaveDialog(false);
        setDeckName('');
        alert('Deck saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save deck:', error);
      alert('Failed to save deck. Please try again.');
    }
  };

  const analyzeDeck = async () => {
    if (!deckCode.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckCode, gameType })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Save analysis to user profile if user exists
      if (typeof window !== 'undefined') {
        try {
          const { getCurrentUser, saveAnalysis } = await import('../../lib/auth/user.js');
          const user = getCurrentUser();
          if (user && result.score) {
            saveAnalysis(result, `Analysis ${new Date().toLocaleDateString()}`);
          }
        } catch (error) {
          console.warn('Failed to save analysis:', error);
        }
      }

      setAnalysis(result);

      // Generate insights based on the analysis
      try {
        const deckMeta = {
          name: `Analyzed ${gameType} deck`,
          archetype: result.grade || 'Unknown',
          gameType: gameType,
          list: []
        };
        const insightResult = analyzeDeckFromAnalysis(deckMeta, result);
        setInsights(insightResult);
      } catch (error) {
        console.warn('Failed to generate insights:', error);
        setInsights(null);
      }

      // Start loading real card images after initial analysis
      setTimeout(() => loadRealCardImages(result), 100);

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: 'Failed to analyze deck. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle image loading states
  const handleImageLoad = (index) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: 'loaded'
    }));
  };

  const handleImageError = (index) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: 'error'
    }));
  };

  // Load real images after initial analysis
  const loadRealCardImages = async (currentAnalysis) => {
    if (!currentAnalysis?.cardImages?.length) return;

    // Find placeholder images and try to load real ones
    const placeholders = currentAnalysis.cardImages.filter(card => card.isPlaceholder);

    if (placeholders.length === 0) {
      console.log('No placeholder images to replace');
      return;
    }

    console.log(`Loading real images for ${placeholders.length} placeholder cards...`);

    try {
      // Create a new API call to get updated images with real URLs
      const response = await fetch('/api/analyze/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckCode, gameType })
      });

      if (response.ok) {
        const imageData = await response.json();
        if (imageData.cardImages && imageData.cardImages.length > 0) {
          // Update the analysis with real images
          setAnalysis(prevAnalysis => ({
            ...prevAnalysis,
            cardImages: imageData.cardImages
          }));
          console.log('Updated with real card images');
        }
      }
    } catch (error) {
      console.warn('Failed to load real card images:', error);
      // Keep placeholders if real loading fails
    }
  };

  return (
    <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"1200px", margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:"2rem"}}>
        <Link href="/" style={{color:"#4f46e5", textDecoration:"none", marginBottom:"1rem", display:"inline-block"}}>
          ← Back to Home
        </Link>

        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
          <h1>🧙‍♂️ Decklytics - AI Deck Analyzer</h1>
          <a
            href="#sample-decks"
            style={{
              backgroundColor:"#4f46e5",
              color:"white",
              padding:"0.5rem 1rem",
              borderRadius:"6px",
              textDecoration:"none",
              fontSize:"0.9rem",
              fontWeight:"500"
            }}
          >
            🎴 Try Sample Decks
          </a>
        </div>
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
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
                <h3 style={{margin:0}}>
                  📊 Deck Analysis Results
                  {analysis.grade === 'Basic Analysis' ? ' 🤖' : ' 🧙‍♂️'}
                  <span style={{fontSize:"0.8rem", fontWeight:"normal", marginLeft:"0.5rem", color:"#6b7280"}}>
                    {analysis.grade === 'Basic Analysis' ? '(Basic Analysis)' : '(AI-Powered Analysis)'}
                  </span>
                </h3>

                <div style={{display:"flex", gap:"0.5rem"}}>
                  {insights && (
                    <button
                      onClick={() => setShowInsights(!showInsights)}
                      style={{
                        backgroundColor: showInsights ? "#7c3aed" : "#4f46e5",
                        color:"white",
                        border:"none",
                        padding:"0.5rem 1rem",
                        borderRadius:"4px",
                        fontSize:"0.9rem",
                        cursor:"pointer"
                      }}
                    >
                      📈 {showInsights ? 'Hide' : 'Show'} Insights
                    </button>
                  )}

                  {user && analysis.score && (
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      style={{
                        backgroundColor:"#16a34a",
                        color:"white",
                        border:"none",
                        padding:"0.5rem 1rem",
                        borderRadius:"4px",
                        fontSize:"0.9rem",
                        cursor:"pointer"
                      }}
                    >
                      💾 Save Deck
                    </button>
                  )}
                </div>
              </div>

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

              {/* Card Images Gallery */}
              {analysis.cardImages && analysis.cardImages.length > 0 && (
                <div style={{marginBottom:"2rem"}}>
                  <h4>🖼️ Key Cards</h4>
                  <div style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",
                    gap:"1rem",
                    marginTop:"1rem"
                  }}>
                    {analysis.cardImages.slice(0, 8).map((card, index) => (
                      <div key={index} style={{
                        textAlign:"center",
                        padding:"0.5rem",
                        border:"1px solid #e5e7eb",
                        borderRadius:"8px",
                        backgroundColor:"#f9fafb"
                      }}>
                        <div style={{ position: "relative" }}>
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            onLoad={() => handleImageLoad(index)}
                            onError={() => handleImageError(index)}
                            style={{
                              width:"100%",
                              maxWidth:"120px",
                              height:"auto",
                              borderRadius:"4px",
                              marginBottom:"0.5rem",
                              opacity: card.isPlaceholder ? 0.6 : 1,
                              filter: card.isPlaceholder ? 'blur(1px)' : 'none',
                              transition: 'opacity 0.3s ease, filter 0.3s ease'
                            }}
                            loading="lazy"
                          />
                          {card.isPlaceholder && (
                            <div style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              color: "#6b7280",
                              fontSize: "0.7rem",
                              fontWeight: "500"
                            }}>
                              Loading...
                            </div>
                          )}
                        </div>
                        <div style={{fontSize:"0.8rem", fontWeight:"500"}}>{card.name}</div>
                        {card.count && <div style={{fontSize:"0.7rem", color:"#6b7280"}}>×{card.count}</div>}
                      </div>
                    ))}
                  </div>
                  {analysis.cardImages.length > 8 && (
                    <p style={{fontSize:"0.9rem", color:"#6b7280", marginTop:"1rem"}}>
                      And {analysis.cardImages.length - 8} more cards...
                    </p>
                  )}
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
                          {Array.isArray(cards) ? cards.join(", ") : cards}
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

      {/* Insights Section */}
      {showInsights && insights && (
        <div style={{marginTop:"3rem", padding:"2rem", backgroundColor:"#fefefe", borderRadius:"8px", border:"2px solid #e5e7eb"}}>
          <h3 style={{marginBottom:"1.5rem", color:"#1f2937"}}>🔍 AI Insights & Visual Analysis</h3>
          <InsightChart
            issue={insights.issue}
            data={insights.data}
            caption={insights.caption}
            title={insights.title}
          />
          <div style={{marginTop:"1.5rem", padding:"1rem", backgroundColor:"#f8fafc", borderRadius:"6px", borderLeft:"4px solid #4f46e5"}}>
            <p style={{margin:0, fontSize:"0.95rem", color:"#374151"}}>
              <strong>💡 Key Insight:</strong> {insights.caption}
            </p>
          </div>
        </div>
      )}

      {/* Sample Decks */}
      <div id="sample-decks" style={{marginTop:"3rem", padding:"2rem", backgroundColor:"#f8fafc", borderRadius:"8px", border:"2px solid #4f46e5"}}>
        <h3 style={{color:"#1f2937", marginBottom:"0.5rem"}}>🎴 Sample Decks to Try (6 decks available)</h3>
        <div style={{width:"100%", height:"4px", backgroundColor:"#4f46e5", marginBottom:"1rem", borderRadius:"2px"}}></div>
        <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"1.5rem"}}>
          Try these sample decks to see different analysis results and AI insights. Each deck demonstrates different strengths and weaknesses.
        </p>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:"1rem"}}>
          {/* DEBUG: 6 sample decks should be visible below */}
          {/* Hearthstone Decks */}
          <div style={{border:"1px solid #e5e7eb", borderRadius:"8px", padding:"1rem", backgroundColor:"white"}}>
            <h4 style={{margin:"0 0 0.5rem 0", color:"#1f2937"}}>🃏 Hearthstone: Control Warrior</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              Classic control deck with strong board control. Good for learning tempo management.
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
                fontSize:"0.9rem",
                width:"100%"
              }}
            >
              Load & Analyze
            </button>
          </div>

          <div style={{border:"1px solid #e5e7eb", borderRadius:"8px", padding:"1rem", backgroundColor:"white"}}>
            <h4 style={{margin:"0 0 0.5rem 0", color:"#1f2937"}}>🃏 Hearthstone: Zoo Warlock</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              Aggressive deck with too many cheap cards. Demonstrates mana curve issues.
            </p>
            <button
              onClick={() => {
                setGameType('hearthstone');
                setDeckCode("AAEBAfBlGjwHyQGLBZME3QTgBOYF6gTrBO4E7wTwBPAE8QT1BPUF9gX3BfgF+QX6BfoF+wX8BfwF/AX+Bf8GAIAA");
              }}
              style={{
                backgroundColor:"#4f46e5",
                color:"white",
                border:"none",
                padding:"0.5rem 1rem",
                borderRadius:"4px",
                cursor:"pointer",
                fontSize:"0.9rem",
                width:"100%"
              }}
            >
              Load & Analyze
            </button>
          </div>

          <div style={{border:"1px solid #e5e7eb", borderRadius:"8px", padding:"1rem", backgroundColor:"white"}}>
            <h4 style={{margin:"0 0 0.5rem 0", color:"#1f2937"}}>🃏 Hearthstone: Miracle Rogue</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              Combo deck with inconsistent draw. Shows draw engine problems.
            </p>
            <button
              onClick={() => {
                setGameType('hearthstone');
                setDeckCode("AAEBAaIHBqW4A9W4A5rKA9rKA+DNA/rNA6bTA6jTA6rTA7LTA7TTA7bTA7jTA7rTA7vTA8DTA8TTA8jTA8rTA8vTA9DTA9TTA9jTA9rTA9vTA+DTA+TTBqHBsAAA==");
              }}
              style={{
                backgroundColor:"#4f46e5",
                color:"white",
                border:"none",
                padding:"0.5rem 1rem",
                borderRadius:"4px",
                cursor:"pointer",
                fontSize:"0.9rem",
                width:"100%"
              }}
            >
              Load & Analyze
            </button>
          </div>

          {/* Magic Decks */}
          <div style={{border:"1px solid #e5e7eb", borderRadius:"8px", padding:"1rem", backgroundColor:"white"}}>
            <h4 style={{margin:"0 0 0.5rem 0", color:"#1f2937"}}>🧙‍♂️ Magic: Blue-White Control</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              Classic control deck with counters and board wipes. Balanced but slow.
            </p>
            <button
              onClick={() => {
                setGameType('magic');
                setDeckCode("1 Island\n1 Plains\n1 Sol Ring\n1 Counterspell\n1 Wrath of God\n1 Timetwister\n1 Ancestral Recall\n1 Timetwister\n1 Time Walk\n1 Timetwister\n1 Ancestral Recall\n1 Black Lotus\n1 Mox Sapphire\n1 Mox Jet\n1 Mox Ruby\n1 Mox Emerald\n1 Ancestral Recall\n1 Time Walk\n1 Timetwister\n1 Time Walk\n\n20 cards remaining...");
              }}
              style={{
                backgroundColor:"#4f46e5",
                color:"white",
                border:"none",
                padding:"0.5rem 1rem",
                borderRadius:"4px",
                cursor:"pointer",
                fontSize:"0.9rem",
                width:"100%"
              }}
            >
              Load & Analyze
            </button>
          </div>

          <div style={{border:"1px solid #e5e7eb", borderRadius:"8px", padding:"1rem", backgroundColor:"white"}}>
            <h4 style={{margin:"0 0 0.5rem 0", color:"#1f2937"}}>🧙‍♂️ Magic: Storm Combo</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              Fast combo deck with inconsistent draws. Perfect for testing draw engines.
            </p>
            <button
              onClick={() => {
                setGameType('magic');
                setDeckCode("4 Brainstorm\n4 Ponder\n4 Preordain\n4 Lotus Petal\n4 Dark Ritual\n4 Lion's Eye Diamond\n4 Infernal Tutor\n4 Cabal Ritual\n4 Tendrils of Agony\n4 Ad Nauseam\n4 Past in Flames\n4 Burning Wish\n4 Empty the Warrens\n4 Grapeshot\n\n16 cards remaining...");
              }}
              style={{
                backgroundColor:"#4f46e5",
                color:"white",
                border:"none",
                padding:"0.5rem 1rem",
                borderRadius:"4px",
                cursor:"pointer",
                fontSize:"0.9rem",
                width:"100%"
              }}
            >
              Load & Analyze
            </button>
          </div>

          <div style={{border:"1px solid #e5e7eb", borderRadius:"8px", padding:"1rem", backgroundColor:"white"}}>
            <h4 style={{margin:"0 0 0.5rem 0", color:"#1f2937"}}>🧙‍♂️ Magic: Jund Midrange</h4>
            <p style={{fontSize:"0.9rem", color:"#6b7280", marginBottom:"0.5rem"}}>
              Three-color deck trying to do everything. Great example of role confusion.
            </p>
            <button
              onClick={() => {
                setGameType('magic');
                setDeckCode("4 Bloodstained Mire\n4 Wooded Foothills\n4 Windswept Heath\n4 Blackcleave Cliffs\n4 Copperline Gorge\n4 Blood Crypt\n4 Overgrown Tomb\n4 Stomping Ground\n4 Liliana of the Veil\n4 Dark Confidant\n4 Tarmogoyf\n4 Scavenging Ooze\n4 Bloodbraid Elf\n4 Lightning Helix\n4 Maelstrom Pulse\n4 Jund Charm\n4 Kolaghan's Command\n4 Fatal Push\n4 Thoughtseize\n4 Inquisition of Kozilek\n\n4 cards remaining...");
              }}
              style={{
                backgroundColor:"#4f46e5",
                color:"white",
                border:"none",
                padding:"0.5rem 1rem",
                borderRadius:"4px",
                cursor:"pointer",
                fontSize:"0.9rem",
                width:"100%"
              }}
            >
              Load & Analyze
            </button>
          </div>
        </div>

        <div style={{marginTop:"1.5rem", textAlign:"center", padding:"1rem", backgroundColor:"#f0f4ff", borderRadius:"6px", border:"1px solid #c7d2fe"}}>
          <p style={{margin:"0 0 0.5rem 0", fontSize:"0.9rem", color:"#3730a3", fontWeight:"500"}}>✅ All 6 sample decks loaded successfully!</p>
          <a
            href="/insights"
            style={{
              color:"#4f46e5",
              textDecoration:"none",
              fontSize:"0.9rem",
              fontWeight:"500"
            }}
          >
            🎯 Want to see AI insights for these decks? Visit the Insights page →
          </a>
        </div>
      </div>

      {/* Save Deck Dialog */}
      {showSaveDialog && (
        <div style={{
          position:"fixed",
          top:0,
          left:0,
          right:0,
          bottom:0,
          backgroundColor:"rgba(0,0,0,0.5)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          zIndex:1000
        }}>
          <div style={{
            backgroundColor:"white",
            padding:"2rem",
            borderRadius:"8px",
            maxWidth:"400px",
            width:"90%"
          }}>
            <h3 style={{marginTop:0}}>💾 Save Deck</h3>
            <p>Save this deck to your personal collection.</p>

            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Enter deck name"
              style={{
                width:"100%",
                padding:"0.75rem",
                border:"1px solid #d1d5db",
                borderRadius:"4px",
                fontSize:"1rem",
                marginBottom:"1rem"
              }}
            />

            <div style={{display:"flex", gap:"1rem", justifyContent:"flex-end"}}>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  backgroundColor:"#6b7280",
                  color:"white",
                  border:"none",
                  padding:"0.5rem 1rem",
                  borderRadius:"4px",
                  cursor:"pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveDeck}
                disabled={!deckName.trim()}
                style={{
                  backgroundColor:"#16a34a",
                  color:"white",
                  border:"none",
                  padding:"0.5rem 1rem",
                  borderRadius:"4px",
                  cursor: !deckName.trim() ? "not-allowed" : "pointer"
                }}
              >
                Save Deck
              </button>
            </div>
          </div>
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
          <strong>Scrylytics v{VERSION}</strong> • <span style={{color:"#4f46e5", fontWeight:"bold"}}>Build #{BUILD_NUMBER}</span> • Built {BUILD_DATE}
        </div>
        <div style={{fontSize:"0.8rem"}}>
          AI-powered deck analysis with card images
        </div>
        <div style={{marginTop:"0.5rem", fontSize:"0.8rem"}}>
          <a
            href="/api/version"
            target="_blank"
            style={{color:"#4f46e5", textDecoration:"none"}}
          >
            API Version Info →
          </a>
        </div>
      </footer>
    </div>
  );
}
