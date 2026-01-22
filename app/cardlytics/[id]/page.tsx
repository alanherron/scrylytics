'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import OraclePanel from '@/components/ai/OraclePanel'

// Mock function to fetch synergy data - replace with actual implementation
function fetchSynergy(cardId: string) {
  // Mock synergy data structure matching what Oracle API expects
  return {
    center: cardId,
    links: [
      {
        target: { id: 'card-1' },
        value: 0.85,
        info: { winrate: 62, frequency: 45, type: 'synergy' }
      },
      {
        target: { id: 'card-2' },
        value: 0.72,
        info: { winrate: 58, frequency: 32, type: 'combo' }
      },
      {
        target: { id: 'card-3' },
        value: 0.65,
        info: { winrate: 55, frequency: 28, type: 'support' }
      },
    ]
  }
}

export default function CardDetailPage() {
  const params = useParams()
  const cardId = (params.id as string) || ''
  const [data, setData] = useState<any>(null)
  const [summary, setSummary] = useState<string>('')

  useEffect(() => {
    if (!cardId) return

    const mock = fetchSynergy(cardId)
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setData(mock)
    }, 0)

    // 🔮 Fetch AI summary dynamically
    fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardName: cardId, links: mock.links, patchVersion: '29.6.2' })
    })
      .then(async (res) => {
        // Handle 405 Method Not Allowed (shouldn't happen with POST, but just in case)
        if (res.status === 405) {
          console.error('Oracle API: Method not allowed. This should not happen with POST requests.');
          setSummary('The Oracle whispers faintly — API method error.');
          return;
        }
        
        const data = await res.json();
        if (!res.ok) {
          console.error('Oracle API error:', data.error || data.message || data);
          // Don't show the 405 error message to users, show a friendly message instead
          if (res.status === 405) {
            setSummary('The Oracle whispers faintly — insights unavailable.');
          } else {
            setSummary(`Error: ${data.error || data.message || 'Failed to retrieve insights'}`);
          }
          return;
        }
        if (data.cached) console.info('🗃️ Oracle Insight loaded from cache');
        else console.info('✨ New Oracle Insight generated');
        setSummary(data.summary || 'The Oracle whispers faintly — insights unavailable.');
      })
      .catch((err) => {
        console.error('Oracle API fetch error:', err);
        setSummary('The Oracle whispers faintly — insights unavailable.');
      })
  }, [cardId])

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0F1114] text-white p-8">
        <div className="text-center">Loading card data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F1114] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Card: {data.center}</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Synergy Links</h2>
          <div className="space-y-2">
            {data.links.map((link: any, index: number) => (
              <div key={index} className="p-4 bg-[#1A1C20] rounded-lg border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{link.target.id}</span>
                  <span className="text-sm text-white/60">
                    Synergy: {(link.value * 100).toFixed(0)}%
                  </span>
                </div>
                {link.info && (
                  <div className="mt-2 text-sm text-white/60">
                    Winrate: {link.info.winrate}% | Frequency: {link.info.frequency}% | Type: {link.info.type}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <OraclePanel summary={summary} />
      </div>
    </div>
  )
}

