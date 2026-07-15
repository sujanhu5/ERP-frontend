/**
 * Maxmatrix brand mark — serif "M" with a detached italic red "x", paired with
 * a serif wordmark set at the same cap-height so the mark and the word read as
 * one consistent typeface instead of two mismatched fonts side by side.
 *
 * size:    'sm' (sidebar / topbar) | 'md' (navbars) | 'lg' (auth + landing)
 * variant: 'full' (mark + wordmark) | 'mark' (mark only, for collapsed rails)
 * onDark:  white text for use on dark panels
 */

const SIZES = {
  sm: { mark: 20, x: 11, text: 18, sub: 'text-[9px]', gap: 'gap-1.5' },
  md: { mark: 24, x: 13, text: 21, sub: 'text-[10px]', gap: 'gap-2' },
  lg: { mark: 36, x: 19, text: 32, sub: 'text-[10px]', gap: 'gap-2.5' },
};

export function LogoMark({ size = 'sm', onDark = false }) {
  const s = SIZES[size] ?? SIZES.sm;

  return (
    <span
      className={`inline-flex items-baseline select-none font-serif font-semibold leading-none shrink-0
        ${onDark ? 'text-white' : 'text-ink'}`}
      style={{ fontSize: s.mark }}
      aria-hidden="true"
    >
      M
      <span
        className="font-serif italic font-medium text-primary -ml-0.5"
        style={{ fontSize: s.x }}
      >
        x
      </span>
    </span>
  );
}

export default function Logo({ size = 'sm', variant = 'full', withSubtitle = false, onDark = false }) {
  const s = SIZES[size] ?? SIZES.sm;

  if (variant === 'mark') return <LogoMark size={size} onDark={onDark} />;

  return (
    <div className={`flex items-baseline ${s.gap} select-none`}>
      <LogoMark size={size} onDark={onDark} />
      <div className="leading-none">
        <span
          className={`font-serif font-semibold tracking-tight whitespace-nowrap
            ${onDark ? 'text-white' : 'text-ink'}`}
          style={{ fontSize: s.text }}
        >
          Maxmatrix
        </span>
        {withSubtitle && (
          <p
            className={`${s.sub} tracking-[0.1em] uppercase whitespace-nowrap mt-1.5 font-medium font-sans
              ${onDark ? 'text-white/50' : 'text-ink-subtle'}`}
          >
            Enterprise ERP Platform
          </p>
        )}
      </div>
    </div>
  );
}
