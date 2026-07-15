/**
 * Chart palette + axis/tooltip styling that tracks the active theme.
 * Recharts needs concrete color strings, so we resolve the CSS variables here.
 */
export function getChartTheme(isDark) {
  return {
    grid: isDark ? '#26303C' : '#E5EAF1',
    axis: isDark ? '#6B7C8F' : '#7A8CA0',
    axisLine: isDark ? '#33404F' : '#DCE3EC',
    series: isDark
      ? ['#EB4C4C', '#2DA6A4', '#A78BFA', '#D98A2B', '#2FA36B']
      : ['#D62828', '#0E7C7B', '#7C5CD6', '#B45309', '#0E7C4A'],
    areaFrom: isDark ? 'rgba(235,76,76,0.28)' : 'rgba(214,40,40,0.16)',
    areaTo: isDark ? 'rgba(235,76,76,0)' : 'rgba(214,40,40,0)',
    cursor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(14,27,44,0.04)',
    tooltip: {
      background: isDark ? '#1A222D' : '#FFFFFF',
      border: `1px solid ${isDark ? '#33404F' : '#DCE3EC'}`,
      borderRadius: 8,
      fontSize: 12,
      color: isDark ? '#E8EDF3' : '#0E1B2C',
      boxShadow: isDark
        ? '0 16px 40px rgba(0,0,0,0.45)'
        : '0 16px 40px rgba(15,35,60,0.12)',
    },
  };
}
