import { HashRouter } from 'react-router-dom'
import NavRouter from './components/nav/Router'
import Overlays from './overlay'
import { WebSocketListener } from '@src/components/websocketListener'
import { ButtonListener } from './components/ButtonListener'
import ErrorBoundary from '@src/pages/error/ErrorBoundary'
import { SwipeListener } from './components/SwipeListener'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh * 100}px`)
    }

    setVh()
    window.addEventListener('resize', setVh)
    return () => window.removeEventListener('resize', setVh)
  }, [])

  return (
    <HashRouter>
      <ErrorBoundary>
        <WebSocketListener />
        <ButtonListener />
        <SwipeListener />
        <Overlays>
          <NavRouter />
        </Overlays>
      </ErrorBoundary>
    </HashRouter>
  )
}

export default App