import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MetricCard from '../ui/MetricCard'
import { Metric, MetricValue } from '../../types'

// Mock data
const mockMetric: Metric = {
  id: 'test-metric',
  name: 'Test Metric',
  shortName: 'Test',
  description: 'A test metric for compliance',
  category: 'Quality',
  unit: 'units',
  target: 100,
  tolerance: 5,
  frequency: 'daily',
  responsible: 'QA Manager',
  calculation: 'manual',
}

const mockValue: MetricValue = {
  id: 'test-value',
  metricId: 'test-metric',
  value: 95,
  timestamp: new Date('2026-01-28'),
  user: 'Test User',
  notes: 'Test measurement',
}

describe('MetricCard', () => {
  it('renders metric information correctly', () => {
    render(
      <MetricCard
        metric={mockMetric}
        value={mockValue}
        status="green"
        trend="improving"
        changePercent={5.2}
      />
    )

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('95.0units')).toBeInTheDocument()
    expect(screen.getByText('+5.2%')).toBeInTheDocument()
  })

  it('displays correct status styling', () => {
    const { rerender } = render(
      <MetricCard
        metric={mockMetric}
        value={mockValue}
        status="green"
        trend="stable"
      />
    )

    // Check green status - find outer card element
    const card = screen.getByText('Test').closest('.card')
    expect(card).toHaveClass('border-l-compliance-green')

    // Check yellow status
    rerender(
      <MetricCard
        metric={mockMetric}
        value={mockValue}
        status="yellow"
        trend="stable"
      />
    )
    expect(screen.getByText('Test').closest('.card')).toHaveClass('border-l-compliance-yellow')

    // Check red status
    rerender(
      <MetricCard
        metric={mockMetric}
        value={mockValue}
        status="red"
        trend="stable"
      />
    )
    expect(screen.getByText('Test').closest('.card')).toHaveClass('border-l-compliance-red')
  })

  it('displays correct trend indicators', () => {
    const { rerender } = render(
      <MetricCard
        metric={mockMetric}
        value={mockValue}
        status="green"
        trend="improving"
        changePercent={5.2}
      />
    )

    // Check improving trend
    expect(screen.getByText('+5.2%')).toBeInTheDocument()

    // Check declining trend
    rerender(
      <MetricCard
        metric={mockMetric}
        value={mockValue}
        status="red"
        trend="declining"
        changePercent={-3.1}
      />
    )
    expect(screen.getByText('-3.1%')).toHaveClass('text-red-600')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()

    render(
      <MetricCard
        metric={mockMetric}
        value={mockValue}
        status="green"
        trend="stable"
        onClick={handleClick}
      />
    )

    const card = screen.getByText('Test').closest('div')
    fireEvent.click(card!)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('displays "--" when value is null', () => {
    render(
      <MetricCard
        metric={mockMetric}
        value={null}
        status="gray"
        trend="stable"
      />
    )

    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('formats values correctly', () => {
    const decimalValue: MetricValue = {
      ...mockValue,
      value: 95.7,
    }

    render(
      <MetricCard
        metric={mockMetric}
        value={decimalValue}
        status="green"
        trend="stable"
      />
    )

    expect(screen.getByText('95.7units')).toBeInTheDocument()
  })
})