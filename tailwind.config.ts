import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // tokens via CSS variables (suporta modo claro/escuro)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        subtle: 'var(--subtle)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        primary: { DEFAULT: 'var(--primary)', hover: 'var(--primary-hover)' },
        'on-primary': 'var(--on-primary)',
        link: { DEFAULT: 'var(--link)', hover: 'var(--link-hover)' },
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      borderRadius: { xl: 'var(--radius)' },
      fontFamily: { sans: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
