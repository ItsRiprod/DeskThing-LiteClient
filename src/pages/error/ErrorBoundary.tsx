/**
 * @file ErrorBoundry.tsx
 * @description Error Boundary component for handling errors in the application.
 * @author Riprod
 * @version 0.8.0
*/
import Logger from '@src/utils/Logger'
import React, { ErrorInfo, ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage?: string
}

/**
 * Provides an error boundary component to handle errors in the application.
 * 
 * The `ErrorBoundary` component is a React component that acts as a boundary for catching and handling errors that occur in its child components. When an error occurs, it will display a fallback UI instead of the normal application content.
 * 
 * The `ErrorScreen` component is a functional component that is rendered when an error occurs. It displays the error message and provides a button to reload the page and clear the cache.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error) {
    Logger.error('Encountered an error: ', error)
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service
    Logger.error('Uncaught error:', error, errorInfo)

    // Update the state with the error message
    this.setState({ errorMessage: error.message })
  }

  render() {
    if (this.state.hasError) {
      // Pass the error message to the ErrorScreen component
      return <ErrorScreen message={this.state.errorMessage || 'An unknown error occurred.'} />
    }

    return this.props.children
  }
}

export default ErrorBoundary

interface ErrorScreenProps {
  message: string
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Set up the interval to navigate to home page every 30 seconds
    const timer = setInterval(() => {
      clearCache()
    }, 30000) // 30000 milliseconds = 30 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(timer)
  }, [])

  const clearCache = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="bg-zinc-800 w-screen h-screen flex justify-center items-center">
      <div className="text-white font-geist">
        <h1 className="text-4xl text-red-300">Oops! Something went wrong.</h1>
        <p className="font-geistMono">{message}</p>
        <p className="font-geistMono italic text-gray-500">Location: {pathname}</p>
        <div className="w-full flex justify-center pt-5">
          <button
            onClick={clearCache}
            className="p-5 justify-self-center border-sky-400 border rounded-lg hover:bg-sky-400 hover:text-black"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  )
}
