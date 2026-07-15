import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, KeyRound, Upload, ScanFace } from 'lucide-react';
import { settingsService, authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES } from '../../utils/indianStates';

function SectionCard({ icon: Icon, title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="card"
    >
      <div className="flex items-start gap-3.5 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Icon size={19} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const { user, hasRole } = useAuth();
  const { register: registerCompany, handleSubmit: handleCompanySubmit, reset: resetCompany } = useForm();
  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm();
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    settingsService.get().then(({ data }) => {
      const s = data.data;
      if (!s) return;
      setLogoUrl(s.logo_url || '');
      resetCompany({
        companyName: s.company_name, gstin: s.gstin, pan: s.pan,
        phone: s.phone, email: s.email,
        building: s.building, area: s.area, city: s.city, district: s.district,
        state: s.state, pincode: s.pincode, country: s.country || 'India',
        gstType: s.gst_type || 'CGST_SGST',
        defaultGstPercent: s.default_gst_percent,
        currency: s.currency || 'INR',
        timezone: s.timezone || 'Asia/Kolkata',
        dateFormat: s.date_format || 'DD/MM/YYYY',
        invoicePrefix: s.invoice_prefix,
      });
    }).catch(() => {});
  }, [resetCompany]);

  const onCompanySubmit = async (data) => {
    setSavingCompany(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') formData.append(k, v);
      });
      if (logoFile) formData.append('logo', logoFile);
      const { data: res } = await settingsService.update(formData);
      if (res.data?.logo_url) setLogoUrl(res.data.logo_url);
      toast.success('Company settings updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSavingCompany(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSavingPwd(true);
    try {
      await authService.changePassword(data);
      toast.success('Password changed successfully.');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Profile */}
      <SectionCard icon={ScanFace} title="User Profile" subtitle="Your identity within this workspace">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-primary text-ink-invert flex items-center justify-center text-xl font-semibold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-ink font-medium">{user?.name}</p>
            <p className="text-ink-subtle text-sm">{user?.email}</p>
            <span className="badge-primary mt-1.5 capitalize">{user?.role}</span>
          </div>
        </div>
      </SectionCard>

      {/* Company */}
      {hasRole('admin') && (
        <form onSubmit={handleCompanySubmit(onCompanySubmit)}>
          <SectionCard
            icon={Building2}
            title="Company Information"
            subtitle="Appears on invoices, reports and GST filings"
            delay={0.05}
          >
            <div className="space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-surface-2 border border-line flex items-center justify-center overflow-hidden shrink-0">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="h-full w-full object-cover" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Company logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 size={20} className="text-ink-subtle" />
                  )}
                </div>
                <div>
                  <label className="btn-secondary cursor-pointer !py-2">
                    <Upload size={15} /> {logoUrl || logoFile ? 'Change Logo' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                    />
                  </label>
                  <p className="text-xs text-ink-subtle mt-1.5">PNG, JPG or SVG · max 5 MB</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" {...registerCompany('companyName')} />
                </div>
                <div>
                  <label className="label">Invoice Prefix</label>
                  <input className="input" placeholder="INV" {...registerCompany('invoicePrefix')} />
                </div>
                <div>
                  <label className="label">GSTIN</label>
                  <input className="input uppercase" placeholder="29ABCDE1234F1Z5" {...registerCompany('gstin')} />
                </div>
                <div>
                  <label className="label">Business PAN</label>
                  <input className="input uppercase" placeholder="ABCDE1234F" {...registerCompany('pan')} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 98765 43210" {...registerCompany('phone')} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" {...registerCompany('email')} />
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-3 pt-1">Registered Address</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Building / Office</label>
                    <input className="input" {...registerCompany('building')} />
                  </div>
                  <div>
                    <label className="label">Area / Street</label>
                    <input className="input" {...registerCompany('area')} />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className="input" {...registerCompany('city')} />
                  </div>
                  <div>
                    <label className="label">District</label>
                    <input className="input" {...registerCompany('district')} />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <select className="input" {...registerCompany('state')}>
                      <option value="">Select state…</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">PIN Code</label>
                    <input className="input" maxLength={6} placeholder="560001" {...registerCompany('pincode')} />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input className="input" readOnly {...registerCompany('country')} />
                  </div>
                </div>
              </div>

              {/* Tax & locale */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-3 pt-1">Tax & Locale</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">GST Type</label>
                    <select className="input" {...registerCompany('gstType')}>
                      <option value="CGST_SGST">CGST + SGST (intra-state)</option>
                      <option value="IGST">IGST (inter-state)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Default GST %</label>
                    <input className="input" type="number" step="0.01" min="0" max="100" {...registerCompany('defaultGstPercent')} />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select className="input" {...registerCompany('currency')}>
                      <option value="INR">INR — Indian Rupee (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <select className="input" {...registerCompany('timezone')}>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Date Format</label>
                    <select className="input" {...registerCompany('dateFormat')}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={savingCompany} className="btn-primary">
                {savingCompany ? 'Saving…' : 'Save Company Settings'}
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      {/* Password */}
      <form onSubmit={handlePwdSubmit(onPasswordSubmit)}>
        <SectionCard icon={KeyRound} title="Change Password" subtitle="Keep your account secure" delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" {...registerPwd('currentPassword', { required: 'Required' })} />
              {pwdErrors.currentPassword && <p className="text-xs text-danger mt-1">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input"
                {...registerPwd('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              {pwdErrors.newPassword && <p className="text-xs text-danger mt-1">{pwdErrors.newPassword.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={savingPwd} className="btn-primary mt-5">
            {savingPwd ? 'Updating…' : 'Update Password'}
          </button>
        </SectionCard>
      </form>

      {/* 2FA placeholder */}
      <SectionCard
        icon={ShieldCheck}
        title="Two-Factor Authentication"
        subtitle="Add an extra layer of security to your account"
        delay={0.15}
      >
        <div className="flex items-center justify-between gap-4 rounded-md bg-surface-2 border border-line px-5 py-4">
          <div>
            <p className="text-sm text-ink font-medium">Authenticator app</p>
            <p className="text-xs text-ink-subtle mt-0.5">Time-based one-time codes (TOTP)</p>
          </div>
          <span className="badge-neutral shrink-0">Coming soon</span>
        </div>
      </SectionCard>
    </div>
  );
}
