import { describe, it, expect } from 'vitest'
import {
  cn,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  daysUntil,
  isOverdue,
  getRiskColor,
  getRiskBgColor,
} from '../lib/utils'

describe('cn (className utility)', () => {
  it('merges Tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('handles conflicting classes with twMerge', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('handles conditional classes', () => {
    expect(cn('bg-red-500', true && 'text-white', false && 'hidden')).toBe('bg-red-500 text-white')
  })
})

describe('formatNumber', () => {
  it('formats numbers with default 2 decimal places', () => {
    expect(formatNumber(123.456)).toBe('123.46')
  })

  it('formats numbers with custom decimal places', () => {
    expect(formatNumber(123.456, 3)).toBe('123.456')
  })

  it('formats integers correctly', () => {
    expect(formatNumber(42)).toBe('42.00')
  })
})

describe('formatPercentage', () => {
  it('formats percentages with default 1 decimal place', () => {
    expect(formatPercentage(85.7)).toBe('85.7%')
  })

  it('formats percentages with custom decimal places', () => {
    expect(formatPercentage(85.7, 2)).toBe('85.70%')
  })
})

describe('formatDate', () => {
  it('formats Date objects correctly', () => {
    const date = new Date('2026-01-28')
    expect(formatDate(date)).toBe('Jan 28, 2026')
  })

  it('formats date strings correctly', () => {
    expect(formatDate('2026-01-28')).toBe('Jan 28, 2026')
  })
})

describe('formatDateTime', () => {
  it('formats Date objects with time', () => {
    // Use UTC date to make test deterministic
    const date = new Date(Date.UTC(2026, 0, 28, 14, 30, 0))
    expect(formatDateTime(date)).toBe('1/28/2026, 2:30 PM')
  })

  it('formats date strings with time', () => {
    // Provide explicit UTC string
    expect(formatDateTime('2026-01-28T14:30:00Z')).toContain('1/28/2026')
  })
})

describe('daysUntil', () => {
  it('calculates days until future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    expect(daysUntil(future)).toBe(5)
  })

  it('returns negative for past dates', () => {
    const past = new Date()
    past.setDate(past.getDate() - 3)
    expect(daysUntil(past)).toBe(-3)
  })
})

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    const past = new Date()
    past.setDate(past.getDate() - 1)
    expect(isOverdue(past)).toBe(true)
  })

  it('returns false for future dates', () => {
    const future = new Date()
    future.setDate(future.getDate() + 1)
    expect(isOverdue(future)).toBe(false)
  })
})

describe('Risk color utilities', () => {
  it('getRiskColor returns correct colors', () => {
    expect(getRiskColor('Low')).toBe('text-risk-low')
    expect(getRiskColor('Medium')).toBe('text-risk-medium')
    expect(getRiskColor('High')).toBe('text-risk-high')
    expect(getRiskColor('Critical')).toBe('text-risk-critical')
  })

  it('getRiskBgColor returns correct background colors', () => {
    expect(getRiskBgColor('Low')).toBe('bg-risk-low')
    expect(getRiskBgColor('Medium')).toBe('bg-risk-medium')
    expect(getRiskBgColor('High')).toBe('bg-risk-high')
    expect(getRiskBgColor('Critical')).toBe('bg-risk-critical')
  })
})