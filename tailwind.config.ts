import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        neon: '#7df9ff',
        redpill: '#ff365f',
        bluepill: '#4aa8ff',
        greenpill: '#36ffb0',
        whitepill: '#e6f0ff',
      },
    },
  },
  plugins: [],
} satisfies Config
