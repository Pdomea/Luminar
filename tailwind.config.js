/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,html}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#1d1d1d",
          accent: "#e5bddf"
        }
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"]
      }
    }
  },
  prefix: "plasmo-"
}
