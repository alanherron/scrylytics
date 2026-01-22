'use client'

import React from 'react'
import Image from 'next/image'

import { DecklyticsIcon, CardlyticsIcon, PlaylyticsIcon, MetalyticsIcon } from '@/components/icons/scrylytics-icons'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'



export default function DecklyticsPage() {



  const deckData = [

    { name: 'Aggro Pally', winrate: 61 },

    { name: 'Control DK', winrate: 54 },

    { name: 'Spell Mage', winrate: 58 },

    { name: 'Ramp Druid', winrate: 50 },

  ]



  const archetypeData = [

    { name: 'Aggro', value: 35 },

    { name: 'Control', value: 25 },

    { name: 'Combo', value: 20 },

    { name: 'Midrange', value: 20 },

  ]



  const COLORS = ['#0288D1', '#26C6DA', '#00ACC1', '#4DD0E1']



  return (

    <div className="min-h-screen bg-[#0F1114] text-white">

      {/* Header */}

      <header className="border-b border-white/10 p-6 bg-gradient-to-r from-[#0288D1] to-[#26C6DA] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">

        <div className="flex items-center gap-3">

          <DecklyticsIcon color="#FFFFFF" />

          <h1 className="text-3xl font-bold tracking-tight">Decklytics</h1>

        </div>

        <input

          type="text"

          placeholder="Search decks..."

          className="bg-black/30 px-4 py-2 rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-[#26C6DA]"

        />

        <div className="flex items-center gap-2 md:gap-4">

          <button className="text-sm bg-white/10 px-3 py-2 rounded hover:bg-white/20">Top 1000 Legend</button>

          <button className="text-sm bg-white/10 px-3 py-2 rounded hover:bg-white/20">Diamond</button>

          <button className="text-sm bg-white/10 px-3 py-2 rounded hover:bg-white/20">Platinum</button>

        </div>

      </header>



      {/* Hero Section */}

      <section className="relative p-8 bg-[#1A1C20] flex flex-col lg:flex-row items-center justify-between gap-8">

        <div className="w-full lg:w-1/2">

          <h2 className="text-2xl font-semibold mb-2">Featured Deck</h2>

          <p className="text-white/70 mb-6">High-performing deck this week</p>

          <div className="bg-gradient-to-br from-[#0288D1] to-[#26C6DA] p-4 rounded-xl shadow-xl max-w-sm">

            <Image src="/images/sample-deck.png" alt="Featured Deck" width={300} height={420} className="rounded-lg shadow-md w-full" />

          </div>

        </div>

        <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="p-4 bg-black/30 rounded-lg text-center">

            <p className="text-sm text-white/60">Win Rate</p>

            <p className="text-2xl font-semibold">61.4%</p>

          </div>

          <div className="p-4 bg-black/30 rounded-lg text-center">

            <p className="text-sm text-white/60">Games Tracked</p>

            <p className="text-2xl font-semibold">48,292</p>

          </div>

          <div className="p-4 bg-black/30 rounded-lg text-center">

            <p className="text-sm text-white/60">Avg. Game Length</p>

            <p className="text-2xl font-semibold">7.2 min</p>

          </div>

        </div>

      </section>



      {/* Charts Section */}

      <section className="p-8 bg-[#0F1114] grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-[#1A1C20] p-6 rounded-xl border border-white/5">

          <h3 className="text-lg font-semibold mb-4">Top Deck Winrates</h3>

          <ResponsiveContainer width="100%" height={250}>

            <BarChart data={deckData}>

              <XAxis dataKey="name" stroke="#aaa" />

              <YAxis stroke="#aaa" />

              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} />

              <Bar dataKey="winrate" fill="#26C6DA" radius={[6, 6, 0, 0]} />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="bg-[#1A1C20] p-6 rounded-xl border border-white/5">

          <h3 className="text-lg font-semibold mb-4">Archetype Distribution</h3>

          <ResponsiveContainer width="100%" height={250}>

            <PieChart>

              <Pie

                data={archetypeData}

                cx="50%"

                cy="50%"

                labelLine={false}

                outerRadius={100}

                fill="#8884d8"

                dataKey="value"

              >

                {archetypeData.map((entry, index) => (

                  <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </section>



      {/* Related Insights */}

      <section className="p-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <div className="bg-gradient-to-r from-[#388E3C] to-[#8BC34A] p-5 rounded-xl flex items-center justify-between">

          <div>

            <h4 className="text-lg font-semibold">Cardlytics</h4>

            <p className="text-sm text-white/80">Dive into card-level analysis</p>

          </div>

          <CardlyticsIcon color="#FFFFFF" />

        </div>

        <div className="bg-gradient-to-r from-[#E53935] to-[#FF7043] p-5 rounded-xl flex items-center justify-between">

          <div>

            <h4 className="text-lg font-semibold">Playlytics</h4>

            <p className="text-sm text-white/80">Explore in-game performance patterns</p>

          </div>

          <PlaylyticsIcon color="#FFFFFF" />

        </div>

        <div className="bg-gradient-to-r from-[#6A1B9A] to-[#9C27B0] p-5 rounded-xl flex items-center justify-between">

          <div>

            <h4 className="text-lg font-semibold">Metalytics</h4>

            <p className="text-sm text-white/80">Meta overview and class statistics</p>

          </div>

          <MetalyticsIcon color="#FFFFFF" />

        </div>

      </section>



      {/* Footer */}

      <footer className="p-6 mt-8 border-t border-white/10 bg-[#1A1C20] text-center text-white/50 text-sm">

        <p>© 2025 Scrylytics — The Water Element | Data sourced from HSReplay</p>

      </footer>

    </div>

  )

}
