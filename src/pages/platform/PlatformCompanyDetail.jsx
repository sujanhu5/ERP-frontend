import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Package, Users, UserCheck, FileText, IndianRupee,
  TriangleAlert, Boxes, Building2,
} from 'lucide-react';
import { platformService } from '../../services';
import { Skeleton } from '../../components/common/Spinner';

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const date = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const statusBadge = {
  active: 'badge-success',
  suspended: 'badge-warning',
  deleted: 'badge-danger',
};

function Stat({ icon: Icon, label, value, tone = 'p' }) {
  const tones = {
    p: 'bg-primary-soft text-primary',
    s: 'bg-success-soft text-success',
    w: 'bg-warning-soft text-warning',
  };
  return (
    <div className="card !p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-ink-muted truncate">{label}</p>
        <p className="text-lg font-semibold text-ink mt-1 tabular-nums truncate">{value}</p>
      </div>
      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={16} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-line last:border-0">
      <span className="text-xs text-ink-muted shrink-0">{label}</span>
      <span className="text-sm text-ink font-medium text-right">{value || '—'}</span>
    </div>
  );
}

export default function PlatformCompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await platformService.company(id);
        setCompany(data.data);
      } catch {
        toast.error('Failed to load company.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[72px]" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card text-center py-14">
        <Building2 size={26} className="text-ink-subtle mx-auto mb-3" />
        <p className="text-sm text-ink">Company not found.</p>
        <Link to="/platform/companies" className="btn-secondary mt-5">
          <ArrowLeft size={15} /> Back to companies
        </Link>
      </div>
    );
  }

  const s = company.settings || {};
  const address = [s.building, s.area, s.city, s.district, s.state, s.pincode]
    .filter(Boolean).join(', ');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Link to="/platform/companies" className="btn-ghost !p-2 mt-0.5">
            <ArrowLeft size={17} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-semibold text-ink truncate">{company.name}</h2>
              <span className={`${statusBadge[company.status]} capitalize`}>{company.status}</span>
              <span className="badge-neutral capitalize">{company.plan}</span>
            </div>
            <p className="text-sm text-ink-subtle mt-1">
              {company.business_type || 'Business'} · joined {date(company.created_at)} · /{company.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Rollups */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Stat icon={IndianRupee} label="Revenue" value={inr(company.stats.revenue)} tone="s" />
        <Stat icon={FileText} label="Invoices" value={company.stats.invoices} />
        <Stat icon={Package} label="Products" value={company.stats.products} />
        <Stat icon={Users} label="Customers" value={company.stats.customers} />
        <Stat icon={UserCheck} label="Employees" value={company.stats.employees} />
        <Stat
          icon={TriangleAlert}
          label="Low Stock"
          value={company.stats.lowStock}
          tone={company.stats.lowStock > 0 ? 'w' : 'p'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Company profile */}
        <section className="panel">
          <div className="px-5 py-3 border-b border-line">
            <h3 className="text-[13px] font-semibold text-ink">Company Profile</h3>
          </div>
          <div className="px-5 py-2">
            <Row label="Legal name" value={s.company_name || company.name} />
            <Row label="GSTIN" value={s.gstin || company.gstin} />
            <Row label="PAN" value={s.pan} />
            <Row label="Email" value={s.email || company.email} />
            <Row label="Phone" value={s.phone || company.phone} />
            <Row label="Address" value={address} />
            <Row label="Country" value={s.country || company.country} />
            <Row label="Currency" value={s.currency || 'INR'} />
            <Row label="Timezone" value={s.timezone || 'Asia/Kolkata'} />
            <Row label="Inventory value" value={inr(company.stats.inventoryValue)} />
          </div>
        </section>

        {/* Users */}
        <section className="panel">
          <div className="px-5 py-3 border-b border-line flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink">Users</h3>
            <span className="text-xs text-ink-subtle tabular-nums">{company.users.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Last login</th></tr></thead>
              <tbody>
                {company.users.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-ink-subtle py-8">No users in this company.</td></tr>
                )}
                {company.users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="text-ink font-medium">{u.name}</span>
                      <span className="block text-xs text-ink-subtle truncate">{u.email}</span>
                    </td>
                    <td><span className="badge-neutral capitalize">{u.role}</span></td>
                    <td>
                      <span className={u.is_active ? 'badge-success' : 'badge-neutral'}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-xs tabular-nums">
                      {u.last_login ? new Date(u.last_login).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      }) : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="text-xs text-ink-subtle flex items-center gap-1.5">
        <Boxes size={13} />
        Figures are read directly from this company's isolated tenant data.
      </p>
    </div>
  );
}
