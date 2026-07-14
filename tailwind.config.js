/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Premium Skincare & Beauty Palette
        black:    '#0F1111',
        white:    '#FFFFFF',
        sand:     '#FAFAFA', // ultra-light clinical background
        stone:    '#F2F2F2', // soft gray
        warm:     '#E5E5E5',
        coal:     '#1A1C1E',
        charcoal: '#2D3134',
        grey:     '#666666',
        silver:   '#999999',
        border:   '#EAEAEA',
        gold:     '#C5A880', // premium champagne gold
        goldlight:'#EBE2D5',
        sage:     '#DCE3E0', // clinical/botanical subtle green
        sale:     '#D14949', // softer premium red
        // Backwards compat aliases
        ink:      '#0F1111',
        inksoft:  '#666666',
        muted:    '#999999',
        line:     '#EAEAEA',
        bg:       '#FAFAFA',
        paper:    '#F2F2F2',
        panel:    '#F9F9F9',
        rust:     '#D14949',
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
