import { useVoiceAgentStore } from "@src/stores/voiceAgentStore"
import { FC, useEffect } from "react"

export const StoreInitializer: FC = () => {
  const initAgent = useVoiceAgentStore((s) => s.init)
  const agentInitialized = useVoiceAgentStore((s) => s.initialized)

  useEffect(() => {
    if (!agentInitialized) {
      initAgent().catch((err) => {
        console.error("Error initializing voice agent:", err)
      })
    }
  }, [agentInitialized, initAgent])

  return null
}