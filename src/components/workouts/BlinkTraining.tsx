import React from "react"

export const BlinkTraining = ({ timeLeft }: { timeLeft: number }) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-gap-6">
      <span className="plasmo-text-3xl plasmo-text-white plasmo-text-center plasmo-max-w-2xl plasmo-font-semibold plasmo-tracking-tight plasmo-mt-4">
        Blink deeply with the circle.
      </span>
      <style>{`
        @keyframes blink-ping {
          0% { transform: scale(0.8); opacity: 1; }
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
      <div className="plasmo-relative plasmo-flex plasmo-items-center plasmo-justify-center plasmo-w-48 plasmo-h-48 plasmo-mt-4">
        <div 
          className="plasmo-absolute plasmo-w-32 plasmo-h-32 plasmo-rounded-full plasmo-bg-brand-accent/20 plasmo-border-2 plasmo-border-brand-accent plasmo-shadow-[0_0_40px_rgba(229,189,223,0.8),inset_0_0_20px_rgba(229,189,223,0.5)] motion-reduce:plasmo-animate-none" 
          style={{ animation: 'blink-ping 4s cubic-bezier(0, 0, 0.2, 1) infinite' }}
        />
        <span className="plasmo-absolute plasmo-text-4xl plasmo-font-mono plasmo-text-zinc-50">{timeLeft}</span>
      </div>
    </div>
  )
}
