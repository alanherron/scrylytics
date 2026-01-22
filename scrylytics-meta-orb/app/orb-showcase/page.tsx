"use client";

import OrbShowcase from "../../components/OrbShowcase";

export default function OrbShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Scrylytics Orb</h1>
      <p className="text-gray-300 mb-8">The Sacred Geometry within</p>
      <div className="w-full max-w-4xl">
        <OrbShowcase />
      </div>
    </div>
  );
}
