import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

import { MoleculeIcon } from '../icons'
import styles from './Header.module.scss'

export const Header = () => {
  return (
    <header className={styles.header}>
      <MoleculeIcon />
      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.active : ''}`
          }
        >
          Viewer
        </NavLink>
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            clsx({
              [styles.navLink]: true,
              [styles.active]: isActive
            })
          }
        >
          Explorer
        </NavLink>
      </nav>
    </header>
  )
}
