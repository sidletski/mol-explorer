import type { FC } from 'react'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts'

import type { EntryDetail } from '@/features/explore/api'

import styles from './ScatterChart.module.scss'

const METHOD_COLORS: Record<string, string> = {
  'X-RAY DIFFRACTION': '#4ade80',
  'SOLUTION NMR': '#60a5fa',
  'ELECTRON MICROSCOPY': '#f472b6'
}

const DEFAULT_COLOR = '#888'

const NO_DATA_VALUE = 'N/A'

type TooltipProps = {
  active?: boolean
  payload?: { payload: EntryDetail }[]
}

const CustomTooltip: FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null

  const entry = payload[0].payload

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>
        {entry.id} - {entry.title}
      </div>
      <div className={styles.tooltipRow}>
        Method: {entry.experimentalMethod ?? NO_DATA_VALUE}
      </div>
      <div className={styles.tooltipRow}>
        Resolution: {entry.resolution?.toFixed(2) ?? NO_DATA_VALUE} A
      </div>
      <div className={styles.tooltipRow}>
        Weight: {entry.molecularWeight?.toLocaleString() ?? NO_DATA_VALUE} Da
      </div>
      <div className={styles.tooltipRow}>
        Monomers: {entry.polymerMonomerCount ?? NO_DATA_VALUE}
      </div>
    </div>
  )
}

type EntryScatterChartProps = {
  entries: EntryDetail[]
  onEntryClick: (_entry: EntryDetail) => void
}

export const EntryScatterChart: FC<EntryScatterChartProps> = ({
  entries,
  onEntryClick
}) => {
  const plottable = entries.filter(
    (m) => m.resolution !== null && m.molecularWeight !== null
  )

  const grouped = new Map<string, EntryDetail[]>()
  plottable.forEach((entry) => {
    const method = entry.experimentalMethod ?? 'Other'
    const list = grouped.get(method) ?? []
    list.push(entry)
    grouped.set(method, list)
  })

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-color)"
            opacity={0.2}
          />
          <XAxis
            type="number"
            dataKey="molecularWeight"
            name="Molecular Weight"
            unit=" Da"
            tick={{ fontSize: 10 }}
            label={{
              value: 'Molecular Weight (Da)',
              position: 'bottom',
              fontSize: 10,
              fill: 'var(--text-label)'
            }}
          />
          <YAxis
            type="number"
            dataKey="resolution"
            name="Resolution"
            unit=" A"
            tick={{ fontSize: 10 }}
            label={{
              value: 'Resolution (A)',
              angle: -90,
              position: 'insideLeft',
              fontSize: 10,
              fill: 'var(--text-label)'
            }}
          />
          <ZAxis
            type="number"
            dataKey="polymerMonomerCount"
            range={[30, 300]}
            name="Monomer Count"
          />
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          {[...grouped.entries()].map(([method, data]) => (
            <Scatter
              key={method}
              name={method}
              data={data}
              fill={METHOD_COLORS[method] ?? DEFAULT_COLOR}
              fillOpacity={0.7}
              cursor="pointer"
              onClick={(clickedEntry) => {
                if (clickedEntry) {
                  onEntryClick(clickedEntry as unknown as EntryDetail)
                }
              }}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
