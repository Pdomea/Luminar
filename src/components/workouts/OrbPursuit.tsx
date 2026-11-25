import React from "react"

export const OrbPursuit = ({ timeLeft, quote }: { timeLeft: number, quote?: string }) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-gap-6 plasmo-w-full">
      <style>{`
        @keyframes pendulum {
          0%, 100% { transform: translateX(-40vw); }
          50% { transform: translateX(40vw); }
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-animate { animation: none !important; transform: translateX(0) !important; }
        }
      `}</style>
      <span className="plasmo-text-3xl plasmo-text-white plasmo-text-center plasmo-max-w-2xl plasmo-font-semibold plasmo-tracking-tight plasmo-mt-4">
        Follow the orb smoothly with your eyes. Keep your head completely still.
      </span>
      <span className="plasmo-text-2xl plasmo-font-mono plasmo-text-zinc-50 plasmo-mt-2">{timeLeft}</span>
      
      <div className="plasmo-relative plasmo-flex plasmo-items-center plasmo-justify-center plasmo-w-full plasmo-h-32 plasmo-mt-12">
        <div className="plasmo-absolute plasmo-w-[80vw] plasmo-h-[1px] plasmo-bg-white/10" />
        <div 
          className="orb-animate plasmo-w-12 plasmo-h-12 plasmo-rounded-full plasmo-bg-brand-accent plasmo-shadow-[0_0_40px_rgba(229,189,223,1),0_0_80px_rgba(229,189,223,0.6)]"
          style={{ animation: 'pendulum 8s ease-in-out infinite' }}
        />
      </div>
    </div>
  )
}
