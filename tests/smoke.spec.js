import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../app/page.jsx'

describe('Home Page Smoke Test', () => {
  it('renders the main heading', () => {
    render(<Home />)
    expect(screen.getByText('🔮 Scrylytics')).toBeInTheDocument()
  })

  it('renders feature links', () => {
    render(<Home />)
    expect(screen.getByText('🧙‍♂️ Decklytics')).toBeInTheDocument()
    expect(screen.getByText('⚔️ Playlytics')).toBeInTheDocument()
    expect(screen.getByText('📊 Metalyzer')).toBeInTheDocument()
  })

  it('renders the version footer', () => {
    render(<Home />)
    expect(screen.getByText(/Scrylytics v/)).toBeInTheDocument()
  })
})
