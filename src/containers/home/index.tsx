import { type FC, useState } from 'react'

import { Header } from '@/components/header'
import { MolViewer } from '@/components/mol-viewer'
import { Select } from '@/components/select'
import { searchMolecules } from '@/features/search/slice'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import styles from './Home.module.scss'

export const Home: FC = () => {
  const dispatch = useAppDispatch()
  const molecules = useAppSelector((state) => state.search.molecules)
  const hasMore = useAppSelector((state) => state.search.hasMore)
  const status = useAppSelector((state) => state.search.status)
  const [pdb, setPdb] = useState({
    value: '1CRN',
    label: '1CRN - CRAMBIN'
  })

  const options = molecules.map((molecule) => ({
    value: molecule.id,
    label: `${molecule.id} - ${molecule.title}`
  }))

  const handlePdbSearch = useDebouncedCallback((query: string) => {
    if (!query.trim()) {
      return
    }

    dispatch(searchMolecules(query.trim()))
  }, 500)

  const handleLoadMore = () => {
    if (!hasMore || status === 'loading') return
    dispatch(searchMolecules(undefined))
  }

  return (
    <div className={styles.wrapper}>
      <Header />

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
          onChange={setPdb}
          onSearch={handlePdbSearch}
          onLoadMore={handleLoadMore}
          searchable
        />
      </footer>
    </div>
  )
}
