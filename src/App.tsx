import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import styles from './App.module.scss'
import { store } from './app/store'
import { Header } from './components/header'
import { Explore } from './containers/explore'
import { Home } from './containers/home'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className={styles.app}>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
