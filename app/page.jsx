import Link from 'next/link';

export default function Home() {
  return (
    <main style={{padding:"2rem", fontFamily:"system-ui, sans-serif"}}>
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

        <div style={{
          padding:"2rem",
          border:"2px solid #e5e7eb",
          borderRadius:"8px",
          color:"#6b7280"
        }}>
          <h2>⚔️ Playlytics</h2>
          <p>Game simulation and matchup testing</p>
          <div style={{marginTop:"1rem", fontSize:"0.9rem", opacity:0.8}}>
            Coming soon...
          </div>
        </div>

        <div style={{
          padding:"2rem",
          border:"2px solid #e5e7eb",
          borderRadius:"8px",
          color:"#6b7280"
        }}>
          <h2>📊 Metalyzer</h2>
          <p>Meta tracking and statistical reports</p>
          <div style={{marginTop:"1rem", fontSize:"0.9rem", opacity:0.8}}>
            Coming soon...
          </div>
        </div>
      </div>
    </main>
  );
}
