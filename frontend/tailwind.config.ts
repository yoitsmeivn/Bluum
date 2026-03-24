import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        serif: ['Playfair Display', 'serif'],
        body: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
