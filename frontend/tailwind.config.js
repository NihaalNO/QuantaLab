/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Scientific Dark Lab palette
        void: 'var(--bg-void)',
        base: 'var(--bg-base)',
        raised: 'var(--bg-raised)',
        overlay: 'var(--bg-overlay)',
        subtle: 'var(--bg-subtle)',

        border: {
          dim: 'var(--border-dim)',
          default: 'var(--border-default)',
          bright: 'var(--border-bright)',
        },

        accent: {
          cyan: 'var(--accent-cyan)',
          violet: 'var(--accent-violet)',
          amber: 'var(--accent-amber)',
          emerald: 'var(--accent-emerald)',
          rose: 'var(--accent-rose)',
        },

        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          code: 'var(--text-code)',
        }
      },
    },
  },
  plugins: [],
}
