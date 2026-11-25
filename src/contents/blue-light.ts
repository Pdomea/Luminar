import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

const storage = new Storage()

let filterDiv: HTMLDivElement | null = null

const INTENSITY_MAP: Record<string, number> = {
  Low: 0.08,
  Mid: 0.16,
  High: 0.25
}

function updateFilter(active: boolean, intensity: string) {
  if (active) {
    if (!filterDiv) {
      filterDiv = document.createElement("div")
      filterDiv.id = "luminar-bluelight-filter"
      filterDiv.style.position = "fixed"
      filterDiv.style.top = "0"
      filterDiv.style.left = "0"
      filterDiv.style.width = "100vw"
      filterDiv.style.height = "100vh"
      filterDiv.style.zIndex = "2147483646" // High z-index, just below Plasmo CSUI if possible
      filterDiv.style.pointerEvents = "none"
      filterDiv.style.mixBlendMode = "multiply"
      
      // At document_start, body might not be available yet. documentElement is safer.
      if (document.documentElement) {
        document.documentElement.appendChild(filterDiv)
      } else {
        document.addEventListener("DOMContentLoaded", () => {
          if (filterDiv && document.body) document.body.appendChild(filterDiv)
        })
      }
    }
    const alpha = INTENSITY_MAP[intensity] || 0.08
    filterDiv.style.backgroundColor = `rgba(255, 140, 60, ${alpha})`
  } else {
    if (filterDiv) {
      filterDiv.remove()
      filterDiv = null
    }
  }
}

async function init() {
  const active = await storage.get<boolean>("luminar_bluelight_active") || false
  const intensity = await storage.get<string>("luminar_bluelight_intensity") || "Low"
  updateFilter(active, intensity)
}

// Watch for changes
storage.watch({
  "luminar_bluelight_active": (c) => {
    storage.get<string>("luminar_bluelight_intensity").then(intensity => {
      updateFilter(c.newValue, intensity || "Low")
    })
  },
  "luminar_bluelight_intensity": (c) => {
    storage.get<boolean>("luminar_bluelight_active").then(active => {
      updateFilter(active || false, c.newValue)
    })
  }
})

init()
