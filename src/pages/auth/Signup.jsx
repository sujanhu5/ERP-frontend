import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff, MapPin, ReceiptText,
  ArrowRight, ArrowLeft, CheckCircle2, Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import { INDIAN_STATES } from '../../utils/indianStates';

const BUSINESS_TYPES = [
  'Retail', 'Wholesale', 'Manufacturing', 'Distribution',
  'Services', 'E-commerce', 'Trading', 'Other',
];

const STEPS = [
  { id: 0, label: 'Company', fields: ['companyName', 'businessType'] },
  { id: 1, label: 'Owner', fields: ['ownerName', 'email', 'phone', 'password', 'confirmPassword'] },
  { id: 2, label: 'Business', fields: ['gstNumber', 'country', 'state', 'city'] },
  { id: 3, label: 'Review', fields: [] },
];

function passwordStrength(pw = '') {
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

const strengthMeta = [
  { label: '', color: '' },
  { label: 'Very weak', color: 'bg-danger' },
  { label: 'Weak', color: 'bg-danger' },
  { label: 'Fair', color: 'bg-warning' },
  { label: 'Good', color: 'bg-primary' },
  { label: 'Strong', color: 'bg-success' },
];

function Field({ label, error, icon: Icon, children, required }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={15} />}
        {children}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error.message}</p>}
    </div>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center mb-7">
      {STEPS.map((step, i) => (
        <div key={step.id} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors
                ${i < current
                  ? 'bg-primary border-primary text-ink-invert'
                  : i === current
                    ? 'bg-primary-soft border-primary text-primary'
                    : 'bg-surface-2 border-line text-ink-subtle'}`}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i <= current ? 'text-ink' : 'text-ink-subtle'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mx-3 bg-line relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                style={{ width: i < current ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-sm text-ink font-medium text-right truncate max-w-[60%]">{value || '—'}</span>
    </div>
  );
}

export default function Signup() {
  const { register, handleSubmit, watch, trigger, getValues, formState: { errors } } = useForm({
    defaultValues: { country: 'India' },
    mode: 'onTouched',
  });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const password = watch('password', '');
  const strength = passwordStrength(password);

  const next = async () => {
    const valid = await trigger(STEPS[step].fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await signup(formData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2200);
    } catch (err) {
      const details = err.response?.data?.details;
      const msg = details?.[0]?.msg || err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const values = getValues();

  if (success) {
    return (
      <div className="min-h-screen w-full bg-canvas flex items-center justify-center px-4">
        <div className="card !p-10 text-center max-w-md w-full">
          <CheckCircle2 size={56} className="text-success mx-auto" />
          <h2 className="text-xl font-display font-medium tracking-display text-ink mt-5">Your workspace is ready</h2>
          <p className="text-sm text-ink-muted mt-2.5">
            <span className="text-ink font-medium">{values.companyName}</span> has been provisioned with its own
            organization, dashboard, inventory and settings.
          </p>
          <p className="text-xs text-ink-subtle mt-6">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-canvas py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center mb-7">
          <Link to="/"><Logo size="lg" /></Link>
        </div>

        <div className="card !p-7">
          <h1 className="text-xl font-display font-medium tracking-display text-ink">Create your company account</h1>
          <p className="text-sm text-ink-muted mt-1 mb-7">
            Your business gets a private, fully isolated ERP workspace.
          </p>

          <StepIndicator current={step} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 min-h-[250px]">
              {step === 0 && (
                <>
                  <Field label="Company name" error={errors.companyName} icon={Building2} required>
                    <input
                      className="input !pl-8"
                      placeholder="Acme Traders Pvt Ltd"
                      {...register('companyName', { required: 'Company name is required' })}
                    />
                  </Field>
                  <Field label="Business type" error={errors.businessType}>
                    <select className="input" defaultValue="" {...register('businessType')}>
                      <option value="" disabled>Select type…</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <p className="text-xs text-ink-subtle pt-1">
                    This becomes your organization name across invoices, reports and settings.
                  </p>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Owner name" error={errors.ownerName} icon={User} required>
                      <input
                        className="input !pl-8"
                        placeholder="Your full name"
                        {...register('ownerName', { required: 'Owner name is required' })}
                      />
                    </Field>
                    <Field label="Phone number" error={errors.phone} icon={Phone}>
                      <input
                        className="input !pl-8"
                        placeholder="+91 98765 43210"
                        defaultValue="+91 "
                        {...register('phone')}
                      />
                    </Field>
                  </div>

                  <Field label="Email address" error={errors.email} icon={Mail} required>
                    <input
                      className="input !pl-8"
                      type="email"
                      placeholder="you@company.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                      })}
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Password" error={errors.password} icon={Lock} required>
                      <input
                        className="input !pl-8 !pr-9"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'At least 6 characters' },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </Field>
                    <Field label="Confirm password" error={errors.confirmPassword} icon={Lock} required>
                      <input
                        className="input !pl-8"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat password"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (v) => v === getValues('password') || 'Passwords do not match',
                        })}
                      />
                    </Field>
                  </div>

                  {password && (
                    <div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength ? strengthMeta[strength].color : 'bg-line'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-ink-subtle mt-1.5">{strengthMeta[strength].label}</p>
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="GST number (optional)" error={errors.gstNumber} icon={ReceiptText}>
                    <input
                      className="input !pl-8 uppercase"
                      placeholder="29ABCDE1234F1Z5"
                      {...register('gstNumber', {
                        pattern: {
                          value: /^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z]$/i,
                          message: 'Enter a valid 15-character GSTIN',
                        },
                      })}
                    />
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Country" error={errors.country} required>
                      <input className="input" readOnly {...register('country', { required: true })} />
                    </Field>
                    <Field label="State" error={errors.state} required>
                      <select className="input" defaultValue="" {...register('state', { required: 'Select your state' })}>
                        <option value="" disabled>Select…</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="City" error={errors.city} icon={MapPin} required>
                      <input
                        className="input !pl-8"
                        placeholder="City"
                        {...register('city', { required: 'City is required' })}
                      />
                    </Field>
                  </div>
                  <p className="text-xs text-ink-subtle pt-1">
                    GST details drive CGST/SGST/IGST calculation on invoices. You can edit this later in Settings.
                  </p>
                </>
              )}

              {step === 3 && (
                <div>
                  <p className="text-[13px] font-semibold text-ink mb-3">Review your details</p>
                  <div className="rounded-md border border-line bg-surface-2 px-4 py-1">
                    <ReviewRow label="Company" value={values.companyName} />
                    <ReviewRow label="Business type" value={values.businessType} />
                    <ReviewRow label="Owner" value={values.ownerName} />
                    <ReviewRow label="Email" value={values.email} />
                    <ReviewRow label="Phone" value={values.phone} />
                    <ReviewRow label="GSTIN" value={values.gstNumber?.toUpperCase()} />
                    <ReviewRow label="Location" value={[values.city, values.state, values.country].filter(Boolean).join(', ')} />
                  </div>
                  <p className="text-xs text-ink-subtle mt-4">
                    By creating an account you agree to the Maxmatrix terms of service.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-line">
              {step > 0 ? (
                <button type="button" onClick={back} className="btn-secondary">
                  <ArrowLeft size={15} /> Back
                </button>
              ) : <span />}

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="btn-primary !px-5">
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-primary !px-5">
                  {loading ? 'Creating workspace…' : <>Create account <ArrowRight size={15} /></>}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-[13px] text-ink-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
