import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, FileText, Users, Truck, ShieldCheck, Menu, X, ArrowRight, Check,
  LayoutDashboard, Package, UserCheck, Gauge, Lock, Rocket, ChevronDown, IndianRupee,
  Mail, Phone, MapPin, Sun, Moon,
} from 'lucide-react';
import Logo from '../../components/common/Logo';
import Reveal from '../../components/common/Reveal';
import { useTheme } from '../../context/ThemeContext';

const features = [
  { icon: LayoutDashboard, title: 'Real-time dashboard', desc: 'Revenue, sales, inventory and team KPIs on one screen, updated as transactions happen.' },
  { icon: Package, title: 'Inventory control', desc: 'Stock levels, low-stock alerts, SKUs, barcodes, HSN codes and full movement history.' },
  { icon: FileText, title: 'GST invoicing', desc: 'Compliant invoices with CGST/SGST/IGST auto-calculation and professional PDF exports.' },
  { icon: Users, title: 'Customers & suppliers', desc: 'Outstanding balances, purchase history and supplier catalogues in one ledger.' },
  { icon: UserCheck, title: 'Workforce management', desc: 'Employees, attendance, leaves and role-based access across your organization.' },
  { icon: BarChart3, title: 'Reporting & exports', desc: 'Daily sales, monthly revenue, inventory valuation and top products — exportable to CSV.' },
];

const modules = [
  { icon: LayoutDashboard, name: 'Dashboard' },
  { icon: Package, name: 'Inventory' },
  { icon: FileText, name: 'Billing & GST' },
  { icon: Users, name: 'Customers' },
  { icon: Truck, name: 'Suppliers' },
  { icon: UserCheck, name: 'Employees' },
  { icon: BarChart3, name: 'Reports' },
  { icon: ShieldCheck, name: 'Audit Logs' },
];

const whyPoints = [
  { icon: Rocket, title: 'Live in under a minute', desc: 'Sign up and your company gets a fully provisioned workspace instantly — no consultants, no setup fees, no implementation cycle.' },
  { icon: Lock, title: 'Complete data isolation', desc: 'Every organization runs in its own secure tenant. Your data is never visible to any other company — enforced at every layer.' },
  { icon: IndianRupee, title: 'Built for India', desc: 'GST invoicing, ₹ Indian number formatting, state-wise records and Asia/Kolkata time are defaults, not add-ons.' },
  { icon: Gauge, title: 'Fast where it matters', desc: 'Instant dashboards, keyboard-first navigation with a command palette, and dense tables built for all-day operational work.' },
];

const plans = [
  { name: 'Starter', price: '₹0', period: 'forever', desc: 'For small businesses getting started',
    features: ['1 organization', 'Up to 3 users', 'Inventory & billing', 'GST invoices', 'Email support'], cta: 'Start Free', highlight: false },
  { name: 'Business', price: '₹999', period: 'per month', desc: 'For growing operations',
    features: ['Unlimited users', 'All ERP modules', 'Advanced reports & exports', 'Priority support', 'Custom branding'], cta: 'Start Free Trial', highlight: true },
  { name: 'Enterprise', price: 'Custom', period: 'contact sales', desc: 'For large organizations',
    features: ['Everything in Business', 'Dedicated infrastructure', 'SLA & onboarding', 'API access', 'Dedicated success manager'], cta: 'Book Demo', highlight: false },
];

const testimonials = [
  { name: 'Rohit Sharma', role: 'Owner, Sharma Electronics — Pune', text: 'Maxmatrix replaced three separate tools for us. Billing, stock and staff now live in one system our whole team actually uses.' },
  { name: 'Priya Nair', role: 'Director, Nair Textiles — Kochi', text: 'GST invoicing that simply works. Our accountant is happier, and month-end closing takes hours instead of days.' },
  { name: 'Amandeep Singh', role: 'Managing Director, Singh Traders — Ludhiana', text: 'We onboarded in a single evening. Low-stock alerts alone have saved us lakhs in missed sales.' },
];

const faqs = [
  { q: 'How long does implementation take?', a: 'Under a minute. Create your account and Maxmatrix automatically provisions your organization, dashboard, inventory and settings. There is no implementation cycle.' },
  { q: 'Is my company data isolated from other businesses?', a: 'Completely. Every company operates in its own isolated tenant, scoped at the database level. No other business can access your records.' },
  { q: 'Does Maxmatrix support GST invoicing?', a: 'Fully. Add your GSTIN and every invoice automatically calculates CGST, SGST and IGST, with HSN/SAC support and compliant PDF exports.' },
  { q: 'Can I control what my team members can see?', a: 'Yes. Role-based access ships by default — Admins manage everything, Managers run daily operations, and Employees get scoped read access.' },
  { q: 'What does it cost?', a: 'Starter is free forever for small teams. Business is ₹999/month with unlimited users and every module. No hidden charges, cancel anytime.' },
];

function SectionHead({ eyebrow, title, sub, center = true }) {
  return (
    <Reveal className={`max-w-2xl mb-12 ${center ? 'mx-auto text-center' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-3">{eyebrow}</p>
      <h2 className="text-[30px] sm:text-[38px] leading-[1.15] tracking-display text-ink" style={{ fontWeight: 500 }}>
        {title}
      </h2>
      {sub && <p className="text-[15px] text-ink-muted mt-4 leading-relaxed">{sub}</p>}
    </Reveal>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-lg bg-surface overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-sm font-medium text-ink">{q}</span>
        <ChevronDown size={16} className={`text-ink-subtle shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-ink-muted leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#modules', label: 'Modules' },
    { href: '#why', label: 'Why Maxmatrix' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-line">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          <Link to="/"><Logo size="md" /></Link>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-[13px] font-medium text-ink-muted hover:text-ink transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost !p-2" title="Toggle theme">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/login" className="btn-secondary !py-1.5">Login</Link>
            <Link to="/signup" className="btn-primary !py-1.5">Start Free</Link>
          </div>

          <button className="md:hidden text-ink-muted" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-line bg-surface px-5 py-4 space-y-3">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block text-sm text-ink-muted">{l.label}</a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary flex-1">Login</Link>
              <Link to="/signup" className="btn-primary flex-1">Start Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero — dark, cinematic, the way Zoho opens an ERP page */}
      <section className="relative overflow-hidden bg-[#0B1017]">
        {/* Depth: a soft blue wash bleeding up from behind the product shot */}
        <div
          className="absolute inset-x-0 bottom-0 h-[70%] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(65,153,234,0.22), transparent 70%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, #000, transparent 75%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-0 sm:pt-24 text-center">
          <Reveal delay={80}>
            <h1 className="text-[40px] sm:text-[58px] leading-[1.08] tracking-display text-white max-w-3xl mx-auto" style={{ fontWeight: 500 }}>
              A new era of ERP software
              <br />
              <span className="text-primary-pale">for growing Indian businesses.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-[17px] text-white/55 mt-7 max-w-2xl mx-auto leading-relaxed">
              Inventory, GST billing, customers, employees and analytics, unified in a single
              enterprise workspace. Your company is provisioned in under a minute.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link to="/signup" className="btn-primary !px-7 !py-3 w-full sm:w-auto">
                Start Free <ArrowRight size={16} />
              </Link>
              <a
                href="#contact"
                className="btn !px-7 !py-3 w-full sm:w-auto text-white bg-white/[0.08] border border-white/15 hover:bg-white/[0.14]"
              >
                Book Demo
              </a>
            </div>
          </Reveal>

          {/* Product preview, lifted into the section below */}
          <Reveal delay={320}>
          <div className="mt-16 -mb-24 rounded-xl border border-white/10 bg-[#0F141B] shadow-raised overflow-hidden text-left max-w-4xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.07] bg-white/[0.03]">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="text-[11px] text-white/40 ml-2">Maxmatrix — Dashboard</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  ["Today's Revenue", '₹15,450'],
                  ['Monthly Revenue', '₹8,75,000'],
                  ['Inventory Value', '₹12,45,000'],
                  ['Pending Payments', '₹2,35,000'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3">
                    <p className="text-[10px] text-white/40">{label}</p>
                    <p className="text-sm font-semibold text-white mt-1 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <div className="h-28 rounded-md border border-white/[0.07] bg-white/[0.02] flex items-end gap-1.5 p-3">
                {[35, 52, 44, 68, 55, 78, 64, 88, 72, 96, 84, 92].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: 'linear-gradient(180deg, rgb(var(--primary)), rgb(var(--primary-deep)))',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="pt-40 pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          <SectionHead
            eyebrow="Features"
            title="Everything a modern business needs"
            sub="Stop reconciling spreadsheets and disconnected apps. Maxmatrix unifies your operations."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-line-strong transition-colors">
                <div className="h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center mb-4">
                  <f.icon size={18} />
                </div>
                <h3 className="text-[15px] font-semibold text-ink mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-20 px-5 bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow="ERP Modules" title="One platform, every department" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {modules.map((m) => (
              <div key={m.name} className="rounded-lg border border-line bg-canvas p-5 flex flex-col items-center gap-2.5 text-center hover:border-line-strong transition-colors">
                <m.icon size={22} className="text-primary" strokeWidth={1.8} />
                <span className="text-[13px] font-medium text-ink">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionHead
            eyebrow="Why Maxmatrix"
            title="Built different, on purpose"
            sub="Not another admin panel — an enterprise platform engineered for how Indian businesses actually operate."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            {whyPoints.map((w) => (
              <div key={w.title} className="card flex gap-4">
                <div className="h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <w.icon size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-ink mb-1.5">{w.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics preview */}
      <section className="py-20 px-5 bg-surface border-y border-line">
        <div className="max-w-4xl mx-auto">
          <SectionHead
            eyebrow="Analytics"
            title="Your numbers, always in focus"
            sub="Revenue, sales velocity, inventory valuation and outstanding payments — live, in ₹, on every screen."
          />
          <div className="rounded-lg border border-line bg-canvas p-5">
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                ['Monthly Revenue', '₹8,75,000', '+12.4%'],
                ['Invoices This Month', '312', '+8.1%'],
                ['Inventory Value', '₹12,45,000', '+3.9%'],
              ].map(([label, value, trend]) => (
                <div key={label} className="rounded-md border border-line bg-surface p-4">
                  <p className="text-[11px] text-ink-subtle">{label}</p>
                  <div className="flex items-end justify-between mt-1.5">
                    <p className="text-lg font-semibold text-ink font-display tabular-nums">{value}</p>
                    <span className="text-[11px] font-medium text-success">{trend}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-36 rounded-md border border-line bg-surface flex items-end gap-1.5 p-4">
              {[28, 42, 36, 55, 48, 66, 58, 74, 62, 84, 78, 92, 70, 88, 96, 82, 100, 90].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-primary/75" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionHead
            eyebrow="Pricing"
            title="Simple, transparent pricing"
            sub="Start free. Upgrade as you grow. All prices in Indian Rupees, inclusive of updates."
          />
          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`card flex flex-col relative ${p.highlight ? '!border-primary shadow-raised' : ''}`}
              >
                {p.highlight && (
                  <span className="absolute -top-2.5 left-5 bg-primary text-ink-invert text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[15px] font-semibold text-ink mt-1">{p.name}</h3>
                <p className="text-xs text-ink-subtle mt-1">{p.desc}</p>
                <div className="mt-5 mb-6 flex items-baseline gap-2">
                  <span className="text-[32px] font-display font-medium tracking-display text-ink tabular-nums">{p.price}</span>
                  <span className="text-xs text-ink-subtle">{p.period}</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <Check size={15} className="text-success mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.name === 'Enterprise' ? '#contact' : '/signup'}
                  className={`${p.highlight ? 'btn-primary' : 'btn-secondary'} w-full mt-7`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-5 bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow="Customers" title="Trusted by growing Indian businesses" />
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-lg border border-line bg-canvas p-6">
                <p className="text-sm text-ink-muted leading-relaxed">“{t.text}”</p>
                <div className="mt-5 pt-4 border-t border-line">
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-subtle mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <SectionHead eyebrow="FAQ" title="Frequently asked questions" />
          <div className="space-y-2.5">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-20 px-5">
        <div className="max-w-4xl mx-auto rounded-xl border border-line bg-[#0E1B2C] dark:bg-surface p-10 sm:p-14 text-center">
          <h2 className="text-[28px] sm:text-[32px] font-display font-medium tracking-display text-white dark:text-ink tracking-tight">
            Ready to modernise your operations?
          </h2>
          <p className="text-white/60 dark:text-ink-muted mt-4 max-w-xl mx-auto leading-relaxed">
            Create your company workspace in under a minute — free, no card required.
            Or book a demo and we'll walk your team through it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/signup" className="btn-primary !px-6 !py-2.5 w-full sm:w-auto">
              Start Free <ArrowRight size={16} />
            </Link>
            <a
              href="mailto:max0matrixx@gmail.com"
              className="btn !px-6 !py-2.5 w-full sm:w-auto bg-white/10 text-white border border-white/20 hover:bg-white/15 dark:bg-surface-2 dark:text-ink dark:border-line dark:hover:bg-surface-3"
            >
              Book Demo
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 mt-9 text-[13px] text-white/50 dark:text-ink-subtle">
            <span className="inline-flex items-center gap-2"><Mail size={13} /> max0matrixx@gmail.com</span>
            <span className="inline-flex items-center gap-2"><Phone size={13} /> +91 73491 69925</span>
            <span className="inline-flex items-center gap-2"><MapPin size={13} /> Bengaluru, India</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Logo withSubtitle />
          <div className="flex items-center gap-6 text-[13px] text-ink-muted">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-ink transition-colors">{l.label}</a>
            ))}
          </div>
          <p className="text-xs text-ink-subtle">© {new Date().getFullYear()} Maxmatrix</p>
        </div>
      </footer>
    </div>
  );
}
