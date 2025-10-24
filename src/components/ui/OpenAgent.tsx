import { useVoiceAgentStore } from '../../stores/voiceAgentStore'

export default function OpenAgent(): JSX.Element {
    const toggle = useVoiceAgentStore((s) => s.toggleVoiceAgent)

    return (
        <button
            onClick={toggle}
            title="Open voice agent"
            aria-label="Open voice agent"
            className="inline-flex items-center gap-2 px-2 py-1 rounded-lg text-sm leading-none cursor-pointer bg-white/10 text-white border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
        >
            <span className="font-semibold">Open Voice Agent</span>
        </button>
    )
}
