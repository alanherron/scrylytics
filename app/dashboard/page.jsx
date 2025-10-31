'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [decks, setDecks] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    // Load user data on component mount
    if (typeof window !== 'undefined') {
      loadUserData();
    }
  }, []);

  const loadUserData = () => {
    try {
      // Import user functions dynamically to avoid SSR issues
      import('../../lib/auth/user.js').then(({ getCurrentUser, getUserDecks, getUserAnalyses }) => {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setDecks(getUserDecks());
          setAnalyses(getUserAnalyses());
        } else {
          setShowCreateUser(true);
        }
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const createUser = async () => {
    if (!newUsername.trim()) return;

    try {
      const { createUser } = await import('../../lib/auth/user.js');
      const newUser = createUser(newUsername.trim());
      setUser(newUser);
      setDecks([]);
      setAnalyses([]);
      setShowCreateUser(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const deleteDeck = async (deckId) => {
    try {
      const { deleteDeck } = await import('../../lib/auth/user.js');
      const success = deleteDeck(deckId);
      if (success) {
        setDecks(decks.filter(deck => deck.id !== deckId));
      }
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

  // Show create user form if no user exists
  if (showCreateUser) {
    return (
      <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"600px", margin:"0 auto", textAlign:"center"}}>
        <h1>🎮 Welcome to Scrylytics</h1>
        <p>Create a profile to save your decks and track your analysis history.</p>

        <div style={{marginTop:"2rem", padding:"2rem", border:"1px solid #e5e7eb", borderRadius:"8px", backgroundColor:"white"}}>
          <h3 style={{marginTop:0}}>Create Your Profile</h3>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter your username"
            style={{
              width:"100%",
              padding:"0.75rem",
              border:"1px solid #d1d5db",
              borderRadius:"4px",
              fontSize:"1rem",
              marginBottom:"1rem"
            }}
          />
          <button
            onClick={createUser}
            disabled={!newUsername.trim()}
            style={{
              backgroundColor:"#4f46e5",
              color:"white",
              border:"none",
              padding:"0.75rem 2rem",
              borderRadius:"4px",
              fontSize:"1rem",
              cursor: !newUsername.trim() ? "not-allowed" : "pointer"
            }}
          >
            Create Profile
          </button>
        </div>

        <div style={{marginTop:"2rem"}}>
          <Link href="/" style={{color:"#4f46e5", textDecoration:"none"}}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"1200px", margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:"2rem"}}>
        <Link href="/" style={{color:"#4f46e5", textDecoration:"none", marginBottom:"1rem", display:"inline-block"}}>
          ← Back to Home
        </Link>
        <h1>🎮 {user?.username}'s Dashboard</h1>
        <p>Manage your saved decks and view your analysis history.</p>
      </div>

      {/* User Stats */}
      {user && (
        <div style={{
          backgroundColor:"#f8fafc",
          padding:"2rem",
          borderRadius:"8px",
          marginBottom:"2rem"
        }}>
          <h2 style={{marginTop:0}}>📊 Your Stats</h2>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",
            gap:"1rem"
          }}>
            <div style={{textAlign:"center", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
              <div style={{fontSize:"2rem", fontWeight:"bold", color:"#4f46e5"}}>{user.stats.totalAnalyses}</div>
              <div style={{color:"#6b7280"}}>Total Analyses</div>
            </div>
            <div style={{textAlign:"center", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
              <div style={{fontSize:"2rem", fontWeight:"bold", color:"#16a34a"}}>{user.stats.decksSaved}</div>
              <div style={{color:"#6b7280"}}>Decks Saved</div>
            </div>
            <div style={{textAlign:"center", padding:"1rem", backgroundColor:"white", borderRadius:"8px"}}>
              <div style={{fontSize:"1.5rem", fontWeight:"bold", color:"#ca8a04"}}>
                {user.stats.favoriteGame === 'hearthstone' ? '🃏' : '🎴'}
              </div>
              <div style={{color:"#6b7280"}}>Favorite Game</div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(500px, 1fr))",
        gap:"2rem"
      }}>
        {/* Saved Decks */}
        <div>
          <h2>🃏 Saved Decks</h2>
          {decks.length === 0 ? (
            <div style={{
              padding:"2rem",
              textAlign:"center",
              backgroundColor:"#f9fafb",
              borderRadius:"8px",
              color:"#6b7280"
            }}>
              <div style={{fontSize:"3rem", marginBottom:"1rem"}}>🃏</div>
              <p>No decks saved yet.</p>
              <p>Save decks from the analyzer to see them here!</p>
            </div>
          ) : (
            <div style={{display:"grid", gap:"1rem"}}>
              {decks.map((deck) => (
                <div key={deck.id} style={{
                  padding:"1.5rem",
                  border:"1px solid #e5e7eb",
                  borderRadius:"8px",
                  backgroundColor:"white"
                }}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:"1rem"}}>
                    <div>
                      <h3 style={{margin:0, marginBottom:"0.5rem"}}>{deck.name}</h3>
                      <div style={{fontSize:"0.9rem", color:"#6b7280"}}>
                        {deck.gameType === 'hearthstone' ? '🃏' : '🎴'} {deck.gameType} • Saved {new Date(deck.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDeck(deck.id)}
                      style={{
                        backgroundColor:"#dc2626",
                        color:"white",
                        border:"none",
                        padding:"0.25rem 0.75rem",
                        borderRadius:"4px",
                        fontSize:"0.8rem",
                        cursor:"pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div style={{fontSize:"0.9rem", color:"#6b7280", fontFamily:"monospace"}}>
                    {deck.deckCode.length > 100
                      ? `${deck.deckCode.substring(0, 100)}...`
                      : deck.deckCode
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analysis History */}
        <div>
          <h2>📈 Analysis History</h2>
          {analyses.length === 0 ? (
            <div style={{
              padding:"2rem",
              textAlign:"center",
              backgroundColor:"#f9fafb",
              borderRadius:"8px",
              color:"#6b7280"
            }}>
              <div style={{fontSize:"3rem", marginBottom:"1rem"}}>📊</div>
              <p>No analyses saved yet.</p>
              <p>Analyses will be saved automatically when you use the analyzer!</p>
            </div>
          ) : (
            <div style={{display:"grid", gap:"1rem"}}>
              {analyses.map((analysis) => (
                <div key={analysis.id} style={{
                  padding:"1.5rem",
                  border:"1px solid #e5e7eb",
                  borderRadius:"8px",
                  backgroundColor:"white"
                }}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:"1rem"}}>
                    <div>
                      <h3 style={{margin:0, marginBottom:"0.5rem"}}>{analysis.deckName}</h3>
                      <div style={{fontSize:"0.9rem", color:"#6b7280"}}>
                        {analysis.gameType === 'hearthstone' ? '🃏' : '🎴'} {analysis.gameType} • {new Date(analysis.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      fontSize:"1.5rem",
                      fontWeight:"bold",
                      color: analysis.score >= 8 ? "#16a34a" : analysis.score >= 6 ? "#ca8a04" : "#dc2626"
                    }}>
                      {analysis.score}/10
                    </div>
                  </div>

                  <div style={{marginBottom:"1rem"}}>
                    <span style={{
                      padding:"0.25rem 0.5rem",
                      borderRadius:"4px",
                      fontSize:"0.8rem",
                      fontWeight:"bold",
                      backgroundColor: analysis.grade === 'S' ? "#16a34a" :
                                     analysis.grade === 'A' ? "#16a34a" :
                                     analysis.grade === 'B' ? "#ca8a04" : "#dc2626",
                      color:"white"
                    }}>
                      Grade: {analysis.grade}
                    </span>
                  </div>

                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div style={{marginBottom:"1rem"}}>
                      <div style={{fontSize:"0.9rem", fontWeight:"600", marginBottom:"0.5rem"}}>✅ Strengths:</div>
                      <div style={{fontSize:"0.9rem", color:"#6b7280"}}>
                        {analysis.strengths.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
          User dashboard and deck management
        </div>
      </footer>
    </div>
  );
}
