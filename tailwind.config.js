/**
 * MAXMATRIX design system.
 * Palette, type scale, radii and elevation are derived from measured values on
 * Zoho's ERP product site: bright humanist blues, near-white surfaces, 0.8px
 * hairlines, medium-weight headings with tight tracking, and soft wide shadows.
 * Colors resolve from CSS variables (index.css) so light/dark both work.
 */
const withVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: withVar('--canvas'),
        surface: withVar('--surface'),
        'surface-2': withVar('--surface-2'),
        'surface-3': withVar('--surface-3'),
        line: withVar('--line'),
        'line-strong': withVar('--line-strong'),
        ink: withVar('--ink'),
        'ink-muted': withVar('--ink-muted'),
        'ink-subtle': withVar('--ink-subtle'),
        'ink-invert': withVar('--ink-invert'),
        primary: {
          DEFAULT: withVar('--primary'),       // #D62828 crimson
          hover: withVar('--primary-hover'),   // #B01C1C
          deep: withVar('--primary-deep'),     // #8A1414
          soft: withVar('--primary-soft'),     // #FDECEC tint
          pale: withVar('--primary-pale'),     // #F0AAAA on dark
        },
        teal: withVar('--teal'),
        success: withVar('--success'),
        'success-soft': withVar('--success-soft'),
        warning: withVar('--warning'),
        'warning-soft': withVar('--warning-soft'),
        danger: {
          DEFAULT: withVar('--danger'),
          hover: withVar('--danger-hover'),
          soft: withVar('--danger-soft'),
        },
      },
      fontFamily: {
        // Figtree is the closest widely-available humanist face to Zoho Puvi.
        sans: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        display: '-0.02em',  // headings run tight, like Zoho's -1px at 56px
        tightest: '-0.03em',
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        pill: '100px',
      },
      boxShadow: {
        // Soft and wide, the way Zoho lifts panels off the page.
        sm: '0 0 4px rgb(var(--shadow) / 0.10)',
        card: '0 2px 10px rgb(var(--shadow) / 0.06)',
        raised: '0 10px 32px rgb(var(--shadow-cool) / 0.10)',
        overlay: '0 20px 50px rgb(var(--shadow) / 0.14), 0 4px 12px rgb(var(--shadow) / 0.06)',
        // Signature coloured glow under primary CTAs.
        glow: '0 17px 40px -22px rgb(var(--primary) / 0.85)',
        ring: '0 0 0 4px rgb(var(--primary-soft))',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sheen': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        sheen: 'sheen 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
