import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import { homeFor } from '../../components/common/ProtectedRoute';

const stats = [
  { value: '500+', label: 'Companies onboard' },
  { value: '10 L+', label: 'GST invoices issued' },
  { value: '₹120 Cr+', label: 'Revenue processed' },
];

const benefits = [
  'GST-compliant billing and e-invoicing',
  'Real-time inventory with low-stock alerts',
  'Customers, suppliers and payroll-ready HR',
  'Audit-ready reports your accountant will trust',
];

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      // Platform owners land in the control plane; everyone else in their workspace.
      navigate(homeFor(user));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const ssoSoon = () => toast('Single sign-on is coming soon.', { icon: '🔐' });

  return (
    <div className="min-h-screen w-full flex bg-canvas">
      {/* Left: brand panel */}
      <div className="hidden lg:flex w-[46%] flex-col justify-between p-12 bg-[#0E1B2C] dark:bg-[#0A121D]">
        <Link to="/"><Logo size="lg" onDark /></Link>

        <div>
          <h2 className="text-[32px] leading-[1.2] font-display font-medium tracking-display text-white">
            Run your business.<br />One platform.
          </h2>
          <p className="text-white/60 mt-4 max-w-md text-[15px] leading-relaxed">
            Inventory, GST billing, customers, employees and analytics — unified in a single
            enterprise workspace built for Indian businesses.
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/75">
                <span className="h-[18px] w-[18px] rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-semibold text-white font-display tabular-nums">{s.value}</p>
                <p className="text-[11px] text-white/50 mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">
          Enterprise-grade security · Role-based access · Complete data isolation
        </p>
      </div>

      {/* Right: sign-in form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/"><Logo size="lg" /></Link>
          </div>

          <div className="card !p-7">
            <h1 className="text-xl font-display font-medium tracking-display text-ink">Sign in</h1>
            <p className="text-sm text-ink-muted mt-1 mb-6">Access your Maxmatrix workspace</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" size={15} />
                  <input
                    className="input !pl-8"
                    type="email"
                    placeholder="you@company.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" size={15} />
                  <input
                    className="input !pl-8 !pr-9"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-[13px] pt-0.5">
                <label className="flex items-center gap-2 text-ink-muted cursor-pointer select-none">
                  <input type="checkbox" className="accent-primary h-3.5 w-3.5" {...register('remember')} />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast('Contact your administrator to reset your password.', { icon: 'ℹ️' })}
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 mt-1">
                {loading ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[11px] text-ink-subtle uppercase tracking-wider">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={ssoSoon} className="btn-secondary !py-2 !text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.7 0 3.22.59 4.42 1.73l3.29-3.29C17.72 1.64 15.06.6 12 .6 7.32.6 3.28 3.28 1.33 7.19l3.85 2.99C6.1 7.24 8.82 5.04 12 5.04z"/><path fill="#4285F4" d="M23.4 12.27c0-.83-.07-1.62-.21-2.39H12v4.52h6.4c-.28 1.48-1.11 2.74-2.37 3.58l3.72 2.89c2.18-2.01 3.65-4.98 3.65-8.6z"/><path fill="#FBBC05" d="M5.18 14.42A7.06 7.06 0 0 1 4.8 12c0-.84.14-1.65.38-2.42L1.33 6.59A11.35 11.35 0 0 0 .6 12c0 1.94.46 3.77 1.28 5.39l3.85-2.97z"/><path fill="#34A853" d="M12 23.4c3.06 0 5.63-1.01 7.5-2.74l-3.72-2.89c-1.03.7-2.36 1.11-3.78 1.11-3.18 0-5.9-2.2-6.87-5.16l-3.85 2.97C3.28 20.72 7.32 23.4 12 23.4z"/></svg>
                Google
              </button>
              <button type="button" onClick={ssoSoon} className="btn-secondary !py-2 !text-xs">
                <svg width="13" height="13" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                Microsoft
              </button>
            </div>
          </div>

          <p className="text-center text-[13px] text-ink-muted mt-5">
            New to Maxmatrix?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create a company account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
