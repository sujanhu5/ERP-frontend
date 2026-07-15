/**
 * Enterprise KPI tile: label, value, and a restrained tinted icon.
 * Numbers run in tabular-nums monospace, AWS-console style, so digits align
 * across a row of cards instead of jittering with the proportional font.
 * tone: 'default' | 'success' | 'warning' | 'danger'
 */
const TONES = {
  default: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

export default function StatCard({ icon: Icon, label, value, tone = 'default', trend }) {
  return (
    <div className="card !p-4 flex items-start justify-between gap-3 hover:border-line-strong transition-colors">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle truncate">{label}</p>
        <p className="text-xl font-semibold text-ink truncate mt-1.5 font-mono tabular-nums tracking-tight">{value}</p>
        {trend != null && (
          <p className={`text-[11px] font-medium mt-1 tabular-nums ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </p>
        )}
      </div>
      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${TONES[tone]}`}>
        <Icon size={16} />
      </div>
    </div>
  );
}
