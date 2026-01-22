import Link from 'next/link';
import { CardlyticsIcon, DecklyticsIcon, PlaylyticsIcon, MetalyticsIcon } from '@/components/icons/scrylytics-icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F1114] text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-white/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#388E3C] to-[#8BC34A] px-6 py-3 font-semibold text-white transition hover:from-[#2E7D32] hover:to-[#66BB6A]"
          >
            Go Home
          </Link>
          <Link
            href="/decklytics"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Browse Decks
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link
            href="/cardlytics"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <CardlyticsIcon color="#8BC34A" size={32} />
            <span className="text-sm">Cardlytics</span>
          </Link>
          <Link
            href="/decklytics"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <DecklyticsIcon color="#26C6DA" size={32} />
            <span className="text-sm">Decklytics</span>
          </Link>
          <Link
            href="/playlytics"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <PlaylyticsIcon color="#FF7043" size={32} />
            <span className="text-sm">Playlytics</span>
          </Link>
          <Link
            href="/metalytics"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <MetalyticsIcon color="#9C27B0" size={32} />
            <span className="text-sm">Metalytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}








