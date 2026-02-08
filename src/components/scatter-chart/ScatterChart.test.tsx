import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { EntryDetail } from '@/features/explore/api'

import { EntryScatterChart } from './index'

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
)

// ResponsiveContainer needs real dimensions — in jsdom there's no layout engine,
// so we mock it to clone the chart child with explicit width/height
vi.mock('recharts', async (importOriginal) => {
  const { cloneElement } = await import('react')
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('recharts')>()
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) => (
      <div>
        {cloneElement(children, { width: 500, height: 400 } as Record<
          string,
          unknown
        >)}
      </div>
    )
  }
})

const makeEntry = (
  overrides: Partial<EntryDetail> = {}
): EntryDetail => ({
  id: '1CRN',
  title: 'CRAMBIN',
  resolution: 1.5,
  molecularWeight: 4730,
  experimentalMethod: 'X-RAY DIFFRACTION',
  polymerMonomerCount: 46,
  ...overrides
})

describe('EntryScatterChart', () => {
  it('renders without crashing with empty data', () => {
    const { container } = render(
      <EntryScatterChart entries={[]} onEntryClick={vi.fn()} />
    )

    expect(container.querySelector('.wrapper')).toBeInTheDocument()
  })

  it('renders scatter dots for plottable entries', () => {
    const entries = [
      makeEntry(),
      makeEntry({
        id: '4HHB',
        title: 'HEMOGLOBIN',
        resolution: 1.74,
        molecularWeight: 64742
      })
    ]

    const { container } = render(
      <EntryScatterChart entries={entries} onEntryClick={vi.fn()} />
    )

    const dots = container.querySelectorAll('.recharts-scatter-symbol')
    expect(dots).toHaveLength(2)
  })

  it('filters out entries with null resolution or weight', () => {
    const entries = [
      makeEntry(),
      makeEntry({ id: '2MBW', resolution: null }),
      makeEntry({ id: '3ABC', molecularWeight: null })
    ]

    const { container } = render(
      <EntryScatterChart entries={entries} onEntryClick={vi.fn()} />
    )

    // Only the first entry (1CRN) is plottable
    const dots = container.querySelectorAll('.recharts-scatter-symbol')
    expect(dots).toHaveLength(1)
  })

  it('groups entries by experimental method into separate scatter series', () => {
    const entries = [
      makeEntry({ id: '1CRN', experimentalMethod: 'X-RAY DIFFRACTION' }),
      makeEntry({
        id: '2MBW',
        experimentalMethod: 'SOLUTION NMR',
        resolution: 0.5,
        molecularWeight: 12000
      }),
      makeEntry({
        id: '3ABC',
        experimentalMethod: 'X-RAY DIFFRACTION',
        resolution: 2.0,
        molecularWeight: 50000
      })
    ]

    const { container } = render(
      <EntryScatterChart entries={entries} onEntryClick={vi.fn()} />
    )

    // 2 methods = 2 Scatter series
    const scatterGroups = container.querySelectorAll('.recharts-scatter')
    expect(scatterGroups).toHaveLength(2)

    // 3 total dots
    const dots = container.querySelectorAll('.recharts-scatter-symbol')
    expect(dots).toHaveLength(3)
  })

  it('uses "Other" group for entries with null experimentalMethod', () => {
    const entries = [
      makeEntry({ id: '1CRN', experimentalMethod: null }),
      makeEntry({
        id: '2MBW',
        experimentalMethod: null,
        resolution: 2.0,
        molecularWeight: 20000
      })
    ]

    const { container } = render(
      <EntryScatterChart entries={entries} onEntryClick={vi.fn()} />
    )

    // Both go into the "Other" group = 1 scatter series
    const scatterGroups = container.querySelectorAll('.recharts-scatter')
    expect(scatterGroups).toHaveLength(1)

    const dots = container.querySelectorAll('.recharts-scatter-symbol')
    expect(dots).toHaveLength(2)
  })
})
