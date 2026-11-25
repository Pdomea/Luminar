// The 6 cognitive reinforcement facts for Luminar, structured by category.
// To ensure a random feel without repetition within a work session, they are 
// shuffled statically here. We use `pause_count % 6` to iterate through them.

const QUOTES = [
  "Your ciliary muscle has been holding tension for 20 minutes. Looking away finally lets it breathe.",
  "Screen time drops your blink rate by 60%. Ten deep blinks restore your tear film.",
  "Your eyes were built for the horizon. Staring at a screen is a high-stress state.",
  "Attention isn't endless. It's a battery, and you're charging it right now.",
  "Your focus will be sharper after this. It's not magic, it's just biology."
]

const SHUFFLED_QUOTES = [
  QUOTES[0], QUOTES[3], QUOTES[1], 
  QUOTES[4], QUOTES[2]
]

export const getQuoteForPause = (pauseCount: number): string => {
  const index = (Math.max(0, pauseCount - 1)) % SHUFFLED_QUOTES.length
  return SHUFFLED_QUOTES[index]
}
