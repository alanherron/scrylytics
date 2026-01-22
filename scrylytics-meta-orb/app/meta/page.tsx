"use client";

import { useEffect, useState } from "react";

import MetaOrb from "../../components/MetaOrb";

export default function MetaPage() {

  const [data, setData] = useState([]);

  useEffect(() => { fetch("/api/meta").then(r => r.json()).then(setData); }, []);

  if (!data.length) return <div className="text-center mt-20 text-white">Loading meta...</div>;

  return (

    <div className="min-h-screen bg-linear-to-b from-gray-900 via-slate-900 to-black text-white flex flex-col items-center">

      <h1 className="text-4xl font-bold mt-10 mb-4">Scrylytics Meta Orb</h1>

      <p className="text-gray-300 mb-6">Explore the Hearthstone meta through the Orb of Insight</p>

      <div className="w-[600px] h-[600px]"><MetaOrb data={data} /></div>

    </div>

  );

}

