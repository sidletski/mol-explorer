import { useState } from 'react'

import styles from './App.module.scss'
import { SelectBox } from './components/controls'
import { Header } from './components/header'
import { MolViewer } from './components/mol-viewer'

const PDB_OPTIONS = [
  { value: '1CRN', label: '1CRN - Crambin' },
  { value: '1MBO', label: '1MBO - Myoglobin' },
  { value: '2PTC', label: '2PTC - Trypsin' },
  { value: '1HHO', label: '1HHO - Hemoglobin' },
  { value: '3HTB', label: '3HTB - Insulin' },
  { value: '1BNA', label: '1BNA - DNA B-form' },
  { value: '4HHB', label: '4HHB - Hemoglobin' },
  { value: '1GFL', label: '1GFL - GFP' },
  { value: '2AW7', label: '2AW7 - Ubiquitin' },
  { value: '1L2Y', label: '1L2Y - Trp-cage' }
]

function App() {
  const [pdbId, setPdbId] = useState('1CRN')

  const handlePdbChange = (value: string) => {
    setPdbId(value)
  }

  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.main}>
        <div className={styles.viewer}>
          <MolViewer pdbId={pdbId} />
        </div>
      </div>

      <footer className={styles.footer}>
        <SelectBox
          label="PDB id"
          value={pdbId}
          options={PDB_OPTIONS}
          onChange={handlePdbChange}
        />
      </footer>
    </div>
  )
}

export default App
