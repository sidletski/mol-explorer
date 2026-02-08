import { Provider } from 'react-redux'

import styles from './App.module.scss'
import { store } from './app/store'
import { Home } from './containers/home'

function App() {
  return (
    <Provider store={store}>
      <div className={styles.app}>
        <Home />
      </div>
    </Provider>
  )
}

export default App
