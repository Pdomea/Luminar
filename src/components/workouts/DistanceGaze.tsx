import React from "react"

export const DistanceGaze = ({ timeLeft, quote }: { timeLeft: number, quote?: string }) => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-gap-6">
      <span className="plasmo-text-3xl plasmo-text-white plasmo-text-center plasmo-max-w-2xl plasmo-font-semibold plasmo-tracking-tight plasmo-mt-4">
        Look at the furthest point in the room.
      </span>
      <div className="plasmo-relative plasmo-flex plasmo-items-center plasmo-justify-center plasmo-mt-8">
        <svg className="plasmo-w-32 plasmo-h-32 -plasmo-rotate-90 plasmo-overflow-visible" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="plasmo-text-white/10" />
          
          {/* Glow Circle */}
          <circle 
            cx="64" 
            cy="64" 
            r="60" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="transparent" 
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={2 * Math.PI * 60 * (1 - timeLeft / 18)}
            className="plasmo-text-brand-accent plasmo-transition-all plasmo-duration-1000 plasmo-ease-linear motion-reduce:plasmo-transition-none plasmo-blur-md plasmo-opacity-80" 
          />
          
          {/* Main Circle */}
          <circle 
            cx="64" 
            cy="64" 
            r="60" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="transparent" 
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={2 * Math.PI * 60 * (1 - timeLeft / 18)}
            className="plasmo-text-brand-accent plasmo-transition-all plasmo-duration-1000 plasmo-ease-linear motion-reduce:plasmo-transition-none" 
          />
        </svg>
        <span className="plasmo-absolute plasmo-text-4xl plasmo-font-mono plasmo-text-zinc-50">{timeLeft}</span>
      </div>
    </div>
  )
}
