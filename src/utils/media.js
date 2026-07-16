export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = import.meta.env.VITE_API_URL || '';
  const backendBase = apiBase.replace(/\/api$/, '');
  return backendBase + url;
}
