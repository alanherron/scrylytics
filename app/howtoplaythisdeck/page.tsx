'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Loader2, Copy, Check } from 'lucide-react';
import HeroSigil from '@/components/HeroSigil';
import { ELEMENTS } from '@/lib/theme';
import { useGame } from '@/context/GameContext';

export default function HowToPlayPage() {
  const { game } = useGame();
  const [deckCode, setDeckCode] = useState('');
  const [gameType, setGameType] = useState<'hearthstone' | 'magic'>(game || 'hearthstone');
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<string | null>(null);
  const [deckInfo, setDeckInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateGuide = async () => {
    if (!deckCode.trim()) {
      setError('Please enter a deck code or deck list');
      return;
    }

    setLoading(true);
    setError(null);
    setGuide(null);
    setDeckInfo(null);

    try {
      const response = await fetch('/api/howtoplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckCode: deckCode.trim(), gameType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate guide');
      }

      setGuide(data.guide);
      setDeckInfo(data.deckInfo);
    } catch (err) {
      console.error('Failed to generate guide:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate gameplay guide');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyGuide = async () => {
    if (!guide) return;
    
    try {
      await navigator.clipboard.writeText(guide);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const element = gameType === 'hearthstone' ? ELEMENTS.fire : ELEMENTS.air;

  return (
    <div className="min-h-screen bg-[#0F1114] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#0F1114] to-[#0F1114]/50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-white/70 transition hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-6">
            <HeroSigil
              color={element.hue}
              glow={element.glow}
              variant={gameType === 'hearthstone' ? 'fire' : 'air'}
            />
            <div>
              <h1 className="font-display text-4xl font-bold">How to Play This Deck</h1>
              <p className="mt-2 text-lg text-white/70">
                Get AI-powered gameplay guides and strategy tips for any deck
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Game Type Selector */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setGameType('hearthstone')}
            className={`rounded-xl px-6 py-3 font-semibold transition ${
              gameType === 'hearthstone'
                ? 'bg-gradient-to-r from-[#E53935] to-[#FF7043] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Hearthstone
          </button>
          <button
            onClick={() => setGameType('magic')}
            className={`rounded-xl px-6 py-3 font-semibold transition ${
              gameType === 'magic'
                ? 'bg-gradient-to-r from-[#6A1B9A] to-[#9C27B0] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Magic: The Gathering
          </button>
        </div>

        {/* Deck Input */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <label className="mb-4 block text-lg font-semibold">
            {gameType === 'hearthstone' ? 'Deck Code' : 'Deck List'}
          </label>
          <textarea
            value={deckCode}
            onChange={(e) => setDeckCode(e.target.value)}
            placeholder={
              gameType === 'hearthstone'
                ? 'Paste your Hearthstone deck code here...'
                : 'Paste your Magic deck list here (format: 4x Card Name)...'
            }
            className="w-full rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
            rows={8}
          />
          <button
            onClick={handleGenerateGuide}
            disabled={loading || !deckCode.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0288D1] to-[#26C6DA] px-6 py-3 font-semibold text-white transition hover:from-[#039BE5] hover:to-[#4DD0E1] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Guide...
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                Generate Guide
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Deck Info */}
        {deckInfo && (
          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">Deck Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Name:</span>
                <span className="ml-2 font-medium">{deckInfo.name}</span>
              </div>
              <div>
                <span className="text-white/60">Total Cards:</span>
                <span className="ml-2 font-medium">{deckInfo.totalCards}</span>
              </div>
              <div>
                <span className="text-white/60">Status:</span>
                <span className={`ml-2 font-medium ${deckInfo.valid ? 'text-green-400' : 'text-yellow-400'}`}>
                  {deckInfo.valid ? 'Valid' : 'Has Issues'}
                </span>
              </div>
              {deckInfo.issues && deckInfo.issues.length > 0 && (
                <div className="col-span-2">
                  <span className="text-white/60">Issues:</span>
                  <span className="ml-2 text-yellow-400">{deckInfo.issues.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guide Output */}
        {guide && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/40 to-indigo-950/40 p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gameplay Guide</h2>
              <button
                onClick={handleCopyGuide}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="space-y-4 text-white/90">
              {guide.split('\n\n').map((paragraph, i) => {
                if (!paragraph.trim()) return null;
                
                // Handle headings
                if (paragraph.startsWith('#')) {
                  const lines = paragraph.split('\n');
                  return lines.map((line, j) => {
                    if (line.startsWith('#')) {
                      const level = line.match(/^#+/)?.[0].length || 1;
                      const text = line.replace(/^#+\s/, '');
                      const HeadingTag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
                      const sizeClass = level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl';
                      return <HeadingTag key={`${i}-${j}`} className={`${sizeClass} font-bold mt-8 mb-4 text-white`}>{text}</HeadingTag>;
                    }
                    return null;
                  });
                }
                
                // Handle lists
                if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
                  const items = paragraph.split('\n').filter(l => l.trim());
                  return (
                    <ul key={i} className="ml-6 list-disc space-y-2">
                      {items.map((item, j) => {
                        const text = item.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return <li key={j} dangerouslySetInnerHTML={{ __html: text }} />;
                      })}
                    </ul>
                  );
                }
                
                // Handle regular paragraphs
                const formatted = paragraph
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="text-white/80">$1</em>');
                
                return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!guide && !loading && !error && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-white/20" />
            <h3 className="mb-2 text-xl font-semibold">Ready to Learn?</h3>
            <p className="text-white/60">
              Paste your deck code or deck list above and get an AI-powered gameplay guide
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

