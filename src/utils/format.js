/**
 * India-first formatting helpers. INR is the platform default currency and
 * DD/MM/YYYY the default date format, per the MAXMATRIX localization spec.
 * Kept in one place so every screen renders money and dates identically.
 */

const inrCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const inrCurrency0 = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrNumber = new Intl.NumberFormat('en-IN');

/** ₹1,25,000.00 — full precision, Indian grouping. */
export const formatCurrency = (value) => inrCurrency.format(Number(value || 0));

/** ₹1,25,000 — no paise, for dashboard cards and compact figures. */
export const formatCurrencyShort = (value) => inrCurrency0.format(Number(value || 0));

/** 1,25,000 — Indian digit grouping without the ₹ symbol. */
export const formatNumber = (value) => inrNumber.format(Number(value || 0));

/** DD/MM/YYYY (e.g. 14/07/2026). */
export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

/** DD Mon YYYY (e.g. 14 Jul 2026) — for headers and reports. */
export const formatDateLong = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/** DD/MM/YYYY, HH:MM — for audit trails and timestamps. */
export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/** Relative "2h ago" style, falling back to a date for anything older than a week. */
export const formatRelative = (value) => {
  if (!value) return '—';
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatDate(value);
};
