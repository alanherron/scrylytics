'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load user data if available
      const savedUser = localStorage.getItem('scrylytics_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  return (
    <div style={{padding:"2rem", fontFamily:"system-ui, sans-serif", maxWidth:"1200px", margin:"0 auto"}}>
      <div style={{marginBottom:"2rem"}}>
        <h1 style={{fontSize:"2.5rem", color:"#1f2937", marginBottom:"0.5rem"}}>Scrylytics</h1>
        <p style={{fontSize:"1.1rem", color:"#4b5563"}}>Where magic meets machine learning — AI-powered deck analytics.</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"2rem", marginTop:"3rem"}}>
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
          <p>AI-powered deck analysis for Hearthstone & Magic: The Gathering.</p>
        </Link>

        <Link href="/dashboard" style={{
          display:"block",
          padding:"2rem",
          border:"2px solid #4f46e5",
          borderRadius:"8px",
          textDecoration:"none",
          color:"#4f46e5",
          transition:"all 0.2s"
        }}>
          <h2>👤 User Dashboard</h2>
          <p>Save your decks, view past analyses, and manage your profile.</p>
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
          <p>Visual deck analysis with parchment-style charts.</p>
        </Link>
      </div>

      <footer style={{
        marginTop:"3rem",
        paddingTop:"2rem",
        borderTop:"1px solid #e5e7eb",
        textAlign:"center",
        color:"#6b7280",
        fontSize:"0.9rem"
      }}>
        <div>Scrylytics v1.2.0 - AI-powered deck analysis</div>
      </footer>
    </div>
  );
}
