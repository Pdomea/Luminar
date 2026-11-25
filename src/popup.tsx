import { useEffect, useState } from "react"
import "~style.css"
import { useStorage } from "@plasmohq/storage/hook"

type Tab = "PROTOCOL" | "SETTINGS" | "STATS"

function IndexPopup() {
  const [activeTab, setActiveTab] = useState<Tab>("PROTOCOL")

  const [status] = useStorage<string>("luminar_engine_state", "IDLE")
  const [endTime] = useStorage<number | null>("luminar_engine_endTime", null)

  const [blueLightIntensity, setBlueLightIntensity] = useStorage<string>("luminar_bluelight_intensity", "Low")
  const [blueLightActive, setBlueLightActive] = useStorage<boolean>("luminar_bluelight_active", false)

  const [workDurationMinutes, setWorkDurationMinutes] = useStorage<number>("luminar_work_duration_minutes", 20)
  const [pauseCount] = useStorage<number>("luminar_pause_count", 1)

  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (status === "IDLE" || !endTime) {
      setTimeLeft(0)
      return
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setTimeLeft(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [status, endTime])

  const startTimer = () => {
    chrome.runtime.sendMessage({ action: "START_TIMER" })
    window.close()
  }
  const stopTimer = () => chrome.runtime.sendMessage({ action: "RESET_SESSION" })

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const isActive = status !== "IDLE"
  const isBreak = status === "RECOVERY_MODE"

  const sessionsMastered = Math.max(0, pauseCount - 1)
  const minutesSaved = sessionsMastered

  return (
    <div className="plasmo-bg-brand-bg plasmo-w-[320px] plasmo-min-h-[420px] plasmo-p-5 plasmo-flex plasmo-flex-col plasmo-font-sans">
      {/* HEADER & TABS */}
      <div className="plasmo-flex plasmo-flex-col plasmo-mb-4 plasmo-gap-4">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
          <span className="plasmo-text-sm plasmo-font-bold plasmo-text-zinc-50 plasmo-tracking-widest plasmo-uppercase">
            Luminar
          </span>
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <span
              className={`plasmo-w-1.5 plasmo-h-1.5 plasmo-rounded-full plasmo-transition-colors plasmo-duration-[150ms] ${
                isBreak ? "plasmo-bg-brand-accent" : isActive ? "plasmo-bg-emerald-500/80" : "plasmo-bg-rose-500/70"
              }`}
            />
            <span
              className={`plasmo-text-xs plasmo-font-medium ${
                isBreak ? "plasmo-text-brand-accent" : isActive ? "plasmo-text-emerald-400/80" : "plasmo-text-rose-400/70"
              }`}
            >
              {isActive ? (isBreak ? "Recovery" : "Active") : "Standby"}
            </span>
          </div>
        </div>

        <div className="plasmo-flex plasmo-bg-white/5 plasmo-p-1 plasmo-rounded-lg plasmo-border plasmo-border-white/10">
          {(["PROTOCOL", "SETTINGS", "STATS"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`plasmo-flex-1 plasmo-py-1.5 plasmo-text-[10px] plasmo-font-semibold plasmo-uppercase plasmo-tracking-wider plasmo-rounded-md plasmo-transition-all ${
                activeTab === tab
                  ? "plasmo-bg-white/10 plasmo-text-zinc-50"
                  : "plasmo-text-zinc-500 hover:plasmo-text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="plasmo-flex-1 plasmo-flex plasmo-flex-col">
        {activeTab === "PROTOCOL" && (
          <>
            <div className="plasmo-bg-white/[0.03] plasmo-backdrop-blur-xl plasmo-border plasmo-border-white/10 plasmo-rounded-2xl plasmo-p-6 plasmo-shadow-xl plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-flex-1">
              <span
                className={`plasmo-text-6xl plasmo-font-mono plasmo-tabular-nums plasmo-tracking-tight plasmo-transition-colors plasmo-duration-[150ms] ${
                  isBreak ? "plasmo-text-brand-accent" : "plasmo-text-zinc-50"
                }`}
              >
                {formatTime(isActive ? timeLeft : workDurationMinutes * 60)}
              </span>
              <span className="plasmo-text-[10px] plasmo-font-semibold plasmo-tracking-[0.2em] plasmo-text-zinc-400 plasmo-mt-3 plasmo-uppercase">
                {isActive ? (isBreak ? "Ocular Recovery" : "Deep Work Session") : "Awaiting Protocol"}
              </span>
            </div>

            <div className="plasmo-mt-4">
              {!isActive ? (
                <button
                  onClick={startTimer}
                  className="plasmo-w-full plasmo-bg-zinc-50 hover:plasmo-bg-zinc-200 plasmo-text-zinc-950 plasmo-rounded-xl plasmo-py-3 plasmo-transition-all plasmo-font-semibold plasmo-text-xs plasmo-uppercase plasmo-tracking-wider"
                >
                  Engage Protocol
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="plasmo-w-full plasmo-bg-red-500/10 hover:plasmo-bg-red-500/20 plasmo-text-red-400 plasmo-rounded-xl plasmo-py-3 plasmo-border plasmo-border-red-500/20 plasmo-transition-all plasmo-font-medium plasmo-text-xs plasmo-uppercase plasmo-tracking-wider"
                >
                  Abort Protocol
                </button>
              )}
            </div>

            <div className="plasmo-mt-4 plasmo-pt-4 plasmo-border-t plasmo-border-white/10 plasmo-flex plasmo-flex-col plasmo-gap-3">
              <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
                <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-zinc-400 plasmo-uppercase plasmo-tracking-widest">
                  Blue Light Filter
                </span>
                <button
                  onClick={() => setBlueLightActive(!blueLightActive)}
                  className={`plasmo-w-10 plasmo-h-5 plasmo-rounded-full plasmo-transition-colors plasmo-relative ${
                    blueLightActive ? "plasmo-bg-amber-500" : "plasmo-bg-zinc-700"
                  }`}
                >
                  <div
                    className={`plasmo-w-4 plasmo-h-4 plasmo-bg-white plasmo-rounded-full plasmo-absolute plasmo-top-0.5 plasmo-transition-all ${
                      blueLightActive ? "plasmo-translate-x-[20px] plasmo-left-0.5" : "plasmo-left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="plasmo-flex plasmo-gap-2">
                {["Low", "Mid", "High"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setBlueLightIntensity(level)}
                    className={`plasmo-flex-1 plasmo-py-1.5 plasmo-text-xs plasmo-font-medium plasmo-rounded-md plasmo-transition-colors ${
                      blueLightIntensity === level
                        ? "plasmo-bg-white/15 plasmo-text-white"
                        : "plasmo-bg-transparent plasmo-text-zinc-500 hover:plasmo-bg-white/5"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "SETTINGS" && (
          <div className="plasmo-flex-1 plasmo-flex plasmo-flex-col plasmo-gap-6 plasmo-py-2">
            <div className="plasmo-flex plasmo-flex-col plasmo-gap-3">
              <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-zinc-400 plasmo-uppercase plasmo-tracking-widest">
                Focus Duration
              </span>
              <p className="plasmo-text-xs plasmo-text-zinc-500 plasmo-leading-relaxed">
                Choose how long you want to focus before Luminar initiates an ocular recovery break.
              </p>
              <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-2 plasmo-mt-2">
                {[10, 20, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => setWorkDurationMinutes(min)}
                    disabled={isActive}
                    className={`plasmo-py-3 plasmo-rounded-xl plasmo-border plasmo-transition-all ${
                      workDurationMinutes === min
                        ? "plasmo-bg-brand-accent/20 plasmo-border-brand-accent plasmo-text-brand-accent"
                        : "plasmo-bg-white/5 plasmo-border-white/10 plasmo-text-zinc-400 hover:plasmo-bg-white/10"
                    } ${isActive ? "plasmo-opacity-50 plasmo-cursor-not-allowed" : ""}`}
                  >
                    <span className="plasmo-font-mono plasmo-text-lg">{min}</span>
                    <span className="plasmo-text-[10px] plasmo-uppercase plasmo-ml-1">min</span>
                  </button>
                ))}
              </div>
              {isActive && (
                <span className="plasmo-text-[10px] plasmo-text-amber-500/80 plasmo-mt-1">
                  Cannot change duration while protocol is active.
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "STATS" && (
          <div className="plasmo-flex-1 plasmo-flex plasmo-flex-col plasmo-gap-4 plasmo-py-2">
            <div className="plasmo-bg-brand-accent/10 plasmo-border plasmo-border-brand-accent/20 plasmo-rounded-2xl plasmo-p-5 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center">
              <span className="plasmo-text-5xl plasmo-font-mono plasmo-text-brand-accent plasmo-mb-1">
                {sessionsMastered}
              </span>
              <span className="plasmo-text-[10px] plasmo-font-semibold plasmo-uppercase plasmo-tracking-widest plasmo-text-brand-accent/80 plasmo-text-center">
                Deep Work Sessions
              </span>
            </div>

            <div className="plasmo-bg-white/5 plasmo-border plasmo-border-white/10 plasmo-rounded-2xl plasmo-p-5 plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center">
              <span className="plasmo-text-5xl plasmo-font-mono plasmo-text-zinc-50 plasmo-mb-1">
                {minutesSaved}
              </span>
              <span className="plasmo-text-[10px] plasmo-font-semibold plasmo-uppercase plasmo-tracking-widest plasmo-text-zinc-400 plasmo-text-center">
                Minutes Eye Strain Prevented
              </span>
            </div>

            <p className="plasmo-text-[10px] plasmo-text-zinc-500 plasmo-text-center plasmo-mt-2 plasmo-leading-relaxed">
              Every completed recovery session prevents long-term ciliary muscle spasm and restores your tear film.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexPopup
