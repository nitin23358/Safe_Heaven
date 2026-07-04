export function getRiskColor(level) {
  if (level === 'low') return '#22c55e';
  if (level === 'medium') return '#f59e0b';
  return '#ef4444';
}

export function getRiskLabel(level) {
  if (level === 'low') return 'Low Risk';
  if (level === 'medium') return 'Moderate Risk';
  return 'High Risk';
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

export function renderStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export function getSafetyColor(score) {
  if (score >= 7) return '#22c55e';
  if (score >= 4) return '#f59e0b';
  return '#ef4444';
}
