/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#000000',
        'cyber-dark': '#0a0a0f',
        'cyber-gray': '#1a1a2e',
        'cyber-cyan': '#00ffff',
        'cyber-gold': '#ffd700',
        'cyber-red': '#ff3333',
        'cyber-purple': '#9d4edd',
        'cyber-green': '#00ff88',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'display': ['Orbitron', 'sans-serif'],
        'matrix': ['Doto', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.5)',
        'neon-red': '0 0 20px rgba(255, 51, 51, 0.5)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
