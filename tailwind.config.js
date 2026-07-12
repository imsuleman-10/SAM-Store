/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette — baroque.pk inspired
        black:  '#000000',
        white:  '#ffffff',
        sand:   '#f7f4ef',
        stone:  '#ebe6df',
        warm:   '#d4cdc5',
        coal:   '#1a1a1a',
        charcoal: '#333333',
        grey:   '#6b6b6b',
        silver: '#999999',
        border: '#e0dbd4',
        gold:   '#c9a96e',
        goldlight: '#e8d5b0',
        sale:   '#c0392b',
        // Keep backwards compat aliases
        ink:    '#000000',
        inksoft:'#6b6b6b',
        muted:  '#999999',
        line:   '#e0dbd4',
        bg:     '#f7f4ef',
        paper:  '#ebe6df',
        panel:  '#f0ece6',
        rust:   '#c0392b',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
      boxShadow: {
        soft:  '0 4px 24px rgba(0,0,0,0.06)',
        card:  '0 2px 12px rgba(0,0,0,0.08)',
        panel: '0 8px 40px rgba(0,0,0,0.10)',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '4/5': '4 / 5',
      },
      transitionDuration: {
        400: '400ms',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee:    'marquee 28s linear infinite',
        fadeInUp:   'fadeInUp 0.5s ease forwards',
        slideDown:  'slideDown 0.25s ease forwards',
      },
    },
  },
  plugins: [],
};
