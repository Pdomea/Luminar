import React from "react"

export const CornerTracking = ({ timeLeft }: { timeLeft: number }) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-gap-6 plasmo-w-full">
      <span className="plasmo-text-3xl plasmo-text-white plasmo-text-center plasmo-max-w-2xl plasmo-font-semibold plasmo-tracking-tight plasmo-mt-4">
        Follow the orb to the corners.
      </span>
      <span className="plasmo-text-2xl plasmo-font-mono plasmo-text-zinc-50 plasmo-mt-2">{timeLeft}</span>
      
      <style>{`
        @keyframes corner-x {
          0%   { transform: translate(0, 0); }
          12.5% { transform: translate(35vw, -25vh); }
          25%  { transform: translate(0, 0); }
          37.5% { transform: translate(-35vw, 25vh); }
          50%  { transform: translate(0, 0); }
          62.5% { transform: translate(-35vw, -25vh); }
          75%  { transform: translate(0, 0); }
          87.5% { transform: translate(35vw, 25vh); }
          100% { transform: translate(0, 0); }
        }
        .corner-animate {
          animation: corner-x 10s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .corner-animate { animation: none !important; transform: translate(0, 0) !important; }
        }
      `}</style>

      <div className="plasmo-relative plasmo-flex plasmo-items-center plasmo-justify-center plasmo-w-full plasmo-h-[60vh] plasmo-mt-12">
        <div 
          className="corner-animate plasmo-w-16 plasmo-h-16 plasmo-rounded-full plasmo-bg-brand-accent plasmo-shadow-[0_0_40px_rgba(229,189,223,1),0_0_80px_rgba(229,189,223,0.6)]"
        />
      </div>
    </div>
  )
}
