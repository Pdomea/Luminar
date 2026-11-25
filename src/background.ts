import { Storage } from "@plasmohq/storage"

// --------------------------------------------------------
// THE BACKBONE: State Machine & Telemetry
// --------------------------------------------------------

export type EngineState = "IDLE" | "WORK_MODE" | "WARNING_MODE" | "RECOVERY_MODE"

const storage = new Storage()

const ALARM_ENGINE = "luminar-engine-alarm"

const WARNING_DURATION = 5 * 1000         // 5 seconds

async function getWorkDurationMs(): Promise<number> {
  // Default to 20 minutes if unset
  const minutes = await storage.get<number>("luminar_work_duration_minutes") || 20
  // If we are in developers debug mode (e.g. they select 0 or a test value), we could handle it,
  // but for production 20 minutes = 20 * 60 * 1000
  return minutes * 60 * 1000
}

let tickerInterval: NodeJS.Timeout | null = null

// Initialize Telemetry if missing
storage.get("luminar_pause_count").then(count => {
  if (count === undefined) storage.set("luminar_pause_count", 1)
})


async function getRecoveryDuration(): Promise<number> {
  const pauseCount = await storage.get<number>("luminar_pause_count") || 1
  const isLongBreak = pauseCount % 4 === 0
  return isLongBreak ? 90 * 1000 : 60 * 1000
}

/**
 * Broadcasts the current state and remaining time to all active content scripts.
 */
async function broadcastState(state: EngineState, timeLeft: number) {
  try {
    const tabs = await chrome.tabs.query({})
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          name: "LUMINAR_STATE_UPDATE",
          body: { state, timeLeft }
        }).catch(() => {
          // Tab may not have content script injected, ignore silently
        })
      }
    }
  } catch (err) {
    console.error("Broadcast failed", err)
  }
}

/**
 * Main State Transition Engine
 */
async function setEngineState(state: EngineState, durationMs?: number, displayDurationMs?: number) {
  await storage.set("luminar_engine_state", state)
  
  if (state === "IDLE") {
    await storage.set("luminar_engine_endTime", null)
    chrome.alarms.clear(ALARM_ENGINE)
    if (tickerInterval) clearInterval(tickerInterval)
    // Send a fixed timeLeft of the full work duration (in seconds) for IDLE state
    const workDur = await getWorkDurationMs()
    await broadcastState("IDLE", (workDur + WARNING_DURATION) / 1000)
    return
  }

  const endTime = Date.now() + (displayDurationMs ?? durationMs ?? 0)
  await storage.set("luminar_engine_endTime", endTime)

  // Use Chrome alarms for reliable background wakeup if > 1 minute
  if (durationMs && durationMs > 60000) {
    chrome.alarms.create(ALARM_ENGINE, {
      when: Date.now() + durationMs
    })
  } else if (durationMs) {
    // For short debug intervals, setTimeout is safe 
    // because the ticking broadcaster keeps the SW active.
    setTimeout(async () => {
      // Re-verify we haven't been aborted or changed state before firing
      const currentState = await storage.get<EngineState>("luminar_engine_state")
      if (currentState === state) {
        await handleStateTransition(state)
      }
    }, durationMs)
  }

  // Start the ticking broadcaster
  startTicker()
}

/**
 * Handles automatic transitions when a phase ends
 */
async function handleStateTransition(currentState: EngineState) {
  if (currentState === "WORK_MODE") {
    // Work done -> Warning (Warning duration is 5s, display is 5s)
    await setEngineState("WARNING_MODE", WARNING_DURATION, WARNING_DURATION)
  } else if (currentState === "WARNING_MODE") {
    // Check if Meeting Mode is active (Uninstall-Schutz F1)
    const isMeetingActive = await storage.get<boolean>("luminar_meeting_mode_active")
    if (isMeetingActive) {
      // Delay hijack by 60 seconds (stay in WARNING_MODE)
      console.log("Meeting Mode active! Delaying hijack by 60s.")
      await setEngineState("WARNING_MODE", 60000, 60000)
      return
    }

    // Warning done -> Recovery
    const duration = await getRecoveryDuration()
    await setEngineState("RECOVERY_MODE", duration, duration)
  } else if (currentState === "RECOVERY_MODE") {
    // Recovery done -> SUCCESS!
    
    const currentCount = await storage.get<number>("luminar_pause_count") || 1
    await storage.set("luminar_pause_count", currentCount + 1)
    
    // Reset meeting mode flag safely
    await storage.set("luminar_meeting_mode_active", false)
    
    // Loop back to Work
    const workDur = await getWorkDurationMs()
    await setEngineState("WORK_MODE", workDur, workDur + WARNING_DURATION)
  }
}

/**
 * Ticker: Runs every second to broadcast live state to UI
 * Also acts as a keep-alive for the Service Worker while active
 */
function startTicker() {
  if (tickerInterval) clearInterval(tickerInterval)
  
  tickerInterval = setInterval(async () => {
    const state = await storage.get<EngineState>("luminar_engine_state")
    if (!state || state === "IDLE") {
       clearInterval(tickerInterval!)
       // Keep broadcasting IDLE and full time left to unfreeze UI
       const workDur = await getWorkDurationMs()
       await broadcastState("IDLE", (workDur + WARNING_DURATION) / 1000)
       return
    }
    
    const endTime = await storage.get<number>("luminar_engine_endTime")
    if (!endTime) return
    
    const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
    await broadcastState(state, timeLeft)
  }, 1000)
}

// Listen to Alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_ENGINE) {
    const currentState = await storage.get<EngineState>("luminar_engine_state")
    if (currentState) {
      await handleStateTransition(currentState)
    }
  }
})

// Handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "START_TIMER") {
    getWorkDurationMs().then(workDur => {
      setEngineState("WORK_MODE", workDur, workDur + WARNING_DURATION).then(() => sendResponse({ success: true }))
    })
    return true
  }
  if (message.action === "STOP_TIMER" || message.action === "RESET_SESSION") {
    setEngineState("IDLE").then(() => sendResponse({ success: true }))
    return true
  }
  if (message.action === "SKIP_RECOVERY") {
    // F2: Hold-to-Skip applied
    storage.get<number>("luminar_pause_count").then(async () => {
      await storage.set("luminar_meeting_mode_active", false) // Reset shield on skip
      const workDur = await getWorkDurationMs()
      await setEngineState("WORK_MODE", workDur, workDur + WARNING_DURATION)
      sendResponse({ success: true })
    })
    return true
  }
  if (message.action === "RESUME_FROM_MEET") {
    storage.get<EngineState>("luminar_engine_state").then(async (state) => {
      if (state === "WARNING_MODE") {
        const duration = await getRecoveryDuration()
        await setEngineState("RECOVERY_MODE", duration, duration)
      }
      sendResponse({ success: true })
    })
    return true
  }
  if (message.action === "END_RECOVERY") {
    storage.get<EngineState>("luminar_engine_state").then(async (state) => {
      if (state === "RECOVERY_MODE") {
        const endTime = await storage.get<number>("luminar_engine_endTime")
        if (endTime && Date.now() >= endTime - 2000) {
          await handleStateTransition(state)
        }
      }
      sendResponse({ success: true })
    })
    return true
  }
})
