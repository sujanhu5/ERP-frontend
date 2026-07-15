export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-7 w-7 border-2', lg: 'h-10 w-10 border-[3px]' };
  return (
    <div
      className={`${sizes[size]} rounded-full border-primary border-t-transparent animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Shimmering placeholder block. Pass height/width via className. */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}
