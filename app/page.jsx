'use client';

import Link from 'next/link';
import { VERSION, BUILD_DATE, BUILD_NUMBER } from '../lib/version.js';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadUserData();
    }
  }, []);

  const loadUserData = async () => {
    try {
      const { getCurrentUser } = await import('../lib/auth/user.js');
      const currentUser = getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn('Failed to load user data:', error);
    }
  };

  return (
    <main style={{padding:"2rem", fontFamily:"system-ui, sans-serif"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
        <div></div>
        {user && (
          <Link href="/dashboard" style={{
            color:"#4f46e5",
            textDecoration:"none",
            fontSize:"0.9rem",
            padding:"0.5rem 1rem",
            border:"1px solid #4f46e5",
            borderRadius:"4px"
          }}>
            🎮 {user.username}'s Dashboard
          </Link>
        )}
      </div>

      <h1>🔮 Scrylytics</h1>
      <p>AI-powered analytics and deck optimization for collectible card games.</p>

      <div style={{marginTop:"2rem", display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"1rem"}}>
        <Link href="/analyzer" style={{
          display:"block",
          padding:"2rem",
          border:"2px solid #4f46e5",
          borderRadius:"8px",
          textDecoration:"none",
          color:"#4f46e5",
          transition:"all 0.2s"
        }}>
          <h2>🧙‍♂️ Decklytics</h2>
          <p>AI deck analyzer — grades, synergies, and optimization suggestions</p>
          <div style={{marginTop:"1rem", fontSize:"0.9rem", opacity:0.8}}>
            → Supports Hearthstone & Magic: The Gathering
          </div>
          <div style={{marginTop:"0.5rem", fontSize:"0.8rem", opacity:0.7}}>
            Features: Card images, AI analysis, synergy detection
          </div>
        </Link>

        <Link href="/playlitics" style={{
          display:"block",
          padding:"2rem",
          border:"2px solid #4f46e5",
          borderRadius:"8px",
          textDecoration:"none",
          color:"#4f46e5",
          transition:"all 0.2s"
        }}>
          <h2>⚔️ Playlytics</h2>
          <p>Game simulation and matchup testing</p>
          <div style={{marginTop:"1rem", fontSize:"0.9rem", opacity:0.8}}>
            → Analyze deck matchups now
          </div>
        </Link>

        <Link href="/metalyzer" style={{
          display:"block",
          padding:"2rem",
          border:"2px solid #4f46e5",
          borderRadius:"8px",
          textDecoration:"none",
          color:"#4f46e5",
          transition:"all 0.2s"
        }}>
          <h2>📊 Metalyzer</h2>
          <p>Meta tracking and statistical reports across formats.</p>
          <div style={{marginTop:"1rem", fontSize:"0.9rem", opacity:0.8}}>
            → View meta trends now
          </div>
        </Link>

        <Link href="/insights" style={{
          display:"block",
          padding:"2rem",
          border:"2px solid #4f46e5",
          borderRadius:"8px",
          textDecoration:"none",
          color:"#4f46e5",
          transition:"all 0.2s"
        }}>
          <h2>📈 AI Insights</h2>
          <p>Visual deck analysis with parchment-style charts and AI recommendations.</p>
          <div style={{marginTop:"1rem", fontSize:"0.9rem", opacity:0.8}}>
            → Explore deck insights now
          </div>
        </Link>
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
          <strong>Scrylytics v{VERSION}</strong> • <span style={{color:"#4f46e5", fontWeight:"bold"}}>Build #{BUILD_NUMBER}</span> • Built {BUILD_DATE}
        </div>
        <div style={{fontSize:"0.8rem"}}>
          AI-powered deck analysis for Hearthstone & Magic: The Gathering
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
    </main>
  );
}
