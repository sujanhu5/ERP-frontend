import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/common/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-canvas text-center px-4">
      <div className="mb-10">
        <Link to="/"><Logo size="lg" withSubtitle /></Link>
      </div>

      <p className="text-[64px] leading-none font-display font-medium tracking-display text-primary tabular-nums">404</p>
      <h1 className="text-lg font-semibold text-ink mt-4">This page doesn't exist</h1>
      <p className="text-sm text-ink-muted mt-2 max-w-sm">
        The page you're looking for may have been moved, or you may not have access to it.
      </p>

      <Link to="/dashboard" className="btn-primary mt-7">
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>
    </div>
  );
}
