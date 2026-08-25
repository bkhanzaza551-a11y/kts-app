export const formatPrice = (price, symbol = '') => {
  if (price == null) return '--';
  const num = parseFloat(price);
  if (symbol.includes('JPY')) return num.toFixed(2);
  if (num > 1000) return num.toFixed(2);
  return num.toFixed(5);
};

export const formatPips = (pips) => {
  if (pips == null) return '--';
  const num = parseFloat(pips);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)} pips`;
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null) return '--';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${parseFloat(amount).toFixed(2)}`;
  }
};

export const formatDate = (date, format = 'short') => {
  if (!date) return '--';
  const d = new Date(date);
  if (format === 'short') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (format === 'time') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (format === 'full') return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  if (format === 'datetime') {
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString();
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date, 'short');
};

export const formatWinRate = (wins, total) => {
  if (!total) return '0%';
  return `${((wins / total) * 100).toFixed(1)}%`;
};
