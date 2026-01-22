'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { CardlyticsIcon, DecklyticsIcon, PlaylyticsIcon, MetalyticsIcon } from '@/components/icons/scrylytics-icons'

import CardLibrary from '@/components/CardLibrary'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'



export default function CardlyticsPage() {



  const winrateData = [

    { deck: 'Aggro Pally', winrate: 62 },

    { deck: 'Control DK', winrate: 54 },

    { deck: 'Spell Mage', winrate: 59 },

    { deck: 'Ramp Druid', winrate: 51 },

  ]



  const trendData = [

    { day: 'Mon', rate: 55 },

    { day: 'Tue', rate: 58 },

    { day: 'Wed', rate: 60 },

    { day: 'Thu', rate: 61 },

    { day: 'Fri', rate: 59 },

    { day: 'Sat', rate: 62 },

    { day: 'Sun', rate: 64 },

  ]



  return (

    <div className="min-h-screen bg-[#0F1114] text-white">

      {/* Header */}

      <header className="border-b border-white/10 p-6 bg-gradient-to-r from-[#388E3C] to-[#8BC34A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">

        <div className="flex items-center gap-3">

          <CardlyticsIcon color="#FFFFFF" />

          <h1 className="text-3xl font-bold tracking-tight">Cardlytics</h1>

        </div>

        <input

          type="text"

          placeholder="Search cards..."

          className="bg-black/30 px-4 py-2 rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-[#8BC34A]"

        />

        <div className="flex items-center gap-2 md:gap-4">

          <button className="text-sm bg-white/10 px-3 py-2 rounded hover:bg-white/20">Standard</button>

          <button className="text-sm bg-white/10 px-3 py-2 rounded hover:bg-white/20">Wild</button>

          <button className="text-sm bg-white/10 px-3 py-2 rounded hover:bg-white/20">Classic</button>

        </div>

      </header>



      {/* Hero / Insight Snapshot */}

      <section className="relative p-8 bg-[#1A1C20] flex flex-col lg:flex-row items-center justify-between gap-8">

        <div className="w-full lg:w-1/2">

          <h2 className="text-2xl font-semibold mb-2">Featured Card</h2>

          <p className="text-white/70 mb-6">Top performing card this week</p>

          <div className="bg-gradient-to-br from-[#388E3C] to-[#8BC34A] p-4 rounded-xl shadow-xl max-w-sm">

            <Image src="/images/sample-card.png" alt="Featured Card" width={300} height={420} className="rounded-lg shadow-md w-full" />

          </div>

        </div>

        <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="p-4 bg-black/30 rounded-lg text-center">

            <p className="text-sm text-white/60">Play Rate</p>

            <p className="text-2xl font-semibold">8.4%</p>

          </div>

          <div className="p-4 bg-black/30 rounded-lg text-center">

            <p className="text-sm text-white/60">Win Rate</p>

            <p className="text-2xl font-semibold">56.2%</p>

          </div>

          <div className="p-4 bg-black/30 rounded-lg text-center">

            <p className="text-sm text-white/60">Popularity</p>

            <p className="text-2xl font-semibold">Top 3%</p>

          </div>

        </div>

      </section>



      {/* Charts */}

      <section className="p-8 bg-[#0F1114] grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-[#1A1C20] p-6 rounded-xl border border-white/5">

          <h3 className="text-lg font-semibold mb-4">Winrate by Deck Archetype</h3>

          <ResponsiveContainer width="100%" height={250}>

            <BarChart data={winrateData}>

              <XAxis dataKey="deck" stroke="#aaa" />

              <YAxis stroke="#aaa" />

              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} />

              <Bar dataKey="winrate" fill="#8BC34A" radius={[6, 6, 0, 0]} />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="bg-[#1A1C20] p-6 rounded-xl border border-white/5">

          <h3 className="text-lg font-semibold mb-4">Winrate Trend Over Time</h3>

          <ResponsiveContainer width="100%" height={250}>

            <LineChart data={trendData}>

              <XAxis dataKey="day" stroke="#aaa" />

              <YAxis stroke="#aaa" />

              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} />

              <Line type="monotone" dataKey="rate" stroke="#8BC34A" strokeWidth={3} dot={{ r: 4 }} />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </section>



      {/* Library Section */}

      <section className="p-8">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h2 className="text-2xl font-semibold mb-2">Card Library</h2>

            <p className="text-white/60">Explore, search, and compare all Hearthstone cards in the Scrylytics library.</p>

          </div>

          <Link

            href="/decklytics/editor"

            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0288D1] to-[#26C6DA] px-5 py-3 text-sm font-semibold text-white transition hover:from-[#039BE5] hover:to-[#4DD0E1] shadow-lg"

          >

            <DecklyticsIcon color="#FFFFFF" size={20} />

            Open Deck Editor

          </Link>

        </div>

        <div className="bg-[#1A1C20] p-6 rounded-xl border border-white/5">

          <CardLibrary hideDeckPanel={true} />

        </div>

      </section>



      {/* Related Insights */}

      <section className="p-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Link href="/decklytics/editor" className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 rounded-xl flex items-center justify-between transition hover:from-emerald-400 hover:to-teal-400 shadow-lg">

          <div>

            <h4 className="text-lg font-semibold">Deck Editor</h4>

            <p className="text-sm text-white/80">Build and edit decks with cards</p>

          </div>

          <DecklyticsIcon color="#FFFFFF" />

        </Link>

        <Link href="/decklytics" className="bg-gradient-to-r from-[#0288D1] to-[#26C6DA] p-5 rounded-xl flex items-center justify-between transition hover:from-[#039BE5] hover:to-[#4DD0E1]">

          <div>

            <h4 className="text-lg font-semibold">Decklytics</h4>

            <p className="text-sm text-white/80">See which decks this card appears in</p>

          </div>

          <DecklyticsIcon color="#FFFFFF" />

        </Link>

        <Link href="/playlytics" className="bg-gradient-to-r from-[#E53935] to-[#FF7043] p-5 rounded-xl flex items-center justify-between transition hover:from-[#F44336] hover:to-[#FF8A65]">

          <div>

            <h4 className="text-lg font-semibold">Playlytics</h4>

            <p className="text-sm text-white/80">Analyze performance by matchups</p>

          </div>

          <PlaylyticsIcon color="#FFFFFF" />

        </Link>

        <Link href="/metalytics" className="bg-gradient-to-r from-[#6A1B9A] to-[#9C27B0] p-5 rounded-xl flex items-center justify-between transition hover:from-[#7B1FA2] hover:to-[#AB47BC]">

          <div>

            <h4 className="text-lg font-semibold">Metalytics</h4>

            <p className="text-sm text-white/80">See overall class and meta trends</p>

          </div>

          <MetalyticsIcon color="#FFFFFF" />

        </Link>

      </section>



      {/* Footer */}

      <footer className="p-6 mt-8 border-t border-white/10 bg-[#1A1C20] text-center text-white/50 text-sm">

        <p>© 2025 Scrylytics — The Earth Element | Data sourced from HSReplay</p>

      </footer>

    </div>

  )

}
