'use client'

import { motion } from 'framer-motion'

import { useState, useEffect } from 'react'

export default function OraclePanel({ summary }: { summary?: string }) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!summary) return

    setDisplayText('')
    let i = 0
    const interval = setInterval(() => {
      setDisplayText(prev => summary.slice(0, i))
      i += 2
      if (i > summary.length) clearInterval(interval)
    }, 20)

    return () => clearInterval(interval)
  }, [summary])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='bg-gradient-to-br from-purple-950/80 to-indigo-950/80 border border-purple-600/40 rounded-2xl p-6 mt-6 shadow-md max-w-2xl text-left'
    >
      <h2 className='text-lg font-semibold text-purple-300 mb-2'>Oracle Insight</h2>
      <p className='text-purple-100 leading-relaxed whitespace-pre-line'>
        {displayText || 'Consulting the Oracle...'}
      </p>
    </motion.div>
  )
}








