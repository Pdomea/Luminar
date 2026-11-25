import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16
  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (_match, remValue) => {
    return `${parseFloat(remValue) * baseFontSize}px`
  })
  const styleElement = document.createElement("style")
  styleElement.textContent = updatedCssText
  return styleElement
}

import { useStorage } from "@plasmohq/storage/hook"
import { DistanceGaze } from "./components/workouts/DistanceGaze"
import { BlinkTraining } from "./components/workouts/BlinkTraining"
import { OrbPursuit } from "./components/workouts/OrbPursuit"
import { InfinityTracking } from "./components/workouts/InfinityTracking"
import { CornerTracking } from "./components/workouts/CornerTracking"
import { LongBreak } from "./components/workouts/LongBreak"
import { getQuoteForPause } from "./lib/quotes"

const CIRCLE_SIZE = 88

const StealthHUD = () => {
  const [status] = useStorage<string>("luminar_engine_state", "IDLE")
  const [endTime] = useStorage<number | null>("luminar_engine_endTime", null)
  const [meetingMode, setMeetingMode] = useStorage<boolean>("luminar_meeting_mode_active", false)
  const [pauseCount] = useStorage<number>("luminar_pause_count", 1)
  const [blueLight, setBlueLight] = useStorage<boolean>("luminar_bluelight_active", false)

  const [timeLeft, setTimeLeft] = useState(0)
  const [pos, setPos] = useState({
    x: window.innerWidth - CIRCLE_SIZE - 24,
    y: window.innerHeight - CIRCLE_SIZE - 24
  })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Hold-to-skip state
  const skipTimeout = useRef<NodeJS.Timeout | null>(null)
  const [isSkipping, setIsSkipping] = useState(false)

  // Auto-Detection for Meeting Mode
  useEffect(() => {
    const isMeetingUrl = window.location.hostname.includes("meet.google.com") || 
                         window.location.hostname.includes("zoom.us") || 
                         window.location.hostname.includes("teams.microsoft.com") || 
                         window.location.hostname.includes("webex.com")
    
    if (isMeetingUrl) {
      setMeetingMode(true)
    }

    const onFullscreen = () => {
      if (document.fullscreenElement) {
        setMeetingMode(true)
      }
    }
    document.addEventListener("fullscreenchange", onFullscreen)
    return () => document.removeEventListener("fullscreenchange", onFullscreen)
  }, [])

  // Countdown
  useEffect(() => {
    if (status === "IDLE" || !endTime) {
      setTimeLeft(0)
      return
    }
    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0 && status === "RECOVERY_MODE") {
        chrome.runtime.sendMessage({ action: "END_RECOVERY" })
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [status, endTime])

  // Drag — mousemove on host document so it works outside Shadow DOM
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({
        x: Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - CIRCLE_SIZE),
        y: Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - CIRCLE_SIZE)
      })
    }
    const onUp = () => { dragging.current = false }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  const isActive = status !== "IDLE"
  const isBreak = status === "RECOVERY_MODE"
  const isWarning = status === "WARNING_MODE"

  if (!isActive) return null

  const startSkip = () => {
    setIsSkipping(true)
    skipTimeout.current = setTimeout(() => {
      chrome.runtime.sendMessage({ action: "SKIP_RECOVERY" })
      setIsSkipping(false)
    }, 1000)
  }

  const cancelSkip = () => {
    setIsSkipping(false)
    if (skipTimeout.current) clearTimeout(skipTimeout.current)
  }

  return (
    <>
      {/* Break Mode (Visual Hijack & Workout UI) */}
      <div
        className={`plasmo-fixed plasmo-inset-0 plasmo-z-[999998] plasmo-font-sans plasmo-bg-brand-bg/90 plasmo-backdrop-blur-xl plasmo-transition-opacity plasmo-duration-[1500ms] plasmo-ease-in-out ${
          isBreak ? "plasmo-opacity-100 plasmo-pointer-events-auto" : "plasmo-opacity-0 plasmo-pointer-events-none"
        }`}
      >
        {isBreak && (
          <div className="plasmo-w-full plasmo-h-full plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center" style={{ animation: 'fadeIn 1.5s ease-in-out forwards' }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
            
            {/* Global Progress Bar for all breaks */}
            <div className="plasmo-fixed plasmo-top-0 plasmo-left-0 plasmo-h-1 plasmo-bg-white/5 plasmo-w-full plasmo-overflow-hidden plasmo-z-[999999]">
              <div 
                className="plasmo-h-full plasmo-bg-brand-accent plasmo-shadow-[0_0_15px_rgba(229,189,223,0.8)] plasmo-transition-all plasmo-duration-1000 plasmo-ease-linear motion-reduce:plasmo-transition-none"
                style={{ width: `${(( (pauseCount % 4 === 0 ? 90 : 60) - timeLeft) / (pauseCount % 4 === 0 ? 90 : 60)) * 100}%` }}
              />
            </div>
            
            {/* Global Quote (Persists across phases) */}
            <div className="plasmo-fixed plasmo-top-32 plasmo-w-full plasmo-flex plasmo-justify-center plasmo-z-[999999] plasmo-px-8">
              <span className="plasmo-text-white/90 plasmo-font-sans plasmo-font-medium plasmo-text-center plasmo-max-w-2xl plasmo-text-2xl plasmo-leading-relaxed plasmo-tracking-tight">
                "{getQuoteForPause(pauseCount || 1)}"
              </span>
            </div>

            {/* 60s Structured Framework: 18s Distance -> 2s Pause -> 18s Dynamic -> 2s Pause -> 20s Blink */}
            {pauseCount % 4 !== 0 && (
              <div className="plasmo-w-full plasmo-h-full plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-pt-24">
                {timeLeft > 42 && <DistanceGaze timeLeft={timeLeft - 42} />}
                {timeLeft <= 42 && timeLeft > 40 && (
                  <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-gap-4 plasmo-animate-pulse">
                    <span className="plasmo-text-xl plasmo-text-zinc-500 plasmo-font-medium plasmo-tracking-widest plasmo-uppercase">
                      Recalibrate
                    </span>
                    <span className="plasmo-text-4xl plasmo-font-mono plasmo-text-zinc-400">{timeLeft}</span>
                  </div>
                )}
                {timeLeft <= 40 && timeLeft > 22 && pauseCount % 4 === 1 && <OrbPursuit timeLeft={timeLeft - 22} />}
                {timeLeft <= 40 && timeLeft > 22 && pauseCount % 4 === 2 && <InfinityTracking timeLeft={timeLeft - 22} />}
                {timeLeft <= 40 && timeLeft > 22 && pauseCount % 4 === 3 && <CornerTracking timeLeft={timeLeft - 22} />}
                {timeLeft <= 22 && timeLeft > 20 && (
                  <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-gap-4 plasmo-animate-pulse">
                    <span className="plasmo-text-xl plasmo-text-zinc-500 plasmo-font-medium plasmo-tracking-widest plasmo-uppercase">
                      Recalibrate
                    </span>
                    <span className="plasmo-text-4xl plasmo-font-mono plasmo-text-zinc-400">{timeLeft}</span>
                  </div>
                )}
                {timeLeft <= 20 && <BlinkTraining timeLeft={timeLeft} />}
              </div>
            )}
            
            {/* 90s Long Break */}
            {pauseCount % 4 === 0 && (
              <div className="plasmo-w-full plasmo-h-full plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-pt-24">
                <LongBreak timeLeft={timeLeft} />
              </div>
            )}
            
            {/* Phase Indicators at the bottom */}
            <div className="plasmo-fixed plasmo-bottom-28 plasmo-flex plasmo-gap-4 plasmo-z-[999999]">
              <div className={`plasmo-w-2 plasmo-h-2 plasmo-rounded-full plasmo-transition-colors ${pauseCount % 4 === 1 ? 'plasmo-bg-brand-accent plasmo-shadow-[0_0_10px_rgba(229,189,223,0.8)]' : 'plasmo-bg-white/20'}`} />
              <div className={`plasmo-w-2 plasmo-h-2 plasmo-rounded-full plasmo-transition-colors ${pauseCount % 4 === 2 ? 'plasmo-bg-brand-accent plasmo-shadow-[0_0_10px_rgba(229,189,223,0.8)]' : 'plasmo-bg-white/20'}`} />
              <div className={`plasmo-w-2 plasmo-h-2 plasmo-rounded-full plasmo-transition-colors ${pauseCount % 4 === 3 ? 'plasmo-bg-brand-accent plasmo-shadow-[0_0_10px_rgba(229,189,223,0.8)]' : 'plasmo-bg-white/20'}`} />
              <div className={`plasmo-w-2 plasmo-h-2 plasmo-rounded-full plasmo-transition-colors ${pauseCount % 4 === 0 ? 'plasmo-bg-brand-accent plasmo-shadow-[0_0_10px_rgba(229,189,223,0.8)]' : 'plasmo-bg-white/20'}`} />
            </div>

            {/* Hold to Skip Button (F2) */}
            <button
              onMouseDown={startSkip}
              onMouseUp={cancelSkip}
              onMouseLeave={cancelSkip}
              className="plasmo-fixed plasmo-bottom-12 plasmo-left-1/2 -plasmo-translate-x-1/2 plasmo-px-6 plasmo-py-3 plasmo-rounded-full plasmo-border plasmo-border-white/20 plasmo-bg-black/50 plasmo-text-zinc-400 plasmo-font-medium plasmo-text-sm hover:plasmo-text-white plasmo-transition-colors plasmo-overflow-hidden plasmo-z-[999999]"
            >
              <div 
                className="plasmo-absolute plasmo-inset-0 plasmo-bg-brand-accent/20 plasmo-origin-left"
                style={{ 
                  transform: `scaleX(${isSkipping ? 1 : 0})`,
                  transition: isSkipping ? 'transform 1s linear' : 'transform 0.2s ease-out'
                }}
              />
              <span className="plasmo-relative plasmo-z-10">Hold to skip</span>
            </button>
          </div>
        )}
      </div>

      {/* The Stealth HUD */}
      <div
        className={`plasmo-fixed plasmo-z-[999999] plasmo-font-sans plasmo-transition-all plasmo-duration-700 ${
          isBreak ? "plasmo-opacity-0 plasmo-scale-90 plasmo-pointer-events-none" : "plasmo-opacity-100 plasmo-scale-100"
        }`}
        style={{ left: pos.x, top: pos.y, width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
      >
        <div
          onMouseDown={onMouseDown}
          className="plasmo-relative plasmo-w-full plasmo-h-full plasmo-rounded-full plasmo-bg-brand-bg/90 plasmo-backdrop-blur-2xl plasmo-border plasmo-border-white/5 plasmo-shadow-2xl plasmo-shadow-black/70 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-select-none plasmo-gap-1 plasmo-cursor-grab"
          style={{ borderTopColor: "rgba(255,255,255,0.1)" }}
        >
          {/* Shield Button (F1) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const newMode = !meetingMode
              setMeetingMode(newMode)
              if (!newMode && isWarning) {
                chrome.runtime.sendMessage({ action: "RESUME_FROM_MEET" })
              }
            }}
            className={`plasmo-absolute -plasmo-top-2 -plasmo-right-2 plasmo-w-6 plasmo-h-6 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-border plasmo-transition-all plasmo-duration-200 ${
              meetingMode 
                ? "plasmo-bg-amber-500 plasmo-border-amber-400 plasmo-text-white plasmo-shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                : "plasmo-bg-brand-bg plasmo-border-zinc-800 plasmo-text-zinc-500 hover:plasmo-bg-zinc-800"
            }`}
            title={meetingMode ? "Meeting Mode: Active (Hijack delayed)" : "Meeting Mode: Off"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </button>

          {/* Indicator Dot */}
          <span
            className={`plasmo-w-1.5 plasmo-h-1.5 plasmo-rounded-full plasmo-animate-pulse plasmo-transition-colors plasmo-duration-500 ${
              isWarning ? "plasmo-bg-amber-500" : "plasmo-bg-sky-400"
            }`}
          />

          {/* Blue Light Toggle (F-B) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setBlueLight(!blueLight)
            }}
            className={`plasmo-absolute -plasmo-bottom-2 -plasmo-left-2 plasmo-w-6 plasmo-h-6 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-border plasmo-transition-all plasmo-duration-200 ${
              blueLight 
                ? "plasmo-bg-orange-500 plasmo-border-orange-400 plasmo-text-white plasmo-shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                : "plasmo-bg-brand-bg plasmo-border-zinc-800 plasmo-text-zinc-500 hover:plasmo-bg-zinc-800"
            }`}
            title={blueLight ? "Blue Light Filter: On" : "Blue Light Filter: Off"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          {/* Timer Typography */}
          <span className="plasmo-font-mono plasmo-tabular-nums plasmo-leading-none plasmo-tracking-tight plasmo-text-[15px] plasmo-text-zinc-50">
            {meetingMode ? "MEET" : formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </>
  )
}

export default StealthHUD
