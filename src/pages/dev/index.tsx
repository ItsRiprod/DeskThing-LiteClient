import { useState, useEffect, useRef } from "react"
import { Hint } from "@src/components/Hint"
import { useUIStore } from "@src/stores/uiStore"

export const DeveloperPage = () => {
  const setPage = useUIStore((state) => state.setPage)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<{ type: string; message: string }[]>([])
  const listeningRef = useRef(true)

  useEffect(() => {
    if (!loading) {
      listeningRef.current = false
      return
    }

    const handleLog = (type: string) => (...args: any[]) => {
      if (!listeningRef.current) return
      setLogs((prev) => [
        ...prev,
        { type, message: args.map(String).join(" ") },
      ])
    }

    const origLog = window.console.log
    const origWarn = window.console.warn
    const origError = window.console.error

    window.console.log = handleLog("log")
    window.console.warn = handleLog("warn")
    window.console.error = handleLog("error")

    const errorListener = (event: ErrorEvent) => {
      if (!listeningRef.current) return
      setLogs((prev) => [
        ...prev,
        { type: "error", message: event.message },
      ])
    }
    window.addEventListener("error", errorListener)

    return () => {
      window.console.log = origLog
      window.console.warn = origWarn
      window.console.error = origError
      window.removeEventListener("error", errorListener)
    }
  }, [loading])

  const handleGoBack = () => {
    setPage('dashboard')
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <Hint
        flag="developerApp"
        message="Welcome to the developer app. The port is 3000 and cannot be changed yet, so make sure you configure accordingly! This will be changed in the Clients Update"
      />
      <button
        onClick={handleGoBack}
        className="absolute transition-opacity opacity-0 hover:opacity-100 top-0 left-0 bg-neutral-800 border-neutral-500 w-16 h-8 border-b-2 border-r-2 rounded-br-lg"
      />
      {loading && (
        <div className="absolute w-screen h-screen top-0 left-0 flex flex-col items-center justify-center bg-neutral-900 bg-opacity-80 z-50">
          <div className="text-white text-lg mb-2">Loading...</div>
          <div className="w-[90vw] max-h-[60vh] overflow-y-auto bg-neutral-800 rounded p-4 text-sm text-left">
            <div className="font-bold mb-2 text-neutral-300">Logs & Errors:</div>
            <ul className="space-y-1">
              {logs.length === 0 && (
                <li className="text-neutral-400 italic">No logs yet...</li>
              )}
              {logs.map((log, idx) => (
                <li key={idx} className={
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "warn"
                    ? "text-yellow-400"
                    : "text-neutral-200"
                }>
                  [{log.type.toUpperCase()}] {log.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <iframe
        src={`http://localhost:3000/`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Web View"
        height="100%"
        width="100%"
        onLoad={() => setLoading(false)}
      />
      <button
        onClick={handleGoBack}
        className="absolute transition-opacity opacity-0 hover:opacity-100 bottom-0 right-0 bg-neutral-800 border-neutral-500 w-16 h-8 border-t-2 border-l-2 rounded-tl-lg"
      />
    </div>
  )
}