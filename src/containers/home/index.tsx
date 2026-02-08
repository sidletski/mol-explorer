import { type FC, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { MolViewer } from '@/components/mol-viewer'
import { Select } from '@/components/select'
import { searchEntries } from '@/features/search/slice'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import styles from './Home.module.scss'

const defaultPdb = {
  value: '1CRN',
  label: '1CRN - CRAMBIN'
}

export const Home: FC = () => {
  const dispatch = useAppDispatch()
  const entries = useAppSelector((state) => state.search.entries)
  const hasMore = useAppSelector((state) => state.search.hasMore)
  const status = useAppSelector((state) => state.search.status)
  const [searchParams] = useSearchParams()
  const queryId = searchParams.get('pdb')
  const queryTitle = searchParams.get('title')
  const [pdb, setPdb] = useState(
    queryId && queryTitle
      ? {
          value: queryId,
          label: `${queryId} - ${queryTitle}`
        }
      : defaultPdb
  )

  const options = entries.map((entry) => ({
    value: entry.id,
    label: entry.title ? `${entry.id} - ${entry.title}` : entry.id
  }))

  const handlePdbSearch = useDebouncedCallback((query: string) => {
    if (!query.trim()) {
      return
    }

    dispatch(searchEntries(query.trim()))
  }, 500)

  const handleLoadMore = () => {
    if (!hasMore || status === 'loading') return
    dispatch(searchEntries(undefined))
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.viewer}>
          <MolViewer pdbId={pdb.value} />
        </div>
      </div>

      <footer className={styles.footer}>
        <Select
          label="PDB id"
          value={pdb}
          options={options}
          className={styles.select}
          loading={status === 'loading'}
          placement="top-start"
          onChange={setPdb}
          onSearch={handlePdbSearch}
          onLoadMore={handleLoadMore}
          searchable
        />
      </footer>
    </div>
  )
}
