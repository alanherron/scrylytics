import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scrylytics',
  description: 'AI-powered deck analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
