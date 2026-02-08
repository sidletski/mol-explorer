import clsx from 'clsx'
import { type FC, type UIEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EntryScatterChart } from '@/components/scatter-chart'
import type { EntryDetail } from '@/features/explore/api'
import { exploreEntries } from '@/features/explore/slice'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import styles from './Explore.module.scss'

export const Explore: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const entries = useAppSelector((state) => state.explore.entries)
  const status = useAppSelector((state) => state.explore.status)
  const hasMore = useAppSelector((state) => state.explore.hasMore)

  const handleSearch = useDebouncedCallback((query: string) => {
    if (!query.trim()) return
    dispatch(exploreEntries(query.trim()))
  }, 500)

  const handleLoadMore = () => {
    if (!hasMore || status === 'loading') return
    dispatch(exploreEntries(undefined))
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 20) {
      handleLoadMore()
    }
  }

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el || !hasMore || status === 'loading') return
    if (el.scrollHeight <= el.clientHeight) {
      dispatch(exploreEntries(undefined))
    }
  }, [entries, hasMore, status, dispatch])

  const [mobileView, setMobileView] = useState<'list' | 'chart'>('list')

  const handleEntryClick = (entry: EntryDetail) => {
    navigate(`/?pdb=${entry.id}&title=${encodeURIComponent(entry.title)}`)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.viewToggle}>
        <button
          className={clsx(styles.toggleButton, mobileView === 'list' && styles.toggleButtonActive)}
          onClick={() => setMobileView('list')}
        >
          List
        </button>
        <button
          className={clsx(styles.toggleButton, mobileView === 'chart' && styles.toggleButtonActive)}
          onClick={() => setMobileView('chart')}
        >
          Chart
        </button>
      </div>
      <div className={clsx(styles.sidebar, mobileView === 'chart' && styles.hiddenOnMobile)}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search entries..."
            className={styles.searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div ref={listRef} className={styles.listContainer} onScroll={handleScroll}>
          {entries.length > 0 ? (
            <ul className={styles.list}>
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className={styles.listItem}
                  onClick={() => handleEntryClick(entry)}
                >
                  <div className={styles.listItemId}>{entry.id}</div>
                  <div className={styles.listItemTitle}>{entry.title}</div>
                  <div className={styles.listItemMeta}>
                    {entry.experimentalMethod ?? 'N/A'}
                    {entry.resolution !== null &&
                      ` · ${entry.resolution.toFixed(2)} A`}
                    {entry.molecularWeight !== null &&
                      ` · ${entry.molecularWeight.toLocaleString()} Da`}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              {status === 'loading'
                ? 'Searching...'
                : 'Search for entries to explore'}
            </div>
          )}
        </div>
      </div>
      <div className={clsx(styles.chart, mobileView === 'list' && styles.hiddenOnMobile)}>
        <EntryScatterChart
          entries={entries}
          onEntryClick={handleEntryClick}
        />
      </div>
    </div>
  )
}
